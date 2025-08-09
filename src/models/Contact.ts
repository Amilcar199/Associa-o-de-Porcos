import mongoose, { Schema, model, models } from 'mongoose'
import { Contact as IContact } from '@/types'

const ContactSchema = new Schema<IContact>({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais que 100 caracteres'],
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
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
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Por favor, insira um número de telefone válido',
    ],
  },
  subject: {
    type: String,
    required: [true, 'Assunto é obrigatório'],
    trim: true,
    maxlength: [200, 'Assunto não pode ter mais que 200 caracteres'],
  },
  message: {
    type: String,
    required: [true, 'Mensagem é obrigatória'],
    trim: true,
    maxlength: [2000, 'Mensagem não pode ter mais que 2000 caracteres'],
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new',
  },
}, {
  timestamps: true,
  collection: 'contacts',
})

// Índices para performance
ContactSchema.index({ email: 1 })
ContactSchema.index({ status: 1, createdAt: -1 })
ContactSchema.index({ createdAt: -1 })
ContactSchema.index({ name: 'text', subject: 'text', message: 'text' })

// Virtual para status em português
ContactSchema.virtual('statusText').get(function (this: IContact) {
  const statusMap = {
    new: 'Novo',
    read: 'Lido',
    replied: 'Respondido',
    archived: 'Arquivado'
  }
  return statusMap[this.status]
})

// Virtual para data formatada
ContactSchema.virtual('createdAtFormatted').get(function (this: IContact) {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(this.createdAt)
})

// Virtual para preview da mensagem
ContactSchema.virtual('messagePreview').get(function (this: IContact) {
  if (this.message.length <= 100) return this.message
  return this.message.substring(0, 100) + '...'
})

// Método estático para buscar contatos por status
ContactSchema.statics.findByStatus = function (status: string) {
  return this.find({ status }).sort({ createdAt: -1 })
}

// Método estático para buscar contatos novos
ContactSchema.statics.findNew = function () {
  return this.find({ status: 'new' }).sort({ createdAt: -1 })
}

// Método estático para buscar contatos não arquivados
ContactSchema.statics.findActive = function () {
  return this.find({ status: { $ne: 'archived' } }).sort({ createdAt: -1 })
}

// Método estático para contar contatos por status
ContactSchema.statics.countByStatus = function () {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])
}

// Método estático para estatísticas de contato
ContactSchema.statics.getStats = async function () {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const startOfDay = new Date(now.setHours(0, 0, 0, 0))

  const [total, thisMonth, thisWeek, today, byStatus] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ createdAt: { $gte: startOfMonth } }),
    this.countDocuments({ createdAt: { $gte: startOfWeek } }),
    this.countDocuments({ createdAt: { $gte: startOfDay } }),
    this.countByStatus()
  ])

  const statusCounts = byStatus.reduce((acc: any, item: any) => {
    acc[item._id] = item.count
    return acc
  }, {})

  return {
    total,
    thisMonth,
    thisWeek,
    today,
    new: statusCounts.new || 0,
    read: statusCounts.read || 0,
    replied: statusCounts.replied || 0,
    archived: statusCounts.archived || 0
  }
}

// Método para marcar como lido
ContactSchema.methods.markAsRead = function () {
  if (this.status === 'new') {
    this.status = 'read'
    return this.save()
  }
  return Promise.resolve(this)
}

// Método para marcar como respondido
ContactSchema.methods.markAsReplied = function () {
  this.status = 'replied'
  return this.save()
}

// Método para arquivar
ContactSchema.methods.archive = function () {
  this.status = 'archived'
  return this.save()
}

// Método para restaurar
ContactSchema.methods.restore = function () {
  this.status = 'read'
  return this.save()
}

const Contact = models.Contact || model<IContact>('Contact', ContactSchema)

export default Contact
