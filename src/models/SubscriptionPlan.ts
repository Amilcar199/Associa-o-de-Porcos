import mongoose, { Schema, models, model } from 'mongoose'

if (models.SubscriptionPlan && !models.SubscriptionPlan.schema.path('prices')) {
  delete models.SubscriptionPlan
}

const SubscriptionPlanSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  slug: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
  description: { type: String, default: '', maxlength: 400 },
  priceAoa: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'AOA' },
  prices: {
    week: Number,
    month: Number,
    semester: Number,
    year: Number,
  },
  features: { type: [String], default: [] },
  recommended: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  graceDays: { type: Number, default: 5, min: 0, max: 30 },
  reminderDays: { type: [Number], default: [7, 3, 1] },
}, {
  timestamps: true,
  collection: 'subscription_plans',
})

export default models.SubscriptionPlan || model('SubscriptionPlan', SubscriptionPlanSchema)
