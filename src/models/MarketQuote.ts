import mongoose, { Schema, model, models } from 'mongoose'
import Product from '@/models/Product'
import ActivityLog from '@/models/ActivityLog'

const MIN_SAMPLES_REQUIRED = 5

const MarketQuoteSchema = new Schema({
  weekISO: { type: String, required: true }, // 2025-W37
  region: { type: String, required: true, trim: true },
  saleForm: { type: String, enum: ['carcaça', 'vivo'], required: true },
  status: { type: String, enum: ['draft', 'approved', 'archived'], default: 'draft', index: true },
  refPricePerKg: { type: Number, required: true, min: 0 },
  refPricePerHead: { type: Number, min: 0 },
  minSamples: { type: Number, required: true, min: 0, default: 0 },
  methodologyNote: { type: String, trim: true, maxlength: 1000 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  collection: 'market_quotes'
})

// Índices
MarketQuoteSchema.index({ weekISO: 1, region: 1, saleForm: 1, status: 1 }, { unique: true })
MarketQuoteSchema.index({ region: 1, saleForm: 1 })

export default models.MarketQuote || model('MarketQuote', MarketQuoteSchema)

// Validação: ao aprovar, exigir N mínimo de amostras recentes por região/forma
MarketQuoteSchema.pre('save', async function (next) {
  const self: any = this as any
  try {
    if (self.isModified('status') && self.status === 'approved') {
      if (typeof self.minSamples !== 'number' || self.minSamples < MIN_SAMPLES_REQUIRED) {
        return next(new Error(`minSamples deve ser >= ${MIN_SAMPLES_REQUIRED} para aprovação`))
      }
      const now = new Date()
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const matchStage: any = {
        $and: [
          { $or: [ { isActive: true }, { isActive: { $exists: false } } ] },
          { $or: [ { updatedAt: { $gte: sevenDaysAgo, $lte: now } }, { createdAt: { $gte: sevenDaysAgo, $lte: now } } ] },
          { $or: [ { availability: 'available' }, { availability: { $exists: false } } ] },
          { location: { $regex: new RegExp(self.region, 'i') } }
        ]
      }
      const pipeline: any[] = [ { $match: matchStage } ]
      if (self.saleForm === 'carcaça') {
        pipeline.push({ $addFields: { pricePerKg: { $ifNull: [ '$pricePerKg', { $cond: [ { $and: [ { $gt: ['$price', 0] }, { $gt: ['$weight', 0] } ] }, { $divide: ['$price', '$weight'] }, null ] } ] } } })
        pipeline.push({ $match: { pricePerKg: { $ne: null } } })
      } else {
        pipeline.push({ $match: { price: { $ne: null } } })
      }
      pipeline.push({ $count: 'ct' })
      const res = await (Product as any).aggregate(pipeline)
      const count = res?.[0]?.ct || 0
      if (count < self.minSamples) {
        return next(new Error(`Amostras insuficientes (${count}) para aprovação; mínimo requerido: ${self.minSamples}`))
      }
    }
    next()
  } catch (e: any) {
    next(e)
  }
})

// Auditoria: logar aprovações
MarketQuoteSchema.post('save', async function (doc: any) {
  try {
    if (doc?.status === 'approved') {
      await ActivityLog.create({
        user: doc.approvedBy || doc.createdBy,
        type: 'market_quote_approved',
        metadata: {
          quoteId: String(doc._id),
          weekISO: doc.weekISO,
          region: doc.region,
          saleForm: doc.saleForm,
          refPricePerKg: doc.refPricePerKg,
          refPricePerHead: doc.refPricePerHead,
          minSamples: doc.minSamples
        }
      })
    }
  } catch {}
})

