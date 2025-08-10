export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { validateSession, errorResponse, successResponse, sanitizeInput, getPaginationParams, getSearchFilters, buildMongoQuery, buildMongoSort, paginateResults } from '@/lib/api-utils'

// GET /api/products - Listar produtos
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const filters = getSearchFilters(searchParams)

    // Construir query
    const query = buildMongoQuery(filters)
    const sort = buildMongoSort(
      pagination.sort ?? 'createdAt', // valor padrão
      pagination.order ?? 'desc'      // valor padrão
    )

    // Buscar produtos com paginação
    const result = await paginateResults(Product, query, pagination)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// POST /api/products - Criar produto (apenas admins)
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Validar dados obrigatórios
    if (!sanitizedData.name || !sanitizedData.breed || !sanitizedData.price) {
      return errorResponse('Nome, raça e preço são obrigatórios')
    }

    // Criar produto
    const product = new Product(sanitizedData)
    await product.save()

    return NextResponse.json(
      successResponse(product, 'Produto criado com sucesso'),
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao criar produto:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }

    return errorResponse('Erro interno do servidor', 500)
  }
}
