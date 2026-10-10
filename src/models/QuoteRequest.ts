import mongoose, { Schema, model, models } from 'mongoose'

const QuoteRequestSchema = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quantity: { type: Number, required: true, min: 1, max: 5000 },
  saleForm: { type: String, enum: ['vivo', 'carcaça'], required: true },
  breed: { type: String, trim: true, maxlength: 80 },
  province: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  note: { type: String, trim: true, maxlength: 500 },
  status: { type: String, enum: ['open'], default: 'open', index: true },
}, {
  timestamps: true,
  collection: 'quote_requests',
})

export default models.QuoteRequest || model('QuoteRequest', QuoteRequestSchema)
