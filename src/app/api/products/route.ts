export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import User from '@/models/User'
import { validateSession, errorResponse, successResponse, sanitizeInput, getPaginationParams, getSearchFilters, buildMongoQuery, buildMongoSort, paginateResults } from '@/lib/api-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { publicListingFilter } from '@/lib/pig-listings'

// GET /api/products - Listar produtos
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const filters = getSearchFilters(searchParams)
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    const isAdmin = (session as any)?.user?.role === 'admin'
    const mine = searchParams.get('mine') === '1'
    if (mine && !userId) return errorResponse('Não autorizado', 401)

    const baseQuery: any = mine
      ? { seller: userId, isActive: true }
      : isAdmin
        ? { $or: [{ isActive: true }, { isActive: { $exists: false } }] }
        : publicListingFilter()

    if (searchParams.get('breed')) baseQuery.breed = searchParams.get('breed')
    if (searchParams.get('saleForm')) baseQuery.saleForm = searchParams.get('saleForm')
    if (searchParams.get('location')) baseQuery.location = new RegExp(searchParams.get('location') || '', 'i')

    const query = { ...baseQuery, ...buildMongoQuery(filters) }
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

    // Validar dados obrigatórios (exigir pelo menos um modelo de preço)
    if (!sanitizedData.name || !sanitizedData.breed) {
      return errorResponse('Nome e raça são obrigatórios')
    }
    if (sanitizedData.price === undefined && sanitizedData.pricePerKg === undefined) {
      return errorResponse('Informe preço por cabeça (price) ou preço por kg (pricePerKg)')
    }

    // Validar campos obrigatórios do modelo
    if (!sanitizedData.healthStatus || sanitizedData.vaccinated === undefined) {
      return errorResponse('Status de saúde e status de vacinação são obrigatórios')
    }

    // Garantir que exista um seller válido (admin ativo)
    const seller = await User.findOne({ role: 'admin', isActive: true }).select('_id')
    if (!seller) {
      return errorResponse('Nenhum administrador ativo encontrado para atribuir como vendedor. Crie um admin primeiro.')
    }

    // Mapear campos do formulário para o schema Product
    const productData: any = {
      name: sanitizedData.name,
      description: sanitizedData.description,
      breed: sanitizedData.breed,
      age: sanitizedData.age,
      weight: sanitizedData.weight,
      quantity: sanitizedData.quantity || 1,
      price: sanitizedData.price,
      pricePerKg: sanitizedData.pricePerKg,
      saleForm: sanitizedData.saleForm,
      images: Array.isArray(sanitizedData.images) && sanitizedData.images.length
        ? sanitizedData.images
        : (sanitizedData.imageUrl ? [sanitizedData.imageUrl] : []),
      videos: Array.isArray(sanitizedData.videos) ? sanitizedData.videos : [],
      features: sanitizedData.features || [],
      healthStatus: sanitizedData.healthStatus || 'good',
      vaccinated: !!sanitizedData.vaccinated,
      location: sanitizedData.location,
      availability: sanitizedData.isAvailable === false ? 'reserved' : 'available',
      listingStatus: 'approved',
      seller: seller._id,
      tags: sanitizedData.tags || ['suíno']
    }

    if (!productData.location) {
      return errorResponse('Localização é obrigatória')
    }
    if (!productData.images || productData.images.length === 0) {
      return errorResponse('Pelo menos uma imagem é obrigatória')
    }

    // Garantir código do produto (server-side fallback)
    try {
      productData.code = sanitizedData.code || await Product.generateCode(sanitizedData.breed)
    } catch (e) {
      return errorResponse('Falha ao gerar código automático')
    }

    // Criar produto
    const product = new Product(productData)
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
