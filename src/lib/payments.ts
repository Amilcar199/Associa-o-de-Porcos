export const PAYMENT_OFFERS = {
  pro: { amount: 15000, days: 30, label: 'Plano Pro' },
  highlight: { amount: 2500, days: 7, label: 'Destaque' },
} as const

export const PENDING_HOURS = 24

export type PaymentPurpose = keyof typeof PAYMENT_OFFERS
export type PaymentOutcome = 'paid' | 'failed'

export function paymentOffer(purpose: string) {
  if (purpose === 'pro' || purpose === 'highlight') return PAYMENT_OFFERS[purpose]
  return null
}

export function pendingDeadline(now: Date) {
  return new Date(now.getTime() + PENDING_HOURS * 60 * 60 * 1000)
}

export function extendFrom(current: Date | string | null | undefined, now: Date, days: number) {
  const currentTime = current ? new Date(current).getTime() : 0
  const start = Number.isFinite(currentTime) ? Math.max(currentTime, now.getTime()) : now.getTime()
  return new Date(start + days * 24 * 60 * 60 * 1000)
}

export function isPendingOpen(status: string, expiresAt: Date | string, now: Date) {
  return status === 'pending' && new Date(expiresAt).getTime() > now.getTime()
}

/**
 * Único ponto que fala com o gateway.
 * Com PAYMENT_PROVIDER=multicaixa esta função passa a criar a cobrança real.
 * O resto do site continua a chamar settlePayment quando o pagamento fecha.
 */
export function createProviderCharge(purpose: PaymentPurpose) {
  if (process.env.PAYMENT_PROVIDER === 'multicaixa') {
    return { ok: false as const, error: 'O MULTICAIXA ainda não está configurado.' }
  }
  const offer = PAYMENT_OFFERS[purpose]
  const suffix = Math.random().toString(36).slice(2, 8)
  return {
    ok: true as const,
    provider: 'fake' as const,
    providerRef: `fake-${purpose}-${suffix}`,
    amount: offer.amount,
    status: 'pending' as const,
  }
}
