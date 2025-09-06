export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import User from '@/models/User'
import { validateSession, errorResponse, successResponse, sanitizeInput, getPaginationParams, getSearchFilters, buildMongoQuery, buildMongoSort, paginateResults } from '@/lib/api-utils'

// GET /api/products - Listar produtos
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const filters = getSearchFilters(searchParams)

    // Construir query (apenas produtos ativos por padrão; incluir registros antigos sem o campo isActive)
    const baseQuery: any = { $or: [ { isActive: true }, { isActive: { $exists: false } } ] }
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

    // Validar dados obrigatórios
    if (!sanitizedData.name || !sanitizedData.breed || sanitizedData.price === undefined) {
      return errorResponse('Nome, raça e preço são obrigatórios')
    }

    // Validar campos obrigatórios do modelo
    if (!sanitizedData.healthStatus || sanitizedData.vaccinated === undefined) {
      return errorResponse('Status de saúde e status de vacinação são obrigatórios')
    }

    // Garantir que exista um seller válido (admin ativo)
    let seller = await User.findOne({ role: 'admin', isActive: true }).select('_id')
    if (!seller && process.env.NODE_ENV !== 'production') {
      try {
        const demo = new User({
          name: 'Admin Demo',
          email: 'admin@demo.local',
          password: 'admin123',
          role: 'admin',
          isActive: true
        })
        await demo.save()
        seller = { _id: demo._id } as any
      } catch (e) {
        console.error('Não foi possível criar admin demo:', e)
      }
    }
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
      price: sanitizedData.price,
      images: Array.isArray(sanitizedData.images) && sanitizedData.images.length
        ? sanitizedData.images
        : (sanitizedData.imageUrl ? [sanitizedData.imageUrl] : []),
      features: sanitizedData.features || [],
      healthStatus: sanitizedData.healthStatus || 'good',
      vaccinated: !!sanitizedData.vaccinated,
      location: sanitizedData.location,
      availability: sanitizedData.isAvailable === false ? 'reserved' : 'available',
      seller: seller._id,
      tags: sanitizedData.tags || []
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
