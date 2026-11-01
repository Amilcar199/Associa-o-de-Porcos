export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, sanitizeInput, successResponse, validateSession } from '@/lib/api-utils'
import { SubscriptionError } from '@/lib/subscriptions'
import { reactivateSubscription, suspendSubscription } from '@/lib/subscription-service'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)
    if (!/^[a-f\d]{24}$/i.test(params.id)) return errorResponse('Subscrição inválida')
    const body = sanitizeInput(await req.json())
    const actorId = String((auth.user as { id?: string }).id || '')
    const subscription = body.action === 'suspend'
      ? await suspendSubscription(params.id, actorId)
      : body.action === 'reactivate'
        ? await reactivateSubscription(params.id, actorId)
        : null
    if (!subscription) return errorResponse('Acção inválida')
    return NextResponse.json(successResponse(subscription, body.action === 'suspend' ? 'Subscrição suspensa' : 'Subscrição reactivada'))
  } catch (error) {
    if (error instanceof SubscriptionError) return errorResponse(error.message, error.status)
    console.error('Erro ao actualizar a subscrição:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
