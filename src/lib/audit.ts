export const PRODUCT_AUDIT_FIELDS = [
  'name',
  'breed',
  'price',
  'pricePerKg',
  'quantity',
  'saleForm',
  'location',
  'availability',
  'listingStatus',
  'highlighted',
  'isActive',
  'weight',
  'age',
] as const

export const ACCOUNT_AUDIT_FIELDS = ['role', 'plan', 'planExpiresAt', 'verificationStatus', 'isActive'] as const

const SECRET_KEY = /password|token|secret/i

export function changedFields(
  before: object | null | undefined,
  after: object | null | undefined,
  fields: readonly string[],
) {
  const left = (before || {}) as Record<string, unknown>
  const right = (after || {}) as Record<string, unknown>
  const changes: Record<string, { from: unknown; to: unknown }> = {}
  for (const field of fields) {
    const from = left[field] ?? null
    const to = right[field] ?? null
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      changes[field] = { from, to }
    }
  }
  return changes
}

export function backupUser(user: Record<string, unknown>) {
  const copy: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(user)) {
    if (SECRET_KEY.test(key)) continue
    copy[key] = value
  }
  return copy
}
