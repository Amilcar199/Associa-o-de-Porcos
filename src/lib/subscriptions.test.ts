import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createExpressCharge, expressReadiness } from './express-gateway.ts'
import {
  addInterval,
  addMonths,
  advanceSubscription,
  daysUntil,
  formatIban,
  isAngolaIban,
  nextBillingPeriod,
  parsePaymentSettings,
  parsePlanInput,
  parseRefundInput,
  reactivation,
  refundableAmount,
  subscriptionAccess,
} from './subscriptions.ts'

const now = new Date('2026-11-01T12:00:00.000Z')

describe('subscrições mensais', () => {
  it('avança um mês e acerta o fim do mês', () => {
    assert.equal(addMonths(new Date('2026-01-31T12:00:00.000Z'), 1).toISOString(), '2026-02-28T12:00:00.000Z')
    assert.equal(addMonths(new Date('2024-01-31T12:00:00.000Z'), 1).toISOString(), '2024-02-29T12:00:00.000Z')
    assert.equal(addMonths(now, 1).toISOString(), '2026-12-01T12:00:00.000Z')
  })

  it('aceita semana, semestre e ano', () => {
    assert.equal(addInterval(now, 'week').toISOString(), '2026-11-08T12:00:00.000Z')
    assert.equal(addInterval(now, 'semester').toISOString(), '2027-05-01T12:00:00.000Z')
    assert.equal(addInterval(now, 'year').toISOString(), '2027-11-01T12:00:00.000Z')
    const annual = nextBillingPeriod({ status: 'pending' }, now, 5, 'year')
    assert.equal(annual.renewsAt.toISOString(), '2027-11-01T12:00:00.000Z')
    const parsed = parsePlanInput({
      name: 'Produtor',
      prices: { week: 5000, month: 15000, semester: '', year: 150000 },
      features: 'Publicar anúncios\nAvisos de renovação',
      recommended: true,
    })
    assert.equal('value' in parsed && parsed.value.prices.week, 5000)
    assert.equal('value' in parsed && parsed.value.prices.semester, null)
    assert.equal('value' in parsed && parsed.value.features.length, 2)
  })

  it('abre o primeiro período a partir de hoje', () => {
    const period = nextBillingPeriod({ status: 'pending' }, now, 5)
    assert.equal(period.startedAt.toISOString(), now.toISOString())
    assert.equal(period.renewsAt.toISOString(), '2026-12-01T12:00:00.000Z')
    assert.equal(period.graceUntil.toISOString(), '2026-12-06T12:00:00.000Z')
  })

  it('renova a partir da data ainda válida', () => {
    const period = nextBillingPeriod({
      status: 'active',
      renewsAt: '2026-12-01T12:00:00.000Z',
      startedAt: '2026-10-01T12:00:00.000Z',
    }, now, 5)
    assert.equal(period.startedAt.toISOString(), '2026-10-01T12:00:00.000Z')
    assert.equal(period.periodStart.toISOString(), '2026-12-01T12:00:00.000Z')
    assert.equal(period.renewsAt.toISOString(), '2027-01-01T12:00:00.000Z')
  })

  it('mantém a continuidade dentro da tolerância e recomeça depois dela', () => {
    const late = nextBillingPeriod({
      status: 'past_due',
      renewsAt: '2026-11-01T12:00:00.000Z',
      startedAt: '2026-10-01T12:00:00.000Z',
    }, new Date('2026-11-03T12:00:00.000Z'), 5)
    assert.equal(late.periodStart.toISOString(), '2026-11-01T12:00:00.000Z')
    assert.equal(late.renewsAt.toISOString(), '2026-12-01T12:00:00.000Z')

    const lapsed = nextBillingPeriod({
      status: 'expired',
      renewsAt: '2026-10-01T12:00:00.000Z',
      startedAt: '2026-09-01T12:00:00.000Z',
    }, now, 5)
    assert.equal(lapsed.startedAt.toISOString(), now.toISOString())
  })

  it('dá acesso até à renovação e, em atraso, até ao fim da tolerância', () => {
    const active = subscriptionAccess({
      status: 'active',
      renewsAt: '2026-12-01T12:00:00.000Z',
      graceUntil: '2026-12-06T12:00:00.000Z',
    }, now)
    assert.equal(active.allowed, true)
    assert.equal(active.until?.toISOString(), '2026-12-01T12:00:00.000Z')

    const late = subscriptionAccess({
      status: 'past_due',
      renewsAt: '2026-11-01T12:00:00.000Z',
      graceUntil: '2026-11-06T12:00:00.000Z',
    }, new Date('2026-11-03T12:00:00.000Z'))
    assert.equal(late.allowed, true)

    const suspended = subscriptionAccess({
      status: 'suspended',
      renewsAt: '2026-12-01T12:00:00.000Z',
      graceUntil: '2026-12-06T12:00:00.000Z',
    }, now)
    assert.equal(suspended.allowed, false)
  })

  it('avisa uma vez e expira depois da tolerância', () => {
    const renewsAt = '2026-11-08T12:00:00.000Z'
    const graceUntil = '2026-11-13T12:00:00.000Z'
    const reminder = advanceSubscription({
      status: 'active',
      renewsAt,
      graceUntil,
      notices: [],
    }, new Date('2026-11-03T12:00:00.000Z'), [7, 3, 1])
    assert.equal(daysUntil(new Date(renewsAt), new Date('2026-11-03T12:00:00.000Z')), 5)
    assert.equal(reminder.status, 'active')
    assert.equal(reminder.notice?.kind, 'reminder')

    const repeated = advanceSubscription({
      status: 'active',
      renewsAt,
      graceUntil,
      notices: [reminder.notice?.key || ''],
    }, new Date('2026-11-03T12:00:00.000Z'), [7, 3, 1])
    assert.equal(repeated.notice, null)

    const expired = advanceSubscription({
      status: 'past_due',
      renewsAt,
      graceUntil,
      notices: [],
    }, new Date('2026-11-13T12:00:00.000Z'), [7, 3, 1])
    assert.equal(expired.status, 'expired')
    assert.equal(expired.notice?.kind, 'expired')
  })

  it('só reactiva uma suspensão dentro do período pago', () => {
    const open = reactivation({
      status: 'suspended',
      renewsAt: '2026-12-01T12:00:00.000Z',
      graceUntil: '2026-12-06T12:00:00.000Z',
    }, now)
    assert.equal(open.ok, true)
    if (open.ok) assert.equal(open.status, 'active')

    const closed = reactivation({
      status: 'suspended',
      renewsAt: '2026-10-01T12:00:00.000Z',
      graceUntil: '2026-10-06T12:00:00.000Z',
    }, now)
    assert.equal(closed.ok, false)
  })

  it('valida preço, IBAN, PayPay e reembolso', () => {
    const plan = parsePlanInput({ name: 'Produtor', priceAoa: 20000, graceDays: 5, reminderDays: '7, 3, 1' })
    assert.equal('value' in plan && plan.value.priceAoa, 20000)
    assert.equal('error' in parsePlanInput({ name: 'A', priceAoa: 10 }), true)

    assert.equal(isAngolaIban('ao06 0000 0000 0000 0000 0000 1'), true)
    assert.equal(formatIban('AO06000000000000000000001'), 'AO06 0000 0000 0000 0000 0000 1')
    const settings = parsePaymentSettings({
      expressEnabled: true,
      banks: [{ name: 'Banco', holder: 'Associação', iban: 'AO06 0000 0000 0000 0000 0000 1', active: true }],
      paypay: [{ label: 'Caixa', account: '923000000', active: true }],
    })
    assert.equal('value' in settings && settings.value.banks[0].iban, 'AO06000000000000000000001')
    assert.equal('error' in parsePaymentSettings({ expressEnabled: true, banks: [{ name: 'Banco', holder: 'Associação', iban: 'PT50', active: true }], paypay: [] }), true)

    const refund = parseRefundInput({ transactionId: 'a'.repeat(24), amount: 5000, reason: 'Pagamento em duplicado' })
    assert.equal('value' in refund && refund.value.amount, 5000)
    assert.equal(refundableAmount(15000, 5000), 10000)
  })

  it('deixa o Express por integrar', async () => {
    const readiness = expressReadiness()
    assert.ok(readiness.state === 'awaiting_credentials' || readiness.state === 'awaiting_client')
    const charge = await createExpressCharge({
      reference: 'exp-teste',
      amount: 15000,
      currency: 'AOA',
      description: 'Plano Pro',
      callbackUrl: 'http://localhost:3000/api/payments/express/webhook',
    })
    assert.equal(charge.ok, false)
    if (!charge.ok) assert.equal(charge.code, 'not_configured')
  })
})
