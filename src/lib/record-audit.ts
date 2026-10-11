import connectDB from '@/lib/mongodb'
import AuditLog from '@/models/AuditLog'

type AuditInput = {
  actorId?: string | null
  action: string
  entity: string
  entityId?: string
  summary?: string
  changes?: Record<string, unknown>
}

export async function recordAudit(entry: AuditInput) {
  try {
    await connectDB()
    await AuditLog.create({
      actor: entry.actorId && /^[a-f\d]{24}$/i.test(entry.actorId) ? entry.actorId : undefined,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId || '',
      summary: String(entry.summary || '').slice(0, 300),
      changes: entry.changes || {},
    })
  } catch (error) {
    console.error('Falha ao gravar registo de auditoria:', error)
  }
}
