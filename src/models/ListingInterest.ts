import mongoose, { Schema, model, models } from 'mongoose'

const ListingInterestSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  message: { type: String, trim: true, maxlength: 500 },
}, {
  timestamps: true,
  collection: 'listing_interests',
})

export default models.ListingInterest || model('ListingInterest', ListingInterestSchema)
