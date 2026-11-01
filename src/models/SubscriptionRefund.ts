import mongoose, { Schema, models, model } from 'mongoose'

const SubscriptionRefundSchema = new Schema({
  transaction: { type: Schema.Types.ObjectId, ref: 'SubscriptionTransaction', required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'AOA' },
  reason: { type: String, required: true, maxlength: 300 },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  collection: 'subscription_refunds',
})

export default models.SubscriptionRefund || model('SubscriptionRefund', SubscriptionRefundSchema)
