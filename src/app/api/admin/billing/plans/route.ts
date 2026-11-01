export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, sanitizeInput, successResponse, validateSession } from '@/lib/api-utils'
import { parsePlanInput, SubscriptionError } from '@/lib/subscriptions'
import { savePlan } from '@/lib/subscription-service'

export async function POST(req: NextRequest) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)
    const parsed = parsePlanInput(sanitizeInput(await req.json()))
    if ('error' in parsed) return errorResponse(parsed.error ?? 'Dados inválidos')
    const actorId = String((auth.user as { id?: string }).id || '')
    const plan = await savePlan(parsed.value, actorId)
    return NextResponse.json(successResponse(plan, 'Plano criado'), { status: 201 })
  } catch (error) {
    if (error instanceof SubscriptionError) return errorResponse(error.message, error.status)
    console.error('Erro ao criar plano:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
