import { Schema, model, models, Model } from 'mongoose'
import { Farm as IFarm, ProvinceStats } from '@/types'
import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'

const FarmSchema = new Schema<IFarm>({
  producerName: {
    type: String,
    required: [true, 'Nome do produtor é obrigatório'],
    trim: true,
    maxlength: [120, 'Nome do produtor não pode ter mais que 120 caracteres'],
  },
  farmName: {
    type: String,
    trim: true,
    maxlength: [120, 'Nome da fazenda não pode ter mais que 120 caracteres'],
  },
  province: {
    type: String,
    required: [true, 'Província é obrigatória'],
    trim: true,
    enum: {
      values: ANGOLA_PROVINCE_NAMES,
      message: 'Província inválida'
    }
  },
  municipality: {
    type: String,
    trim: true,
    maxlength: [120, 'Município não pode ter mais que 120 caracteres'],
  },
  coordinates: {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [30, 'Telefone inválido'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [120, 'Email inválido'],
  },
  herd: {
    total: {
      type: Number,
      required: [true, 'Quantidade total de porcos é obrigatória'],
      min: [0, 'Quantidade total não pode ser negativa'],
      max: [1000000, 'Quantidade total inválida'],
    },
    females: {
      type: Number,
      required: [true, 'Quantidade de fêmeas é obrigatória'],
      min: [0, 'Quantidade de fêmeas não pode ser negativa'],
      default: 0,
    },
    forSlaughter: {
      type: Number,
      required: [true, 'Quantidade disponível para abate é obrigatória'],
      min: [0, 'Quantidade para abate não pode ser negativa'],
      default: 0,
    },
    forBreeding: {
      type: Number,
      required: [true, 'Quantidade disponível para reprodução é obrigatória'],
      min: [0, 'Quantidade para reprodução não pode ser negativa'],
      default: 0,
    },
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Observações não podem ter mais que 500 caracteres'],
  },
  capacity: {
    type: Number,
    min: [0, 'Capacidade não pode ser negativa'],
    max: [1000000, 'Capacidade inválida'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Descrição não pode ter mais que 1000 caracteres'],
  },
  photos: {
    type: [String],
    default: [],
  },
  production: {
    sows: { type: Number, min: 0, default: 0 },
    boars: { type: Number, min: 0, default: 0 },
    fattening: { type: Number, min: 0, default: 0 },
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'farms',
})

// Índices para as agregações do mapa interativo
FarmSchema.index({ province: 1, status: 1, isActive: 1 })
FarmSchema.index({ status: 1, createdAt: -1 })
FarmSchema.index({ owner: 1 })

// Validação: cada subcategoria do rebanho não deve exceder o total informado
FarmSchema.pre('validate', function (next) {
  const herd = (this as any).herd
  if (herd) {
    const { total, females, forSlaughter, forBreeding } = herd
    if (typeof total === 'number') {
      if (typeof females === 'number' && females > total) {
        return next(new Error('Quantidade de fêmeas não pode ser maior que o total do rebanho'))
      }
      if (typeof forSlaughter === 'number' && forSlaughter > total) {
        return next(new Error('Quantidade disponível para abate não pode ser maior que o total do rebanho'))
      }
      if (typeof forBreeding === 'number' && forBreeding > total) {
        return next(new Error('Quantidade disponível para reprodução não pode ser maior que o total do rebanho'))
      }
    }
  }
  next()
})

// Estatísticas agregadas por província (apenas fazendas aprovadas e ativas)
FarmSchema.statics.getProvinceStats = async function (): Promise<ProvinceStats[]> {
  const results = await this.aggregate([
    { $match: { status: 'approved', isActive: true } },
    {
      $group: {
        _id: '$province',
        farmersCount: { $sum: 1 },
        totalPigs: { $sum: '$herd.total' },
        females: { $sum: '$herd.females' },
        forSlaughter: { $sum: '$herd.forSlaughter' },
        forBreeding: { $sum: '$herd.forBreeding' },
        capacity: { $sum: { $ifNull: ['$capacity', 0] } },
        sows: { $sum: { $ifNull: ['$production.sows', 0] } },
        boars: { $sum: { $ifNull: ['$production.boars', 0] } },
        fattening: { $sum: { $ifNull: ['$production.fattening', 0] } },
        municipalitySet: { $addToSet: '$municipality' },
      }
    },
    {
      $project: {
        _id: 0,
        province: '$_id',
        farmersCount: 1,
        totalPigs: 1,
        females: 1,
        forSlaughter: 1,
        forBreeding: 1,
        capacity: 1,
        sows: 1,
        boars: 1,
        fattening: 1,
        municipalities: {
          $size: {
            $filter: {
              input: '$municipalitySet',
              as: 'name',
              cond: { $gt: [{ $strLenCP: { $ifNull: ['$$name', ''] } }, 0] },
            },
          },
        },
      }
    },
    { $sort: { province: 1 } }
  ])

  return results as ProvinceStats[]
}

interface FarmModel extends Model<IFarm> {
  getProvinceStats(): Promise<ProvinceStats[]>
}

const Farm = (models.Farm as unknown as FarmModel) || model<IFarm, FarmModel>('Farm', FarmSchema)

export default Farm
