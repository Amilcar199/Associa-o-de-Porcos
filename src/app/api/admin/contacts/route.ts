import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
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

export const dynamic = 'force-dynamic'

// GET /api/admin/contacts - Listar contatos para admins
export async function GET(req: NextRequest) {
  try {
    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const filters = getSearchFilters(searchParams)

    // Construir where
    const where: any = {}
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } }
      ]
    }
    if (searchParams.get('email')) {
      where.email = { contains: searchParams.get('email')!, mode: 'insensitive' }
    }
    if (filters.status !== undefined) {
      where.status = String(filters.status)
    }
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) (where.createdAt as any).gte = new Date(dateFrom)
      if (dateTo) (where.createdAt as any).lte = new Date(dateTo)
    }

    const total = await prisma.contact.count({ where })
    const data = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pagination.page! - 1) * pagination.limit!,
      take: pagination.limit!
    })

    return NextResponse.json(paginatedResponse(data as any, {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit!)
    }))
  } catch (error) {
    console.error('Erro ao buscar contatos:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
