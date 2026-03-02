export const dynamic = 'force-dynamic'

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
  sanitizeInput,
  validateSession
} from '@/lib/api-utils'

// GET /api/collaborators - Listar colaboradores com paginação e filtros
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const sort = searchParams.get('sort') || 'orderInt'
    const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc'

    const where: any = {
      OR: [
        { isActive: true },
        { isActive: undefined }
      ]
    }
    const search = searchParams.get('search')
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const total = await prisma.collaborator.count({ where })
    const data = await prisma.collaborator.findMany({
      where,
      orderBy: { [sort]: order },
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
    console.error('Erro ao buscar colaboradores:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// POST /api/collaborators - Criar novo colaborador (apenas admins)
export async function POST(req: NextRequest) {
  try {
    // Validar sessão (apenas admins podem criar colaboradores)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    const currentMax = await prisma.collaborator.aggregate({ _max: { orderInt: true } })
    const nextOrder = (currentMax._max.orderInt || 0) + 1

    const collaborator = await prisma.collaborator.create({
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
        orderInt: sanitizedData.order ?? nextOrder,
      }
    })

    return NextResponse.json(successResponse(collaborator, 'Colaborador criado com sucesso'), { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar colaborador:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }
    
    return errorResponse('Erro interno do servidor', 500)
  }
}
