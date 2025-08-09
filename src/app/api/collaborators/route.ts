import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Collaborator from '@/models/Collaborator'
import {
  getPaginationParams,
  getSearchFilters,
  buildMongoQuery,
  paginateResults,
  successResponse,
  errorResponse,
  paginatedResponse,
  sanitizeInput,
  validateSession
} from '@/lib/api-utils'

// GET /api/collaborators - Listar colaboradores com paginação e filtros
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const filters = getSearchFilters(searchParams)

    // Construir query final
    const baseQuery = buildMongoQuery(filters)
    const finalQuery = { 
      ...baseQuery,
      isActive: true 
    }

    // Executar consulta com paginação
    const result = await paginateResults(
      Collaborator,
      finalQuery,
      pagination
    )

    return NextResponse.json(paginatedResponse(result.data, result.pagination))
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// POST /api/collaborators - Criar novo colaborador (apenas admins)
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Validar sessão (apenas admins podem criar colaboradores)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Se não foi definida uma ordem, pegar a próxima disponível
    if (!sanitizedData.order) {
      const maxOrder = await Collaborator.findOne().sort({ order: -1 }).select('order')
      sanitizedData.order = (maxOrder?.order || 0) + 1
    }

    // Criar colaborador
    const collaborator = new Collaborator(sanitizedData)
    await collaborator.save()

    return NextResponse.json(
      successResponse(collaborator, 'Colaborador criado com sucesso'),
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao criar colaborador:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }
    
    return errorResponse('Erro interno do servidor', 500)
  }
}
