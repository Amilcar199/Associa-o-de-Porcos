export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import News from '@/models/News'
import {
  getPaginationParams,
  getSearchFilters,
  buildMongoQuery,
  paginateResults,
  successResponse,
  errorResponse,
  validateSession
} from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Apenas admins
    const auth = await validateSession(req, true)
    if ('error' in auth) {
      return errorResponse(auth.error || 'Não autorizado', auth.status)
    }

    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const filters = getSearchFilters(searchParams)

    // Remover a imposição de published:true (admin vê tudo); permitir filtro opcional published
    const adminFilters: any = {}
    if (searchParams.get('published') === 'true') adminFilters.published = true
    if (searchParams.get('published') === 'false') adminFilters.published = false

    const baseQuery = buildMongoQuery(filters)
    const finalQuery = { ...baseQuery, ...adminFilters }

    const result = await paginateResults(
      News,
      finalQuery,
      pagination,
      'author'
    )

    return NextResponse.json({ success: true, data: result.data, pagination: result.pagination })
  } catch (error) {
    console.error('Erro ao listar notícias (admin):', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}