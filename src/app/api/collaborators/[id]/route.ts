export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateSession, errorResponse, successResponse, sanitizeInput } from '@/lib/api-utils'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/collaborators/[id] - Buscar colaborador específico
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const collaborator = await prisma.collaborator.findUnique({ where: { id } })

    if (!collaborator) {
      return errorResponse('Colaborador não encontrado', 404)
    }

    return NextResponse.json(successResponse(collaborator))
  } catch (error) {
    console.error('Erro ao buscar colaborador:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// PUT /api/collaborators/[id] - Atualizar colaborador (apenas admins)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const existing = await prisma.collaborator.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Colaborador não encontrado', 404)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Validar dados obrigatórios
    if (!sanitizedData.name || !sanitizedData.role || !sanitizedData.company) {
      return errorResponse('Nome, cargo e empresa são obrigatórios')
    }

    const collaborator = await prisma.collaborator.update({
      where: { id },
      data: {
        name: sanitizedData.name,
        role: sanitizedData.role,
        company: sanitizedData.company || null,
        description: sanitizedData.description || null,
        avatar: sanitizedData.avatar,
        email: sanitizedData.email || null,
        phone: sanitizedData.phone || null,
        website: sanitizedData.website || null,
        linkedin: sanitizedData.socialMedia?.linkedin || null,
        instagram: sanitizedData.socialMedia?.instagram || null,
        facebook: sanitizedData.socialMedia?.facebook || null,
        isActive: sanitizedData.isActive !== false,
        featured: !!sanitizedData.featured,
        orderInt: typeof sanitizedData.order === 'number' ? sanitizedData.order : existing.orderInt,
      }
    })

    return NextResponse.json(
      successResponse(collaborator, 'Colaborador atualizado com sucesso')
    )
  } catch (error: any) {
    console.error('Erro ao atualizar colaborador:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }
    
    return errorResponse('Erro interno do servidor', 500)
  }
}

// DELETE /api/collaborators/[id] - Deletar colaborador (apenas admins)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const collaborator = await prisma.collaborator.findUnique({ where: { id } })
    if (!collaborator) {
      return errorResponse('Colaborador não encontrado', 404)
    }

    await prisma.collaborator.delete({ where: { id } })

    return NextResponse.json(
      successResponse(null, 'Colaborador deletado com sucesso')
    )
  } catch (error) {
    console.error('Erro ao deletar colaborador:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
