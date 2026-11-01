import mongoose, { Schema, models, model } from 'mongoose'

if (models.SubscriptionTransaction && !models.SubscriptionTransaction.schema.path('billingInterval')) {
  delete models.SubscriptionTransaction
}

const SubscriptionTransactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true, index: true },
  plan: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  planName: { type: String, default: '', maxlength: 80 },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'AOA' },
  billingInterval: { type: String, enum: ['week', 'month', 'semester', 'year'], default: 'month' },
  method: { type: String, enum: ['express', 'iban', 'paypay'], required: true },
  status: {
    type: String,
    enum: ['pending', 'awaiting_proof', 'under_review', 'paid', 'failed', 'expired', 'refunded'],
    default: 'pending',
    index: true,
  },
  providerRef: { type: String, required: true, unique: true },
  channelId: { type: String, default: '' },
  channelLabel: { type: String, default: '', maxlength: 120 },
  instructions: { type: String, default: '', maxlength: 400 },
  checkoutUrl: { type: String, default: '' },
  proofFileId: { type: String, default: '' },
  proofNote: { type: String, default: '', maxlength: 300 },
  proofUploadedAt: Date,
  periodStart: Date,
  periodEnd: Date,
  paidAt: Date,
  expiresAt: Date,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewNote: { type: String, default: '', maxlength: 300 },
  refundedAmount: { type: Number, default: 0, min: 0 },
}, {
  timestamps: true,
  collection: 'subscription_transactions',
})

SubscriptionTransactionSchema.index({ user: 1, createdAt: -1 })

export default models.SubscriptionTransaction || model('SubscriptionTransaction', SubscriptionTransactionSchema)
