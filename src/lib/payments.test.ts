import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createProviderCharge, extendFrom, isPendingOpen, paymentOffer, pendingDeadline } from './payments.ts'

describe('ofertas de pagamento', () => {
  it('conhece o plano e o destaque', () => {
    assert.equal(paymentOffer('pro')?.amount, 15000)
    assert.equal(paymentOffer('highlight')?.days, 7)
    assert.equal(paymentOffer('outro'), null)
  })

  it('soma o prazo a uma data ainda válida', () => {
    const now = new Date('2026-10-13T12:00:00.000Z')
    const current = new Date('2026-11-01T12:00:00.000Z')
    const next = extendFrom(current, now, 30)
    assert.equal(next.toISOString(), '2026-12-01T12:00:00.000Z')
  })

  it('começa hoje quando o prazo anterior já passou', () => {
    const now = new Date('2026-10-13T12:00:00.000Z')
    const next = extendFrom('2026-01-01T00:00:00.000Z', now, 30)
    assert.equal(next.toISOString(), '2026-11-12T12:00:00.000Z')
  })

  it('fecha o pagamento pendente depois do prazo', () => {
    const now = new Date('2026-10-13T12:00:00.000Z')
    const open = pendingDeadline(now)
    assert.equal(isPendingOpen('pending', open, now), true)
    assert.equal(isPendingOpen('pending', now, new Date(now.getTime() + 1000)), false)
    assert.equal(isPendingOpen('paid', open, now), false)
  })

  it('cria uma cobrança simulada', () => {
    const charge = createProviderCharge('pro')
    assert.equal(charge.ok, true)
    if (charge.ok) {
      assert.equal(charge.provider, 'fake')
      assert.equal(charge.status, 'pending')
      assert.equal(charge.amount, 15000)
      assert.match(charge.providerRef, /^fake-pro-/)
    }
  })
})
