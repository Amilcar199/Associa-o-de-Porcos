import mongoose, { Schema, models, model } from 'mongoose'

if (models.Subscription && !models.Subscription.schema.path('billingInterval')) {
  delete models.Subscription
}

const SubscriptionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  plan: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
  planName: { type: String, default: '', maxlength: 80 },
  priceAoa: { type: Number, default: 0 },
  billingInterval: { type: String, enum: ['week', 'month', 'semester', 'year'], default: 'month' },
  status: {
    type: String,
    enum: ['pending', 'active', 'past_due', 'suspended', 'expired'],
    default: 'pending',
    index: true,
  },
  startedAt: Date,
  currentPeriodStart: Date,
  renewsAt: Date,
  graceUntil: Date,
  suspendedAt: Date,
  paymentMethod: { type: String, enum: ['express', 'iban', 'paypay'] },
  lastTransaction: { type: Schema.Types.ObjectId, ref: 'SubscriptionTransaction' },
  notices: { type: [String], default: [] },
}, {
  timestamps: true,
  collection: 'subscriptions',
})

SubscriptionSchema.index({ renewsAt: 1, status: 1 })

export default models.Subscription || model('Subscription', SubscriptionSchema)
