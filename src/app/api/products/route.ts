export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateSession, errorResponse, successResponse, sanitizeInput, getPaginationParams } from '@/lib/api-utils'

// GET /api/products - Listar produtos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const where: any = { isActive: true }
    const search = searchParams.get('search') || undefined
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { breed: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }
    const availability = searchParams.get('availability') || undefined
    if (availability) where.availability = availability

    const total = await prisma.product.count({ where })
    const data = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pagination.page! - 1) * pagination.limit!,
      take: pagination.limit!
    })
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit!)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// POST /api/products - Criar produto (apenas admins)
export async function POST(req: NextRequest) {
  try {
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

    // Garantir que exista um seller válido (admin ativo) em Prisma
    let seller = await prisma.user.findFirst({ where: { role: 'admin', isActive: true }, select: { id: true } })
    if (!seller && process.env.NODE_ENV !== 'production') {
      try {
        const demo = await prisma.user.create({ data: {
          name: 'Admin Demo', email: 'admin@demo.local', password: 'admin123', role: 'admin', isActive: true
        }, select: { id: true } })
        seller = demo
      } catch (e) {
        console.error('Não foi possível criar admin demo:', e)
      }
    }
    if (!seller) return errorResponse('Nenhum administrador ativo encontrado para atribuir como vendedor. Crie um admin primeiro.')

    // Mapear campos do formulário para o schema Product
    const productData: any = {
      name: sanitizedData.name,
      description: sanitizedData.description,
      breed: sanitizedData.breed,
      age: sanitizedData.age,
      weight: sanitizedData.weight,
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
      if (!sanitizedData.code) {
        const year = new Date().getFullYear()
        const prefix = `${String(sanitizedData.breed).toUpperCase()}-${year}-`
        const last = await prisma.product.findFirst({
          where: { code: { startsWith: prefix } },
          orderBy: { code: 'desc' },
          select: { code: true }
        })
        let seq = 1
        if (last?.code) {
          const parts = last.code.split('-')
          const n = parseInt(parts[2] || '0', 10)
          if (!Number.isNaN(n)) seq = n + 1
        }
        productData.code = `${prefix}${String(seq).padStart(3, '0')}`
      } else {
        productData.code = sanitizedData.code
      }
    } catch (e) {
      return errorResponse('Falha ao gerar código automático')
    }

    // Criar produto
    const product = await prisma.product.create({ data: {
      name: productData.name,
      description: productData.description,
      breed: productData.breed,
      age: productData.age,
      weight: productData.weight,
      price: productData.price ?? null,
      pricePerKg: productData.pricePerKg ?? null,
      saleForm: productData.saleForm ?? null,
      images: productData.images as any,
      videos: (productData.videos || []) as any,
      features: (productData.features || []) as any,
      healthStatus: productData.healthStatus,
      vaccinated: productData.vaccinated,
      location: productData.location,
      code: productData.code,
      availability: productData.availability,
      sellerId: seller.id,
      tags: (productData.tags || []) as any,
      isActive: true
    }})

    return NextResponse.json(successResponse(product, 'Produto criado com sucesso'), { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar produto:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }

    return errorResponse('Erro interno do servidor', 500)
  }
}
