export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, sanitizeInput, successResponse, validateSession } from '@/lib/api-utils'
import { parsePlanInput, SubscriptionError } from '@/lib/subscriptions'
import { savePlan } from '@/lib/subscription-service'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)
    if (!/^[a-f\d]{24}$/i.test(params.id)) return errorResponse('Plano inválido')
    const parsed = parsePlanInput(sanitizeInput(await req.json()))
    if ('error' in parsed) return errorResponse(parsed.error ?? 'Dados inválidos')
    const actorId = String((auth.user as { id?: string }).id || '')
    const plan = await savePlan(parsed.value, actorId, params.id)
    return NextResponse.json(successResponse(plan, 'Plano actualizado'))
  } catch (error) {
    if (error instanceof SubscriptionError) return errorResponse(error.message, error.status)
    console.error('Erro ao actualizar plano:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
