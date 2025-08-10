export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Contact from '@/models/Contact'
import { validateSession, errorResponse, successResponse, isValidObjectId, sanitizeInput } from '@/lib/api-utils'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/admin/contacts/[id] - Buscar contato específico (apenas admins)
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID do contato inválido')
    }

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const contact = await Contact.findById(id)

    if (!contact) {
      return errorResponse('Contato não encontrado', 404)
    }

    // Marcar como lido se ainda não foi
    if (contact.status === 'new') {
      await contact.markAsRead()
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
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID do contato inválido')
    }

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const contact = await Contact.findById(id)
    if (!contact) {
      return errorResponse('Contato não encontrado', 404)
    }

    const body = await req.json()
    const { status } = sanitizeInput(body)

    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return errorResponse('Status inválido')
    }

    // Atualizar status
    contact.status = status
    await contact.save()

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
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID do contato inválido')
    }

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const contact = await Contact.findById(id)
    if (!contact) {
      return errorResponse('Contato não encontrado', 404)
    }

    // Deletar contato permanentemente
    await Contact.findByIdAndDelete(id)

    return NextResponse.json(
      successResponse(null, 'Contato deletado com sucesso')
    )
  } catch (error) {
    console.error('Erro ao deletar contato:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
