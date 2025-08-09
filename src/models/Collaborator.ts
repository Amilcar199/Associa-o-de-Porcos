import mongoose, { Schema, model, models } from 'mongoose'
import { Collaborator as ICollaborator } from '@/types'

const SocialMediaSchema = new Schema({
  linkedin: {
    type: String,
    required: false,
    match: [
      /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
      'URL do LinkedIn inválida',
    ],
  },
  instagram: {
    type: String,
    required: false,
    match: [
      /^https?:\/\/(www\.)?instagram\.com\/.*$/,
      'URL do Instagram inválida',
    ],
  },
  facebook: {
    type: String,
    required: false,
    match: [
      /^https?:\/\/(www\.)?facebook\.com\/.*$/,
      'URL do Facebook inválida',
    ],
  },
}, { _id: false })

const CollaboratorSchema = new Schema<ICollaborator>({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais que 100 caracteres'],
  },
  role: {
    type: String,
    required: [true, 'Cargo/função é obrigatório'],
    trim: true,
    maxlength: [100, 'Cargo não pode ter mais que 100 caracteres'],
  },
  company: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Nome da empresa não pode ter mais que 100 caracteres'],
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais que 500 caracteres'],
  },
  avatar: {
    type: String,
    required: [true, 'Foto/avatar é obrigatório'],
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, insira um email válido',
    ],
  },
  phone: {
    type: String,
    required: false,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Por favor, insira um número de telefone válido',
    ],
  },
  website: {
    type: String,
    required: false,
    match: [
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      'Por favor, insira uma URL válida',
    ],
  },
  socialMedia: {
    type: SocialMediaSchema,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
    min: [0, 'Ordem não pode ser negativa'],
  },
}, {
  timestamps: true,
  collection: 'collaborators',
})

// Índices para performance
CollaboratorSchema.index({ name: 'text', role: 'text', company: 'text', description: 'text' })
CollaboratorSchema.index({ isActive: 1, featured: 1, order: 1 })
CollaboratorSchema.index({ featured: 1, order: 1 })
CollaboratorSchema.index({ order: 1 })
CollaboratorSchema.index({ createdAt: -1 })

// Virtual para nome completo com empresa
CollaboratorSchema.virtual('fullTitle').get(function (this: ICollaborator) {
  if (this.company) {
    return `${this.role} na ${this.company}`
  }
  return this.role
})

// Virtual para verificar se tem redes sociais
CollaboratorSchema.virtual('hasSocialMedia').get(function (this: ICollaborator) {
  if (!this.socialMedia) return false
  return !!(this.socialMedia.linkedin || this.socialMedia.instagram || this.socialMedia.facebook)
})

// Método estático para buscar colaboradores ativos
CollaboratorSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ order: 1, createdAt: -1 })
}

// Método estático para buscar colaboradores em destaque
CollaboratorSchema.statics.findFeatured = function (limit?: number) {
  const query = this.find({ 
    isActive: true, 
    featured: true 
  }).sort({ order: 1, createdAt: -1 })
  
  if (limit) {
    query.limit(limit)
  }
  
  return query
}

// Método estático para buscar colaboradores ordenados
CollaboratorSchema.statics.findOrdered = function () {
  return this.find({ isActive: true }).sort({ order: 1, name: 1 })
}

// Middleware para garantir ordem única por colaborador ativo
CollaboratorSchema.pre('save', async function (next) {
  if (this.isModified('order') && this.isActive) {
    // Verificar se já existe outro colaborador ativo com a mesma ordem
    const existingCollaborator = await (this.constructor as any).findOne({
      _id: { $ne: this._id },
      order: this.order,
      isActive: true
    })
    
    if (existingCollaborator) {
      // Incrementar a ordem de todos os colaboradores com ordem >= a nova ordem
      await (this.constructor as any).updateMany(
        {
          _id: { $ne: this._id },
          order: { $gte: this.order },
          isActive: true
        },
        { $inc: { order: 1 } }
      )
    }
  }
  next()
})

// Método para reordenar colaboradores
CollaboratorSchema.statics.reorder = async function (collaboratorIds: string[]) {
  const updates = collaboratorIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { order: index + 1 }
    }
  }))
  
  return this.bulkWrite(updates)
}

// Método para obter próxima ordem disponível
CollaboratorSchema.statics.getNextOrder = async function () {
  const lastCollaborator = await this.findOne({ isActive: true })
    .sort({ order: -1 })
    .select('order')
  
  return lastCollaborator ? lastCollaborator.order + 1 : 1
}

const Collaborator = models.Collaborator || model<ICollaborator>('Collaborator', CollaboratorSchema)

export default Collaborator
