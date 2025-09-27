import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'visitor'],
    default: 'visitor'
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Telefone inválido']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Empresa não pode ter mais de 100 caracteres']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Biografia não pode ter mais de 500 caracteres']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Localização não pode ter mais de 100 caracteres']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Website deve começar com http:// ou https://']
  },
  socialMedia: {
    linkedin: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'LinkedIn deve ser uma URL válida']
    },
    twitter: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Twitter deve ser uma URL válida']
    },
    facebook: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Facebook deve ser uma URL válida']
    }
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    newsletter: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  
  // OTP para fluxos como recuperação de senha
  otpCode: {
    type: String,
    default: undefined
  },
  otpExpires: {
    type: Date,
    default: undefined
  },
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Índices para melhor performance
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Método para verificar se a conta está bloqueada
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Método para incrementar tentativas de login
userSchema.methods.incLoginAttempts = function() {
  // Se já passou o tempo de bloqueio, resetar tentativas
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Se chegou ao limite de tentativas, bloquear conta
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    Object.assign(updates, { $set: { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } }) // 2 horas
  }
  
  return this.updateOne(updates);
};

// Método para resetar tentativas de login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Método para gerar token de reset de senha
userSchema.methods.generatePasswordResetToken = function() {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hora
  return token;
};

// Método para verificar token de reset de senha
userSchema.methods.verifyPasswordResetToken = function(token: string) {
  return this.passwordResetToken === token && 
         this.passwordResetExpires > Date.now();
};

// Método para limpar token de reset de senha
userSchema.methods.clearPasswordResetToken = function() {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
};

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para obter dados públicos do usuário
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    avatar: this.avatar,
    role: this.role,
    company: this.company,
    bio: this.bio,
    location: this.location,
    website: this.website,
    socialMedia: this.socialMedia,
    createdAt: this.createdAt
  };
};

// Método estático para buscar usuário por email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Método estático para buscar usuários ativos
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Método estático para buscar usuários por role
userSchema.statics.findByRole = function(role: string) {
  return this.find({ role, isActive: true });
};

// Método estático para estatísticas de usuários
userSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        members: { $sum: { $cond: [{ $eq: ['$role', 'member'] }, 1, 0] } },
        visitors: { $sum: { $cond: [{ $eq: ['$role', 'visitor'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || { total: 0, active: 0, admins: 0, members: 0, visitors: 0 };
};

export default mongoose.models.User || mongoose.model('User', userSchema);
