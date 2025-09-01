export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ActivityLog from '@/models/ActivityLog'
import User from '@/models/User'
import { validateSession, errorResponse, successResponse, isValidObjectId } from '@/lib/api-utils'

interface RouteParams { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const { id } = params
    if (!isValidObjectId(id)) return errorResponse('ID inválido')

    const body = await req.json().catch(() => ({}))
    const action: 'approve' | 'reject' = body.action
    if (!['approve', 'reject'].includes(action)) return errorResponse('Ação inválida')

    const log = await ActivityLog.findById(id)
    if (!log || log.type !== 'membership_request') return errorResponse('Solicitação não encontrada', 404)

    const userId = log.user
    const user = await User.findById(userId)
    if (!user) return errorResponse('Usuário não encontrado', 404)

    if (action === 'approve') {
      if (user.role === 'member') return errorResponse('Usuário já é membro', 400)
      user.role = 'member'
      await user.save()
    }

    await log.deleteOne()

    return NextResponse.json(successResponse({}, action === 'approve' ? 'Solicitação aprovada' : 'Solicitação rejeitada'))
  } catch (e) {
    console.error('Erro ao processar solicitação:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

