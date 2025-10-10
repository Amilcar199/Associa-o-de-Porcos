import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse, sanitizeInput } from '@/lib/api-utils'

interface RouteParams {
  params: { id: string }
}

// GET /api/admin/member-content/[id] - Buscar conteúdo específico
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return errorResponse('Acesso negado. Apenas administradores podem acessar este recurso.', 403)
    }

    const { id } = params
    const content = await prisma.memberContent.findUnique({
      where: { id },
      select: { id: true, title: true, type: true, category: true, createdAt: true, author: { select: { name: true, email: true } } }
    })

    if (!content) {
      return errorResponse('Conteúdo não encontrado', 404)
    }

    return NextResponse.json(successResponse(content))
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// PATCH /api/admin/member-content/[id] - Atualizar conteúdo
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return errorResponse('Acesso negado. Apenas administradores podem acessar este recurso.', 403)
    }

    const { id } = params

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    const existingContent = await prisma.memberContent.findUnique({ where: { id } })
    if (!existingContent) {
      return errorResponse('Conteúdo não encontrado', 404)
    }

    // Atualizar campos permitidos
    const allowedFields = [
      'title', 'description', 'type', 'category', 'url', 'thumbnail',
      'content', 'fileUrl', 'videoUrl', 'eventDate', 'eventLocation',
      'isFeatured', 'isActive', 'tags'
    ]

    allowedFields.forEach(field => {
      if ((sanitizedData as any)[field] !== undefined) {
        ;(existingContent as any)[field] = (sanitizedData as any)[field]
      }
    })

    const updated = await prisma.memberContent.update({ where: { id }, data: updateFields })
    return NextResponse.json(successResponse(updated, 'Conteúdo atualizado com sucesso'))
  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// DELETE /api/admin/member-content/[id] - Excluir conteúdo
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return errorResponse('Acesso negado. Apenas administradores podem acessar este recurso.', 403)
    }

    const { id } = params
    const content = await prisma.memberContent.findUnique({ where: { id } })
    if (!content) {
      return errorResponse('Conteúdo não encontrado', 404)
    }
    await prisma.memberContent.delete({ where: { id } })
    return NextResponse.json(successResponse({}, 'Conteúdo excluído com sucesso'))
  } catch (error) {
    console.error('Erro ao excluir conteúdo:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}