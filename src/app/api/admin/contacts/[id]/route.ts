export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateSession, errorResponse, successResponse, sanitizeInput } from '@/lib/api-utils'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/admin/contacts/[id] - Buscar contato específico (apenas admins)
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const contact = await prisma.contact.findUnique({ where: { id } })

    if (!contact) {
      return errorResponse('Contato não encontrado', 404)
    }

    // Marcar como lido se ainda não foi
    if (contact.status === 'new') {
      await prisma.contact.update({ where: { id }, data: { status: 'read' } })
    }

    return NextResponse.json(successResponse(contact))
  } catch (error) {
    console.error('Erro ao buscar contato:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// PUT /api/admin/contacts/[id] - Atualizar status do contato (apenas admins)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }
    const existing = await prisma.contact.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Contato não encontrado', 404)
    }

    const body = await req.json()
    const { status } = sanitizeInput(body)

    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return errorResponse('Status inválido')
    }

    await prisma.contact.update({ where: { id }, data: { status } })

    return NextResponse.json(
      successResponse(contact, 'Status do contato atualizado com sucesso')
    )
  } catch (error: any) {
    console.error('Erro ao atualizar contato:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }
    
    return errorResponse('Erro interno do servidor', 500)
  }
}

// DELETE /api/admin/contacts/[id] - Deletar contato (apenas admins)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }
    const contact = await prisma.contact.findUnique({ where: { id } })
    if (!contact) {
      return errorResponse('Contato não encontrado', 404)
    }
    await prisma.contact.delete({ where: { id } })

    return NextResponse.json(
      successResponse(null, 'Contato deletado com sucesso')
    )
  } catch (error) {
    console.error('Erro ao deletar contato:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
