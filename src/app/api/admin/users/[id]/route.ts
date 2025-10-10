export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateSession, errorResponse, successResponse } from '@/lib/api-utils'

interface RouteParams { params: { id: string } }

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const { id } = params
    const user = await prisma.user.findUnique({ where: { id }, select: {
      name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true,
      company: true, bio: true, location: true, phone: true, website: true, avatar: true, social: true
    } })

    if (!user) return errorResponse('Usuário não encontrado', 404)

    return NextResponse.json(successResponse(user, 'Usuário encontrado'))
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const { id } = params
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
    if (body.socialMedia) update.social = body.socialMedia

    const user = await prisma.user.update({ where: { id }, data: update, select: {
      name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true,
      company: true, bio: true, location: true, phone: true, website: true, avatar: true, social: true
    } })
    
    if (!user) return errorResponse('Usuário não encontrado', 404)

    return NextResponse.json(successResponse(user, 'Usuário atualizado'))
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    const { id } = params
    // Verificar se o usuário não é o último admin
    const userToDelete = await prisma.user.findUnique({ where: { id } })
    if (!userToDelete) return errorResponse('Usuário não encontrado', 404)

    if (userToDelete.role === 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin', isActive: true } })
      if (adminCount <= 1) {
        return errorResponse('Não é possível excluir o último administrador ativo', 400)
      }
    }

    // Excluir o usuário
    await prisma.user.delete({ where: { id } })

    return NextResponse.json(successResponse({}, 'Usuário excluído com sucesso'))
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}