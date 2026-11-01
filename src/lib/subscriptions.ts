export const SUBSCRIPTION_STATUSES = ['pending', 'active', 'past_due', 'suspended', 'expired'] as const
export const PAYMENT_METHODS = ['express', 'iban', 'paypay'] as const
export const TRANSACTION_STATUSES = ['pending', 'awaiting_proof', 'under_review', 'paid', 'failed', 'expired', 'refunded'] as const

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number]

export const PROOF_WINDOW_HOURS = 72
export const DEFAULT_GRACE_DAYS = 5
export const DEFAULT_REMINDER_DAYS = [7, 3, 1]
export const DEFAULT_PLAN_PRICE_AOA = 15000
export const BILLING_INTERVALS = ['week', 'month', 'semester', 'year'] as const
export type BillingInterval = (typeof BILLING_INTERVALS)[number]
export type PlanPrices = Record<BillingInterval, number | null>

export const INTERVAL_LABELS: Record<BillingInterval, string> = {
  week: 'Semanal',
  month: 'Mensal',
  semester: '6 meses',
  year: 'Anual',
}

const DAY_MS = 24 * 60 * 60 * 1000

export class SubscriptionError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'SubscriptionError'
    this.status = status
  }
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date.getTime())
  const day = next.getUTCDate()
  next.setUTCMonth(next.getUTCMonth() + months)
  if (next.getUTCDate() !== day) next.setUTCDate(0)
  return next
}

export function isBillingInterval(value: string): value is BillingInterval {
  return (BILLING_INTERVALS as readonly string[]).includes(value)
}

export function addInterval(date: Date, interval: BillingInterval) {
  if (interval === 'week') return new Date(date.getTime() + 7 * DAY_MS)
  if (interval === 'semester') return addMonths(date, 6)
  if (interval === 'year') return addMonths(date, 12)
  return addMonths(date, 1)
}

export function monthlyEquivalent(amount: number, interval: BillingInterval) {
  if (interval === 'semester') return Math.round(amount / 6)
  if (interval === 'year') return Math.round(amount / 12)
  return null
}

export function daysUntil(target: Date, now: Date) {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const end = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
  return Math.round((end - start) / DAY_MS)
}

export function proofDeadline(now: Date) {
  return new Date(now.getTime() + PROOF_WINDOW_HOURS * 60 * 60 * 1000)
}

export function normalizeIban(value: string) {
  return value.replace(/\s+/g, '').toUpperCase()
}

export function isAngolaIban(value: string) {
  return /^AO\d{23}$/.test(normalizeIban(value))
}

export function formatIban(value: string) {
  return normalizeIban(value).replace(/(.{4})/g, '$1 ').trim()
}

export function formatAoa(amount: number) {
  return `${Number(amount || 0).toLocaleString('pt-AO')} Kz`
}

export function isReceiptId(value: string) {
  return /^[a-f\d]{24}$/i.test(value)
}

type PeriodSource = {
  status?: string
  renewsAt?: Date | string | null
  startedAt?: Date | string | null
}

export function nextBillingPeriod(current: PeriodSource | null, now: Date, graceDays: number, interval: BillingInterval = 'month') {
  const renewsAt = current?.renewsAt ? new Date(current.renewsAt) : null
  const renewTime = renewsAt && Number.isFinite(renewsAt.getTime()) ? renewsAt.getTime() : 0
  const status = current?.status || ''
  const reusable = Boolean(renewTime) && ['active', 'past_due', 'suspended'].includes(status)
  const lapsed = reusable && renewTime + graceDays * DAY_MS <= now.getTime()
  const periodStart = reusable && !lapsed ? new Date(renewTime) : now
  const nextRenewal = addInterval(periodStart, interval)
  const graceUntil = new Date(nextRenewal.getTime() + graceDays * DAY_MS)
  const previousStart = current?.startedAt ? new Date(current.startedAt) : null
  const startedAt = reusable && !lapsed && previousStart && Number.isFinite(previousStart.getTime())
    ? previousStart
    : now
  return { periodStart, renewsAt: nextRenewal, graceUntil, startedAt }
}

export function subscriptionAccess(sub: {
  status: string
  renewsAt?: Date | string | null
  graceUntil?: Date | string | null
}, now: Date) {
  const renewsAt = sub.renewsAt ? new Date(sub.renewsAt) : null
  const graceUntil = sub.graceUntil ? new Date(sub.graceUntil) : null
  if (sub.status === 'active' && renewsAt && now.getTime() < renewsAt.getTime()) {
    return { allowed: true, until: renewsAt }
  }
  if ((sub.status === 'active' || sub.status === 'past_due') && graceUntil && now.getTime() < graceUntil.getTime() && renewsAt && now.getTime() >= renewsAt.getTime()) {
    return { allowed: true, until: graceUntil }
  }
  return { allowed: false, until: graceUntil || renewsAt }
}

export type SubscriptionNotice =
  | { key: string; kind: 'reminder'; daysLeft: number }
  | { key: string; kind: 'past_due' }
  | { key: string; kind: 'expired' }

export function advanceSubscription(input: {
  status: string
  renewsAt?: Date | string | null
  graceUntil?: Date | string | null
  notices?: string[]
}, now: Date, reminderDays: number[]) {
  if (input.status !== 'active' && input.status !== 'past_due') {
    return { status: input.status, notice: null as SubscriptionNotice | null }
  }
  const renewsAt = input.renewsAt ? new Date(input.renewsAt) : null
  const graceUntil = input.graceUntil ? new Date(input.graceUntil) : null
  if (!renewsAt || !Number.isFinite(renewsAt.getTime()) || !graceUntil || !Number.isFinite(graceUntil.getTime())) {
    return { status: input.status, notice: null as SubscriptionNotice | null }
  }
  const sent = new Set(input.notices || [])
  const periodKey = renewsAt.toISOString()
  if (now.getTime() >= graceUntil.getTime()) {
    const key = `expired:${periodKey}`
    return {
      status: 'expired',
      notice: sent.has(key) ? null : { key, kind: 'expired' as const },
    }
  }
  if (now.getTime() >= renewsAt.getTime()) {
    const key = `past_due:${periodKey}`
    return {
      status: 'past_due',
      notice: sent.has(key) ? null : { key, kind: 'past_due' as const },
    }
  }
  const daysLeft = daysUntil(renewsAt, now)
  const due = reminderDays
    .filter((day) => Number.isInteger(day) && daysLeft <= day && daysLeft >= 0)
    .sort((left, right) => left - right)
  const tightest = due[0]
  if (tightest == null) return { status: input.status, notice: null as SubscriptionNotice | null }
  const key = `reminder:${tightest}:${periodKey}`
  return {
    status: input.status,
    notice: sent.has(key) ? null : { key, kind: 'reminder' as const, daysLeft },
  }
}

export function reactivation(sub: {
  status: string
  renewsAt?: Date | string | null
  graceUntil?: Date | string | null
}, now: Date): { ok: true; status: 'active' | 'past_due' } | { ok: false; reason: string } {
  if (sub.status !== 'suspended') {
    return { ok: false, reason: 'Só uma subscrição suspensa pode ser reactivada.' }
  }
  const renewsAt = sub.renewsAt ? new Date(sub.renewsAt) : null
  const graceUntil = sub.graceUntil ? new Date(sub.graceUntil) : null
  if (renewsAt && now.getTime() < renewsAt.getTime()) return { ok: true, status: 'active' }
  if (graceUntil && now.getTime() < graceUntil.getTime()) return { ok: true, status: 'past_due' }
  return { ok: false, reason: 'O período já expirou. É preciso um novo pagamento.' }
}

export function noticeCopy(notice: SubscriptionNotice, renewsAt?: Date | null, graceUntil?: Date | null) {
  if (notice.kind === 'reminder') {
    const when = notice.daysLeft === 0 ? 'hoje' : `em ${notice.daysLeft} dia${notice.daysLeft === 1 ? '' : 's'}`
    return {
      title: 'Subscrição a vencer',
      body: `A sua subscrição vence ${when}. Renove para manter o Plano Pro.`,
    }
  }
  if (notice.kind === 'past_due') {
    const until = graceUntil ? graceUntil.toLocaleDateString('pt-AO') : ''
    return {
      title: 'Subscrição em atraso',
      body: until
        ? `A renovação de ${renewsAt ? renewsAt.toLocaleDateString('pt-AO') : 'hoje'} não foi paga. O acesso segue até ${until}.`
        : 'A renovação não foi paga. Regularize a subscrição para manter o Plano Pro.',
    }
  }
  return {
    title: 'Subscrição expirada',
    body: 'O prazo de pagamento terminou e o Plano Pro foi desactivado.',
  }
}

export function refundableAmount(amount: number, refundedAmount: number) {
  return Math.max(0, amount - refundedAmount)
}

function readPrice(value: unknown) {
  if (value == null || value === '') return null
  const amount = Number(value)
  if (!Number.isInteger(amount) || amount < 1 || amount > 100_000_000) return undefined
  return amount
}

export function parsePlanInput(body: Record<string, unknown>) {
  const name = String(body.name || '').trim()
  const description = String(body.description || '').trim()
  const graceDays = body.graceDays == null || body.graceDays === '' ? DEFAULT_GRACE_DAYS : Number(body.graceDays)
  const active = body.active !== false && body.active !== 'false'
  const recommended = body.recommended === true || body.recommended === 'true'
  const source = Array.isArray(body.reminderDays)
    ? body.reminderDays
    : String(body.reminderDays || DEFAULT_REMINDER_DAYS.join(','))
  const reminderDays = (Array.isArray(source) ? source : String(source).split(/[,\s]+/))
    .map((day) => Number(String(day).trim()))
    .filter((day) => Number.isInteger(day))
  const days = Array.from(new Set(reminderDays)).sort((left, right) => right - left)
  const priceSource = body.prices && typeof body.prices === 'object'
    ? body.prices as Record<string, unknown>
    : { month: body.priceAoa }
  const prices = {} as PlanPrices
  for (const interval of BILLING_INTERVALS) {
    const amount = readPrice(priceSource[interval])
    if (amount === undefined) return { error: `O preço ${INTERVAL_LABELS[interval].toLowerCase()} tem de ser um número inteiro em kwanzas, ou ficar vazio.` }
    prices[interval] = amount
  }
  const featureSource = Array.isArray(body.features) ? body.features : String(body.features || '').split('\n')
  const features = featureSource.map((item) => String(item).trim()).filter(Boolean).slice(0, 12)
  const priceAoa = prices.month || prices.week || prices.semester || prices.year

  if (name.length < 2 || name.length > 80) return { error: 'Indique o nome do plano.' }
  if (description.length > 400) return { error: 'A descrição é demasiado longa.' }
  if (!priceAoa) return { error: 'Indique pelo menos um preço: semanal, mensal, 6 meses ou anual.' }
  if (features.some((feature) => feature.length > 140)) return { error: 'Cada vantagem do plano pode ter no máximo 140 caracteres.' }
  if (!Number.isInteger(graceDays) || graceDays < 0 || graceDays > 30) {
    return { error: 'A tolerância depois do vencimento fica entre 0 e 30 dias.' }
  }
  if (days.length < 1 || days.length > 5 || days.some((day) => day < 1 || day > 30)) {
    return { error: 'Indique até 5 avisos, entre 1 e 30 dias antes do vencimento.' }
  }
  return { value: { name, description, priceAoa, prices, features, recommended, graceDays, active, reminderDays: days } }
}

export function parsePaymentSettings(body: Record<string, unknown>) {
  if (typeof body.expressEnabled !== 'boolean') return { error: 'Indique se o Express aparece aos membros.' }
  if (!Array.isArray(body.banks) || body.banks.length > 20) return { error: 'Publique no máximo 20 contas IBAN.' }
  if (!Array.isArray(body.paypay) || body.paypay.length > 20) return { error: 'Publique no máximo 20 contas PayPay.' }

  const banks = []
  for (const row of body.banks) {
    const item = row as Record<string, unknown>
    const name = String(item.name || '').trim()
    const holder = String(item.holder || '').trim()
    const iban = normalizeIban(String(item.iban || ''))
    const active = item.active !== false && item.active !== 'false'
    const id = String(item.id || '')
    if (name.length < 2 || name.length > 80 || holder.length < 2 || holder.length > 80 || !isAngolaIban(iban)) {
      return { error: 'Cada banco precisa de nome, titular e IBAN angolano (AO seguido de 23 dígitos).' }
    }
    banks.push({ id: isReceiptId(id) ? id : '', name, holder, iban, active })
  }

  const paypay = []
  for (const row of body.paypay) {
    const item = row as Record<string, unknown>
    const label = String(item.label || '').trim()
    const account = String(item.account || '').replace(/\s+/g, ' ').trim()
    const active = item.active !== false && item.active !== 'false'
    const id = String(item.id || '')
    if (label.length < 2 || label.length > 80 || !/^[0-9+\s()-]{6,40}$/.test(account)) {
      return { error: 'Cada conta PayPay precisa de um nome e de um número com 6 a 40 dígitos.' }
    }
    paypay.push({ id: isReceiptId(id) ? id : '', label, account, active })
  }

  return { value: { expressEnabled: body.expressEnabled, banks, paypay } }
}

export function parseRefundInput(body: Record<string, unknown>) {
  const transactionId = String(body.transactionId || '')
  const amount = Number(body.amount)
  const reason = String(body.reason || '').trim()
  if (!isReceiptId(transactionId)) return { error: 'Transacção inválida.' }
  if (!Number.isInteger(amount) || amount < 1) return { error: 'O reembolso tem de ser um valor inteiro em kwanzas.' }
  if (reason.length < 3 || reason.length > 300) return { error: 'Descreva o motivo do reembolso.' }
  return { value: { transactionId, amount, reason } }
}
