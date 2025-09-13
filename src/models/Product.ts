import mongoose, { Schema, model, models, Model } from 'mongoose'
import { Product as IProduct } from '@/types'

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais que 100 caracteres'],
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [1000, 'Descrição não pode ter mais que 1000 caracteres'],
  },
  breed: {
    type: String,
    required: [true, 'Raça é obrigatória'],
    trim: true,
    enum: [
      'Landrace',
      'Large White',
      'Duroc',
      'Hampshire',
      'Pietrain',
      'Yorkshire',
      'Chester White',
      'Spotted',
      'Tamworth',
      'Gloucester Old Spots',
      'Mangalitsa',
      'Ossabaw Island Hog',
      'Mulefoot',
      'Caipira',
      'Piau',
      'Moura',
      'Canastra',
      'Cruzado',
      'Outro'
    ],
  },
  age: {
    type: Number,
    required: [true, 'Idade é obrigatória'],
    min: [0, 'Idade não pode ser negativa'],
    max: [120, 'Idade não pode ser maior que 120 meses'],
  },
  weight: {
    type: Number,
    required: [true, 'Peso é obrigatório'],
    min: [1, 'Peso deve ser maior que 1kg'],
    max: [500, 'Peso não pode ser maior que 500kg'],
  },
  price: {
    type: Number,
    required: false,
    min: [0, 'Preço não pode ser negativo'],
  },
  pricePerKg: {
    type: Number,
    required: false,
    min: [0, 'Preço por kg não pode ser negativo'],
  },
  saleForm: {
    type: String,
    enum: ['carcaça', 'vivo'],
    required: false,
  },
  images: {
    type: [String],
    required: [true, 'Pelo menos uma imagem é obrigatória'],
    validate: [
      {
        validator: function(images: string[]) {
          return images.length > 0 && images.length <= 10
        },
        message: 'Deve ter entre 1 e 10 imagens'
      }
    ]
  },
  videos: {
    type: [String],
    default: [],
    validate: [
      {
        validator: function(videos: string[]) {
          return videos.length <= 10
        },
        message: 'Máximo de 10 vídeos'
      }
    ]
  },
  features: {
    type: [String],
    default: [],
    validate: [
      {
        validator: function(features: string[]) {
          return features.length <= 20
        },
        message: 'Máximo de 20 características'
      }
    ]
  },
  healthStatus: {
    type: String,
    required: [true, 'Status de saúde é obrigatório'],
    enum: ['excellent', 'good', 'fair'],
    default: 'good',
  },
  vaccinated: {
    type: Boolean,
    required: [true, 'Status de vacinação é obrigatório'],
    default: false,
  },
  location: {
    type: String,
    required: [true, 'Localização é obrigatória'],
    trim: true,
    maxlength: [100, 'Localização não pode ter mais que 100 caracteres'],
  },
  code: {
    type: String,
    unique: true,
    required: [true, 'Código do produto é obrigatório'],
    trim: true,
    maxlength: [20, 'Código não pode ter mais que 20 caracteres'],
  },
  availability: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available',
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendedor é obrigatório'],
  },
  tags: {
    type: [String],
    default: [],
    validate: [
      {
        validator: function(tags: string[]) {
          return tags.length <= 10
        },
        message: 'Máximo de 10 tags'
      }
    ]
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'products',
})

// Índices para performance e busca
ProductSchema.index({ name: 'text', description: 'text', breed: 'text', location: 'text' })
ProductSchema.index({ breed: 1, availability: 1, isActive: 1 })
ProductSchema.index({ price: 1, availability: 1, isActive: 1 })
ProductSchema.index({ pricePerKg: 1, availability: 1, isActive: 1 })
ProductSchema.index({ saleForm: 1, availability: 1, isActive: 1 })
ProductSchema.index({ age: 1, weight: 1 })
ProductSchema.index({ seller: 1, isActive: 1 })
ProductSchema.index({ createdAt: -1 })
ProductSchema.index({ tags: 1 })
ProductSchema.index({ location: 1, availability: 1 })

// Virtual para status de disponibilidade em português
ProductSchema.virtual('availabilityText').get(function (this: IProduct) {
  const statusMap = {
    available: 'Disponível',
    sold: 'Vendido',
    reserved: 'Reservado'
  }
  return statusMap[this.availability]
})

// Virtual para status de saúde em português
ProductSchema.virtual('healthStatusText').get(function (this: IProduct) {
  const statusMap = {
    excellent: 'Excelente',
    good: 'Bom',
    fair: 'Regular'
  }
  return statusMap[this.healthStatus]
})

// Virtual para idade formatada
ProductSchema.virtual('ageFormatted').get(function (this: IProduct) {
  if (this.age === 1) return '1 mês'
  if (this.age < 12) return `${this.age} meses`
  const years = Math.floor(this.age / 12)
  const months = this.age % 12
  if (months === 0) {
    return years === 1 ? '1 ano' : `${years} anos`
  }
  return `${years} ano${years > 1 ? 's' : ''} e ${months} mês${months > 1 ? 'es' : ''}`
})

// Virtual para preço formatado
ProductSchema.virtual('priceFormatted').get(function (this: IProduct) {
  if (!this.price) return 'Preço sob consulta'
  // Mantém AOA como fallback para evitar dependência de config no model
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA'
  }).format(this.price)
})

// Método estático para busca avançada
ProductSchema.statics.findWithFilters = function (filters: any) {
  const query: any = { isActive: true }
  
  if (filters.breed) query.breed = filters.breed
  if (filters.availability) query.availability = filters.availability
  if (filters.healthStatus) query.healthStatus = filters.healthStatus
  if (filters.vaccinated !== undefined) query.vaccinated = filters.vaccinated
  if (filters.location) query.location = new RegExp(filters.location, 'i')
  
  if (filters.minAge || filters.maxAge) {
    query.age = {}
    if (filters.minAge) query.age.$gte = filters.minAge
    if (filters.maxAge) query.age.$lte = filters.maxAge
  }
  
  if (filters.minWeight || filters.maxWeight) {
    query.weight = {}
    if (filters.minWeight) query.weight.$gte = filters.minWeight
    if (filters.maxWeight) query.weight.$lte = filters.maxWeight
  }
  
  if (filters.minPrice || filters.maxPrice) {
    query.price = {}
    if (filters.minPrice) query.price.$gte = filters.minPrice
    if (filters.maxPrice) query.price.$lte = filters.maxPrice
  }
  
  return this.find(query).populate('seller', 'name email phone company')
}

// Método estático para produtos em destaque
ProductSchema.statics.findFeatured = function (limit = 6) {
  return this.find({ 
    isActive: true, 
    availability: 'available' 
  })
  .populate('seller', 'name email phone company')
  .sort({ createdAt: -1 })
  .limit(limit)
}

// Método estático para gerar código automático
ProductSchema.statics.generateCode = async function (breed: string) {
  const year = new Date().getFullYear()
  const lastProduct = await this.findOne({ 
    code: { $regex: `^${breed.toUpperCase()}-${year}-` } 
  }).sort({ code: -1 })
  
  let sequence = 1
  if (lastProduct && lastProduct.code) {
    const lastSequence = parseInt(lastProduct.code.split('-')[2])
    sequence = lastSequence + 1
  }
  
  return `${breed.toUpperCase()}-${year}-${sequence.toString().padStart(3, '0')}`
}

// Middleware para validar seller antes de salvar
ProductSchema.pre('save', async function (next) {
  // Normalização de pricePerKg: converter AOA/cabeça -> AOA/kg sempre que possível
  try {
    const self: any = this as any
    const hasValidWeight = typeof self.weight === 'number' && self.weight > 0
    const hasPrice = typeof self.price === 'number' && self.price >= 0
    if (hasValidWeight) {
      if (hasPrice) {
        self.pricePerKg = self.price / self.weight
      } else if (typeof self.pricePerKg !== 'number' && self.pricePerKg != null) {
        // noop: já tem pricePerKg definido
      }
    }
  } catch (e) {
    // segue sem bloquear caso cálculo falhe
  }
  if (this.isModified('seller')) {
    const User = mongoose.models.User
    if (User) {
      const seller = await User.findById(this.seller)
      if (!seller || !seller.isActive) {
        next(new Error('Vendedor inválido ou inativo'))
        return
      }
    }
  }
  next()
})

// Normalização também em updates atômicos
ProductSchema.pre('findOneAndUpdate', function (next) {
  try {
    const update: any = (this as any).getUpdate() || {}
    const $set = update.$set || update
    const weight = $set.weight ?? update.weight
    const price = $set.price ?? update.price
    const pricePerKg = $set.pricePerKg ?? update.pricePerKg
    // Se tivermos weight e price, recalcula pricePerKg
    if (typeof weight === 'number' && weight > 0 && typeof price === 'number' && price >= 0) {
      const computed = price / weight
      if (update.$set) update.$set.pricePerKg = computed; else update.pricePerKg = computed
    } else if (typeof weight === 'number' && weight > 0 && typeof pricePerKg === 'number' && pricePerKg >= 0) {
      // Se veio pricePerKg e weight, não força price
    }
  } catch (e) {
    // ignora erros de computação
  }
  next()
})

interface ProductModel extends Model<IProduct> {
  findWithFilters(filters: any): Promise<IProduct[]>
  findFeatured(limit?: number): Promise<IProduct[]>
  generateCode(breed: string): Promise<string>
}

const Product = (models.Product as unknown as ProductModel) || model<IProduct, ProductModel>('Product', ProductSchema)

export default Product
