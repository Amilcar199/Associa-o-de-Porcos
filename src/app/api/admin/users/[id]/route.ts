export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { validateSession, errorResponse, successResponse, isValidObjectId } from '@/lib/api-utils'

interface RouteParams { params: { id: string } }

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const { id } = params
    if (!isValidObjectId(id)) return errorResponse('ID inválido')

    const user = await User.findById(id)
      .select('name email role isActive createdAt updatedAt company bio location phone website socialMedia avatar')
      .lean()

    if (!user) return errorResponse('Usuário não encontrado', 404)

    return NextResponse.json(successResponse(user, 'Usuário encontrado'))
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const { id } = params
    if (!isValidObjectId(id)) return errorResponse('ID inválido')

    const body = await req.json()
    const update: any = {}
    
    // Campos que podem ser atualizados
    if (body.role && ['admin', 'member', 'visitor'].includes(body.role)) update.role = body.role
    if (typeof body.isActive === 'boolean') update.isActive = body.isActive
    if (body.name && body.name.trim()) update.name = body.name.trim()
    if (body.company !== undefined) update.company = body.company?.trim() || null
    if (body.bio !== undefined) update.bio = body.bio?.trim() || null
    if (body.location !== undefined) update.location = body.location?.trim() || null
    if (body.phone !== undefined) update.phone = body.phone?.trim() || null
    if (body.website !== undefined) update.website = body.website?.trim() || null
    if (body.socialMedia) update.socialMedia = body.socialMedia

    const user = await User.findByIdAndUpdate(id, update, { new: true })
      .select('name email role isActive createdAt updatedAt company bio location phone website socialMedia avatar')
    
    if (!user) return errorResponse('Usuário não encontrado', 404)

    return NextResponse.json(successResponse(user, 'Usuário atualizado'))
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const { id } = params
    if (!isValidObjectId(id)) return errorResponse('ID inválido')

    // Verificar se o usuário não é o último admin
    const userToDelete = await User.findById(id)
    if (!userToDelete) return errorResponse('Usuário não encontrado', 404)

    if (userToDelete.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true })
      if (adminCount <= 1) {
        return errorResponse('Não é possível excluir o último administrador ativo', 400)
      }
    }

    // Excluir o usuário
    await User.findByIdAndDelete(id)

    return NextResponse.json(successResponse({}, 'Usuário excluído com sucesso'))
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}