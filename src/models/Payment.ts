import mongoose, { Schema, models, model } from 'mongoose'

const PaymentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  purpose: { type: String, enum: ['pro', 'highlight'], required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'AOA' },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'expired'], default: 'pending', index: true },
  provider: { type: String, enum: ['fake', 'multicaixa'], required: true },
  providerRef: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  paidAt: Date,
  effectUntil: Date,
}, {
  timestamps: true,
  collection: 'payments',
})

PaymentSchema.index({ user: 1, createdAt: -1 })

export default models.Payment || model('Payment', PaymentSchema)
