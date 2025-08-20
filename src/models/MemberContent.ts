import mongoose, { Schema, model, models, Model } from 'mongoose'

export interface IMemberContent {
  title: string
  description: string
  type: 'document' | 'video' | 'article' | 'event'
  category: string
  url?: string
  thumbnail?: string
  content?: string
  fileUrl?: string
  videoUrl?: string
  eventDate?: Date
  eventLocation?: string
  isFeatured: boolean
  isActive: boolean
  author: mongoose.Types.ObjectId
  tags: string[]
  views: number
  downloads: number
  createdAt: Date
  updatedAt: Date
}

interface MemberContentModel extends Model<IMemberContent> {
  findActive(): Promise<IMemberContent[]>
  findFeatured(): Promise<IMemberContent[]>
  findByType(type: string): Promise<IMemberContent[]>
  findByCategory(category: string): Promise<IMemberContent[]>
}

const MemberContentSchema = new Schema<IMemberContent>({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode ter mais que 200 caracteres'],
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [1000, 'Descrição não pode ter mais que 1000 caracteres'],
  },
  type: {
    type: String,
    required: [true, 'Tipo é obrigatório'],
    enum: ['document', 'video', 'article', 'event'],
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    trim: true,
    maxlength: [100, 'Categoria não pode ter mais que 100 caracteres'],
  },
  url: {
    type: String,
    trim: true,
    maxlength: [500, 'URL não pode ter mais que 500 caracteres'],
  },
  thumbnail: {
    type: String,
    trim: true,
    maxlength: [500, 'URL da thumbnail não pode ter mais que 500 caracteres'],
  },
  content: {
    type: String,
    trim: true,
    maxlength: [10000, 'Conteúdo não pode ter mais que 10000 caracteres'],
  },
  fileUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'URL do arquivo não pode ter mais que 500 caracteres'],
  },
  videoUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'URL do vídeo não pode ter mais que 500 caracteres'],
  },
  eventDate: {
    type: Date,
  },
  eventLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Localização do evento não pode ter mais que 200 caracteres'],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Autor é obrigatório'],
  },
  tags: {
    type: [String],
    default: [],
    validate: [
      {
        validator: function(tags: string[]) {
          return tags.length <= 10
        },
        message: 'Máximo de 10 tags permitidas'
      }
    ]
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Visualizações não podem ser negativas'],
  },
  downloads: {
    type: Number,
    default: 0,
    min: [0, 'Downloads não podem ser negativos'],
  }
}, {
  timestamps: true,
  collection: 'member_content'
})

// Índices para performance
MemberContentSchema.index({ type: 1, category: 1 })
MemberContentSchema.index({ isActive: 1, isFeatured: 1 })
MemberContentSchema.index({ author: 1 })
MemberContentSchema.index({ createdAt: -1 })
MemberContentSchema.index({ title: 'text', description: 'text', content: 'text' })

// Virtual para tipo em português
MemberContentSchema.virtual('typeText').get(function(this: IMemberContent) {
  const typeMap = {
    document: 'Documento',
    video: 'Vídeo',
    article: 'Artigo',
    event: 'Evento'
  }
  return typeMap[this.type]
})

// Virtual para categoria em português
MemberContentSchema.virtual('categoryText').get(function(this: IMemberContent) {
  const categoryMap: { [key: string]: string } = {
    'Técnico': 'Técnico',
    'Educacional': 'Educacional',
    'Mercado': 'Mercado',
    'Evento': 'Evento',
    'Saúde': 'Saúde',
    'Genética': 'Genética',
    'Nutrição': 'Nutrição',
    'Sanidade': 'Sanidade',
    'Reprodução': 'Reprodução',
    'Comercial': 'Comercial'
  }
  return categoryMap[this.category] || this.category
})

// Virtual para data formatada
MemberContentSchema.virtual('createdAtFormatted').get(function(this: IMemberContent) {
  return new Intl.DateTimeFormat('pt-AO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(this.createdAt)
})

// Virtual para data do evento formatada
MemberContentSchema.virtual('eventDateFormatted').get(function(this: IMemberContent) {
  if (!this.eventDate) return null
  return new Intl.DateTimeFormat('pt-AO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(this.eventDate)
})

// Método estático para buscar conteúdo ativo
MemberContentSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 })
}

// Método estático para buscar conteúdo em destaque
MemberContentSchema.statics.findFeatured = function() {
  return this.find({ isActive: true, isFeatured: true }).sort({ createdAt: -1 })
}

// Método estático para buscar por tipo
MemberContentSchema.statics.findByType = function(type: string) {
  return this.find({ type, isActive: true }).sort({ createdAt: -1 })
}

// Método estático para buscar por categoria
MemberContentSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true }).sort({ createdAt: -1 })
}

// Método para incrementar visualizações
MemberContentSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Método para incrementar downloads
MemberContentSchema.methods.incrementDownloads = function() {
  this.downloads += 1
  return this.save()
}

const MemberContent = (models.MemberContent as MemberContentModel) || model<IMemberContent, MemberContentModel>('MemberContent', MemberContentSchema)

export default MemberContent