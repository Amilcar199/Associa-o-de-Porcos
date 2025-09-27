import mongoose, { Schema, Model, Document } from 'mongoose'

export interface PushSubscriptionDoc extends Document {
  endpoint: string
  expirationTime?: number | null
  keys: {
    p256dh: string
    auth: string
  }
  userId?: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const PushSubscriptionSchema = new Schema<PushSubscriptionDoc>({
  endpoint: { type: String, required: true, unique: true, index: true },
  expirationTime: { type: Number, default: null },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

let model: Model<PushSubscriptionDoc>
try {
  model = mongoose.model<PushSubscriptionDoc>('PushSubscription')
} catch {
  model = mongoose.model<PushSubscriptionDoc>('PushSubscription', PushSubscriptionSchema)
}

export default model

