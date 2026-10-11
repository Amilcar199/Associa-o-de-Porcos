import mongoose, { Schema, model, models } from 'mongoose'

const QuoteResponseSchema = new Schema({
  quoteRequest: { type: Schema.Types.ObjectId, ref: 'QuoteRequest', required: true, index: true },
  producer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  price: { type: Number, required: true, min: 1 },
  quantity: { type: Number, required: true, min: 1, max: 5000 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  message: { type: String, trim: true, maxlength: 500 },
}, {
  timestamps: true,
  collection: 'quote_responses',
})

QuoteResponseSchema.index({ quoteRequest: 1, producer: 1 }, { unique: true })

export default models.QuoteResponse || model('QuoteResponse', QuoteResponseSchema)
