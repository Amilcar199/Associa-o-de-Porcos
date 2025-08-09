import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Collaborator from '@/models/Collaborator'
import { validateSession, errorResponse, successResponse, isValidObjectId, sanitizeInput } from '@/lib/api-utils'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/collaborators/[id] - Buscar colaborador específico
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID do colaborador inválido')
    }

    const collaborator = await Collaborator.findById(id)

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
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID do colaborador inválido')
    }

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    // Buscar colaborador existente
    const collaborator = await Collaborator.findById(id)
    if (!collaborator) {
      return errorResponse('Colaborador não encontrado', 404)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Validar dados obrigatórios
    if (!sanitizedData.name || !sanitizedData.role || !sanitizedData.company) {
      return errorResponse('Nome, cargo e empresa são obrigatórios')
    }

    // Atualizar colaborador
    Object.assign(collaborator, sanitizedData)
    await collaborator.save()

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
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID do colaborador inválido')
    }

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const collaborator = await Collaborator.findById(id)
    if (!collaborator) {
      return errorResponse('Colaborador não encontrado', 404)
    }

    // Deletar colaborador permanentemente
    await Collaborator.findByIdAndDelete(id)

    return NextResponse.json(
      successResponse(null, 'Colaborador deletado com sucesso')
    )
  } catch (error) {
    console.error('Erro ao deletar colaborador:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
