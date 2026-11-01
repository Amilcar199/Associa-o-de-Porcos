export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, sanitizeInput, successResponse, validateSession } from '@/lib/api-utils'
import { parseRefundInput, SubscriptionError } from '@/lib/subscriptions'
import { recordRefund } from '@/lib/subscription-service'

export async function POST(req: NextRequest) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)
    const parsed = parseRefundInput(sanitizeInput(await req.json()))
    if ('error' in parsed) return errorResponse(parsed.error ?? 'Dados inválidos')
    const actorId = String((auth.user as { id?: string }).id || '')
    const refund = await recordRefund(parsed.value, actorId)
    return NextResponse.json(successResponse(refund, 'Reembolso registado'), { status: 201 })
  } catch (error) {
    if (error instanceof SubscriptionError) return errorResponse(error.message, error.status)
    console.error('Erro ao registar reembolso:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
