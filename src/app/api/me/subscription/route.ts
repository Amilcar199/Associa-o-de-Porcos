export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { errorResponse, sanitizeInput, successResponse } from '@/lib/api-utils'
import { rateLimitOrNull } from '@/lib/rate-limit'
import { isBillingInterval, SubscriptionError } from '@/lib/subscriptions'
import { loadMemberBilling, startCheckout } from '@/lib/subscription-service'

async function userId() {
  const session = await getServerSession(authOptions)
  const id = (session as { user?: { id?: string } } | null)?.user?.id
  if (!session?.user || !id) return null
  return String(id)
}

export async function GET() {
  try {
    const id = await userId()
    if (!id) return errorResponse('Não autorizado', 401)
    const data = await loadMemberBilling(id)
    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error('Erro ao ler a subscrição:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function POST(req: NextRequest) {
  const limited = rateLimitOrNull(req, { key: 'subscription-checkout', limit: 12, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  try {
    const id = await userId()
    if (!id) return errorResponse('Não autorizado', 401)
    const body = sanitizeInput(await req.json())
    const planId = String(body.planId || '')
    const method = String(body.method || '')
    const channelId = String(body.channelId || '')
    const interval = String(body.interval || 'month')
    if (!/^[a-f\d]{24}$/i.test(planId)) return errorResponse('Plano inválido')
    if (!isBillingInterval(interval)) return errorResponse('Escolha semanal, mensal, 6 meses ou anual')
    if (method !== 'express' && method !== 'iban' && method !== 'paypay') return errorResponse('Escolha Express, IBAN ou PayPay')
    if (method !== 'express' && channelId && !/^[a-f\d]{24}$/i.test(channelId)) return errorResponse('Conta de pagamento inválida')

    const result = await startCheckout(id, { planId, method, channelId, interval })
    return NextResponse.json(successResponse(result, result.reused ? 'Já existe um pagamento em aberto' : 'Pagamento iniciado'), {
      status: result.reused ? 200 : 201,
    })
  } catch (error) {
    if (error instanceof SubscriptionError) return errorResponse(error.message, error.status)
    console.error('Erro ao iniciar a subscrição:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
