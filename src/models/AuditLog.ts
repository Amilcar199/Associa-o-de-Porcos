import mongoose, { Schema, models, model } from 'mongoose'

const AuditLogSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, index: true },
  entity: { type: String, required: true },
  entityId: { type: String, default: '' },
  summary: { type: String, default: '', maxlength: 300 },
  changes: { type: Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
  collection: 'audit_logs',
})

AuditLogSchema.index({ createdAt: -1 })

export default models.AuditLog || model('AuditLog', AuditLogSchema)
