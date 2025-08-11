export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
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

    const body = await req.json()
    const update: any = {}
    if (body.role && ['admin', 'member', 'visitor'].includes(body.role)) update.role = body.role
    if (typeof body.isActive === 'boolean') update.isActive = body.isActive

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('name email role isActive createdAt')
    if (!user) return errorResponse('Usuário não encontrado', 404)

    return NextResponse.json(successResponse(user, 'Usuário atualizado'))
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}