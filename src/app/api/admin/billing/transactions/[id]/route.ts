export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, sanitizeInput, successResponse, validateSession } from '@/lib/api-utils'
import { SubscriptionError } from '@/lib/subscriptions'
import { confirmTransaction, rejectTransaction } from '@/lib/subscription-service'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)
    if (!/^[a-f\d]{24}$/i.test(params.id)) return errorResponse('Transacção inválida')
    const body = sanitizeInput(await req.json())
    const note = String(body.note || '').trim()
    const actorId = String((auth.user as { id?: string }).id || '')
    const transaction = body.action === 'confirm'
      ? await confirmTransaction(params.id, actorId, note)
      : body.action === 'reject'
        ? await rejectTransaction(params.id, actorId, note)
        : null
    if (!transaction) return errorResponse('Acção inválida')
    return NextResponse.json(successResponse(transaction, body.action === 'confirm' ? 'Pagamento confirmado' : 'Pagamento recusado'))
  } catch (error) {
    if (error instanceof SubscriptionError) return errorResponse(error.message, error.status)
    console.error('Erro ao fechar a transacção:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
