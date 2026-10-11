import mongoose, { Schema, model, models } from 'mongoose'

const InAppNotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, maxlength: 140 },
  body: { type: String, required: true, maxlength: 400 },
  href: { type: String, required: true, maxlength: 200 },
  read: { type: Boolean, default: false },
}, {
  timestamps: true,
  collection: 'in_app_notifications',
})

export default models.InAppNotification || model('InAppNotification', InAppNotificationSchema)
