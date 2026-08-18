import { Schema, model, models } from 'mongoose'

const NewsletterSubscriberSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  active: { type: Boolean, default: true },
  source: { type: String, default: 'footer' },
  unsubscribedAt: { type: Date },
}, { timestamps: true, collection: 'newsletter_subscribers' })

NewsletterSubscriberSchema.index({ email: 1 })
NewsletterSubscriberSchema.index({ active: 1 })

export default models.NewsletterSubscriber || model('NewsletterSubscriber', NewsletterSubscriberSchema)
