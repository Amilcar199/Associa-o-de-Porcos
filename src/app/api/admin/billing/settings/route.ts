export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, sanitizeInput, successResponse, validateSession } from '@/lib/api-utils'
import { parsePaymentSettings, SubscriptionError } from '@/lib/subscriptions'
import { savePaymentSettings } from '@/lib/subscription-service'

export async function PUT(req: NextRequest) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)
    const parsed = parsePaymentSettings(sanitizeInput(await req.json()))
    if ('error' in parsed) return errorResponse(parsed.error ?? 'Dados inválidos')
    const actorId = String((auth.user as { id?: string }).id || '')
    const settings = await savePaymentSettings(parsed.value, actorId)
    return NextResponse.json(successResponse(settings, 'Contas de pagamento actualizadas'))
  } catch (error) {
    if (error instanceof SubscriptionError) return errorResponse(error.message, error.status)
    console.error('Erro ao gravar contas de pagamento:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
