import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import Product from '@/models/Product'
import User from '@/models/User'
import { extendFrom, isPendingOpen, type PaymentOutcome } from '@/lib/payments'
import { recordAudit } from '@/lib/record-audit'
import { notifyUsers } from '@/lib/notify-users'

export async function expireDuePayments() {
  const now = new Date()
  await connectDB()
  await Payment.updateMany({ status: 'pending', expiresAt: { $lte: now } }, { $set: { status: 'expired' } })
  await User.updateMany(
    { plan: 'pro', planExpiresAt: { $ne: null, $lte: now } },
    { $set: { plan: 'free', planExpiresAt: null } },
  )
  await Product.updateMany(
    { highlighted: true, highlightExpiresAt: { $ne: null, $lte: now } },
    { $set: { highlighted: false } },
  )
}

export async function settlePayment(paymentId: string, outcome: PaymentOutcome) {
  await expireDuePayments()
  const payment = await Payment.findById(paymentId)
  if (!payment) return { error: 'Pagamento não encontrado', status: 404 }
  if (payment.provider !== 'fake') return { error: 'Este pagamento só fecha pelo gateway.', status: 400 }
  if (!isPendingOpen(payment.status, payment.expiresAt, new Date())) {
    return { error: 'Este pagamento já foi fechado.', status: 400 }
  }

  const actorId = String(payment.user)
  if (outcome === 'failed') {
    payment.status = 'failed'
    await payment.save()
    await recordAudit({
      actorId,
      action: 'payment.failed',
      entity: 'payment',
      entityId: String(payment._id),
      summary: payment.purpose,
    })
    return { payment }
  }

  const now = new Date()
  const days = payment.purpose === 'pro' ? 30 : 7
  if (payment.purpose === 'pro') {
    const user = await User.findById(payment.user)
    if (!user) return { error: 'Conta não encontrada', status: 404 }
    const until = extendFrom(user.planExpiresAt, now, days)
    user.plan = 'pro'
    user.planExpiresAt = until
    await user.save()
    payment.effectUntil = until
  } else {
    const product = await Product.findOne({ _id: payment.product, seller: payment.user, isActive: true })
    if (!product) return { error: 'Anúncio não encontrado', status: 404 }
    if (product.listingStatus && product.listingStatus !== 'approved') {
      return { error: 'O anúncio precisa de estar aprovado.', status: 400 }
    }
    const until = extendFrom(product.highlightExpiresAt, now, days)
    product.highlighted = true
    product.highlightExpiresAt = until
    await product.save()
    payment.effectUntil = until
  }

  payment.status = 'paid'
  payment.paidAt = now
  await payment.save()
  await recordAudit({
    actorId,
    action: 'payment.paid',
    entity: 'payment',
    entityId: String(payment._id),
    summary: `${payment.purpose} até ${payment.effectUntil?.toISOString?.() || ''}`,
  })
  await notifyUsers([actorId], {
    title: 'Pagamento confirmado',
    body: payment.purpose === 'pro' ? 'O Plano Pro está activo.' : 'O anúncio ficou em destaque.',
    href: '/painel',
  })
  return { payment }
}
