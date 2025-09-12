import mongoose, { Schema, model, models } from 'mongoose'
import { News as INews } from '@/types'

const NewsSchema = new Schema<INews>({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode ter mais que 200 caracteres'],
  },
  title_i18n: {
    type: Object,
    default: {},
  },
  slug: {
    type: String,
    required: [true, 'Slug é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-z0-9-]+$/,
      'Slug deve conter apenas letras minúsculas, números e hífens',
    ],
  },
  slug_i18n: {
    type: Object,
    default: {},
  },
  content: {
    type: String,
    required: [true, 'Conteúdo é obrigatório'],
    trim: true,
  },
  content_i18n: {
    type: Object,
    default: {},
  },
  excerpt: {
    type: String,
    required: [true, 'Resumo é obrigatório'],
    trim: true,
    maxlength: [300, 'Resumo não pode ter mais que 300 caracteres'],
  },
  excerpt_i18n: {
    type: Object,
    default: {},
  },
  featuredImage: {
    type: String,
    required: [true, 'Imagem de destaque é obrigatória'],
  },
  images: {
    type: [String],
    default: [],
    validate: [
      {
        validator: function(images: string[]) {
          return images.length <= 20
        },
        message: 'Máximo de 20 imagens adicionais'
      }
    ]
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Autor é obrigatório'],
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: ['news', 'events', 'tips', 'market'],
    default: 'news',
  },
  tags: {
    type: [String],
    default: [],
    validate: [
      {
        validator: function(tags: string[]) {
          return tags.length <= 15
        },
        message: 'Máximo de 15 tags'
      }
    ]
  },
  published: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Visualizações não podem ser negativas'],
  },
  publishedAt: {
    type: Date,
    required: false,
  },
  meta_i18n: {
    type: Object,
    default: {},
  }
}, {
  timestamps: true,
  collection: 'news',
})

// Índices para performance e busca
NewsSchema.index({ title: 'text', content: 'text', excerpt: 'text' })
NewsSchema.index({ category: 1, published: 1 })
NewsSchema.index({ author: 1, published: 1 })
NewsSchema.index({ published: 1, featured: 1, publishedAt: -1 })
NewsSchema.index({ publishedAt: -1 })
NewsSchema.index({ tags: 1 })
NewsSchema.index({ views: -1 })
NewsSchema.index({ createdAt: -1 })

// Virtual para categoria em português
NewsSchema.virtual('categoryText').get(function (this: INews) {
  const categoryMap = {
    news: 'Notícias',
    events: 'Eventos',
    tips: 'Dicas',
    market: 'Mercado'
  }
  return categoryMap[this.category]
})

// Virtual para tempo de leitura estimado
NewsSchema.virtual('readTime').get(function (this: INews) {
  const wordsPerMinute = 200
  const wordCount = this.content.split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} min de leitura`
})

// Virtual para data formatada
NewsSchema.virtual('publishedAtFormatted').get(function (this: INews) {
  if (!this.publishedAt) return null
  return new Intl.DateTimeFormat('pt-AO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(this.publishedAt)
})

// Virtual para URL da notícia
NewsSchema.virtual('url').get(function (this: INews) {
  return `/noticias/${this.slug}`
})

// Middleware para gerar slug automaticamente
NewsSchema.pre('save', function (this: any, next: (err?: any) => void) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

// Middleware para definir publishedAt quando published for true
NewsSchema.pre('save', function (this: any, next: (err?: any) => void) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

// Middleware para validar autor antes de salvar
NewsSchema.pre('save', async function (this: any, next: (err?: any) => void) {
  if (this.isModified('author')) {
    const User = mongoose.models.User
    if (User) {
      const author = await User.findById(this.author)
      if (!author || !author.isActive) {
        next(new Error('Autor inválido ou inativo'))
        return
      }
    }
  }
  next()
})

// Método estático para buscar notícias publicadas
NewsSchema.statics.findPublished = function (limit?: number) {
  const query = this.find({ published: true })
    .populate('author', 'name avatar')
    .sort({ publishedAt: -1 })
  
  if (limit) {
    query.limit(limit)
  }
  
  return query
}

// Método estático para buscar notícias em destaque
NewsSchema.statics.findFeatured = function (limit = 3) {
  return this.find({ 
    published: true, 
    featured: true 
  })
  .populate('author', 'name avatar')
  .sort({ publishedAt: -1 })
  .limit(limit)
}

// Método estático para buscar por categoria
NewsSchema.statics.findByCategory = function (category: string, limit?: number) {
  const query = this.find({ 
    published: true, 
    category 
  })
  .populate('author', 'name avatar')
  .sort({ publishedAt: -1 })
  
  if (limit) {
    query.limit(limit)
  }
  
  return query
}

// Método estático para buscar notícias relacionadas
NewsSchema.statics.findRelated = function (newsId: string, tags: string[], limit = 3) {
  return this.find({
    _id: { $ne: newsId },
    published: true,
    tags: { $in: tags }
  })
  .populate('author', 'name avatar')
  .sort({ publishedAt: -1 })
  .limit(limit)
}

// Método para incrementar visualizações
NewsSchema.methods.incrementViews = function () {
  this.views += 1
  return this.save()
}

const News = models.News || model<INews>('News', NewsSchema)

export default News
