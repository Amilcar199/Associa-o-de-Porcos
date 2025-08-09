import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Contact from '@/models/Contact'
import {
  getPaginationParams,
  getSearchFilters,
  buildMongoQuery,
  paginateResults,
  successResponse,
  errorResponse,
  paginatedResponse,
  validateSession
} from '@/lib/api-utils'

// GET /api/admin/contacts - Listar contatos para admins
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const filters = getSearchFilters(searchParams)

    // Filtros específicos para contatos
    const contactFilters: any = {}
    
    if (searchParams.get('email')) {
      contactFilters.email = new RegExp(searchParams.get('email')!, 'i')
    }

    // Filtros de data
    if (searchParams.get('dateFrom')) {
      const dateFrom = new Date(searchParams.get('dateFrom')!)
      contactFilters.createdAt = { ...contactFilters.createdAt, $gte: dateFrom }
    }
    if (searchParams.get('dateTo')) {
      const dateTo = new Date(searchParams.get('dateTo')!)
      contactFilters.createdAt = { ...contactFilters.createdAt, $lte: dateTo }
    }

    // Construir query final
    const baseQuery = buildMongoQuery(filters)
    const finalQuery = { 
      ...baseQuery, 
      ...contactFilters
    }

    // Executar consulta com paginação
    const result = await paginateResults(
      Contact,
      finalQuery,
      pagination
    )

    return NextResponse.json(paginatedResponse(result.data, result.pagination))
  } catch (error) {
    console.error('Erro ao buscar contatos:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
