import mongoose, { Schema, models, model } from 'mongoose'

const ActivityLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true }, // login, logout, password_change, profile_update, session_revoked
  ip: { type: String },
  userAgent: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, {
  timestamps: true,
  collection: 'activity_logs'
})

ActivityLogSchema.index({ createdAt: -1 })

export default models.ActivityLog || model('ActivityLog', ActivityLogSchema)

