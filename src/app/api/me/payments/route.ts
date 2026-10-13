export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import Product from '@/models/Product'
import User from '@/models/User'
import { errorResponse, sanitizeInput, successResponse } from '@/lib/api-utils'
import { rateLimitOrNull } from '@/lib/rate-limit'
import { createProviderCharge, PAYMENT_OFFERS, paymentOffer, pendingDeadline } from '@/lib/payments'
import { hasProPlan } from '@/lib/notify-users'
import { expireDuePayments } from '@/lib/settle-payment'
import { recordAudit } from '@/lib/record-audit'

async function userId() {
  const session = await getServerSession(authOptions)
  const id = (session as any)?.user?.id
  if (!session?.user || !id) return null
  return String(id)
}

export async function GET() {
  try {
    const id = await userId()
    if (!id) return errorResponse('Não autorizado', 401)
    await expireDuePayments()
    const payments = await Payment.find({ user: id }).sort({ createdAt: -1 }).limit(30).lean()
    return NextResponse.json(successResponse({
      provider: process.env.PAYMENT_PROVIDER === 'multicaixa' ? 'multicaixa' : 'fake',
      offers: PAYMENT_OFFERS,
      payments,
    }))
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function POST(req: NextRequest) {
  const limited = rateLimitOrNull(req, { key: 'payment-create', limit: 12, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  try {
    const id = await userId()
    if (!id) return errorResponse('Não autorizado', 401)
    const body = sanitizeInput(await req.json())
    const offer = paymentOffer(String(body.purpose || ''))
    if (!offer) return errorResponse('Pagamento inválido')
    if (body.purpose === 'highlight' && !/^[a-f\d]{24}$/i.test(String(body.productId || ''))) {
      return errorResponse('Anúncio inválido')
    }

    await connectDB()
    await expireDuePayments()

    if (body.purpose === 'highlight') {
      const owner = await User.findById(id).select('plan planExpiresAt').lean() as { plan?: string; planExpiresAt?: Date | null } | null
      if (!hasProPlan(owner)) return errorResponse('O destaque faz parte do Plano Pro', 403)
      const product = await Product.findOne({ _id: body.productId, seller: id, isActive: true })
      if (!product) return errorResponse('Anúncio não encontrado', 404)
      if (product.listingStatus && product.listingStatus !== 'approved') {
        return errorResponse('O anúncio precisa de estar aprovado para ficar em destaque')
      }
    }

    const openQuery: Record<string, unknown> = { user: id, purpose: body.purpose, status: 'pending', expiresAt: { $gt: new Date() } }
    if (body.purpose === 'highlight') openQuery.product = body.productId
    const existing = await Payment.findOne(openQuery)
    if (existing) return NextResponse.json(successResponse(existing, 'Já existe um pagamento pendente'))

    const charge = createProviderCharge(body.purpose)
    if (!charge.ok) return errorResponse(charge.error, 503)

    const payment = await Payment.create({
      user: id,
      purpose: body.purpose,
      product: body.purpose === 'highlight' ? body.productId : undefined,
      amount: charge.amount,
      currency: 'AOA',
      status: 'pending',
      provider: charge.provider,
      providerRef: charge.providerRef,
      expiresAt: pendingDeadline(new Date()),
    })
    await recordAudit({
      actorId: id,
      action: 'payment.create',
      entity: 'payment',
      entityId: String(payment._id),
      summary: `${offer.label} · ${charge.amount} AOA`,
    })
    return NextResponse.json(successResponse(payment, 'Pagamento criado'), { status: 201 })
  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
