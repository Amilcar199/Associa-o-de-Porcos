export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateSession, errorResponse, successResponse, sanitizeInput } from '@/lib/api-utils'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/products/[id] - Buscar produto específico
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const product = await prisma.product.findUnique({ where: { id } })

    if (!product) {
      return errorResponse('Produto não encontrado', 404)
    }

    return NextResponse.json(successResponse(product))
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// PUT /api/products/[id] - Atualizar produto (apenas admins)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    // Buscar produto existente
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Produto não encontrado', 404)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Validar dados obrigatórios (exigir algum modelo de preço)
    if (!sanitizedData.name || !sanitizedData.breed) {
      return errorResponse('Nome e raça são obrigatórios')
    }
    if (sanitizedData.price === undefined && sanitizedData.pricePerKg === undefined) {
      return errorResponse('Informe preço por cabeça (price) ou preço por kg (pricePerKg)')
    }

    // Validar campos obrigatórios do modelo
    if (!sanitizedData.healthStatus || !sanitizedData.vaccinated === undefined) {
      return errorResponse('Status de saúde e status de vacinação são obrigatórios')
    }

    const images = (Array.isArray(sanitizedData.images) && sanitizedData.images.length
      ? sanitizedData.images
      : (sanitizedData.imageUrl ? [sanitizedData.imageUrl] : undefined)) as string[] | undefined
    const videos = Array.isArray(sanitizedData.videos) ? sanitizedData.videos as string[] : undefined
    const tags = Array.isArray(sanitizedData.tags) ? sanitizedData.tags as string[] : undefined

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: sanitizedData.name,
        description: sanitizedData.description,
        breed: sanitizedData.breed,
        age: sanitizedData.age,
        weight: sanitizedData.weight,
        price: sanitizedData.price ?? existing.price,
        pricePerKg: sanitizedData.pricePerKg ?? existing.pricePerKg,
        saleForm: sanitizedData.saleForm ?? existing.saleForm,
        features: (sanitizedData.features ?? existing.features) as any,
        healthStatus: sanitizedData.healthStatus,
        vaccinated: sanitizedData.vaccinated,
        location: sanitizedData.location,
        tags: (tags ?? existing.tags) as any,
        images: (images ?? (existing.images as any)) as any,
        videos: (videos ?? (existing.videos as any)) as any,
        availability: typeof sanitizedData.isAvailable === 'boolean'
          ? (sanitizedData.isAvailable ? 'available' : 'reserved')
          : (sanitizedData.availability ?? existing.availability)
      }
    })

    return NextResponse.json(
      successResponse(product, 'Produto atualizado com sucesso')
    )
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }
    
    return errorResponse('Erro interno do servidor', 500)
  }
}

// DELETE /api/products/[id] - Deletar produto (apenas admins)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return errorResponse('Produto não encontrado', 404)
    }
    await prisma.product.delete({ where: { id } })

    return NextResponse.json(
      successResponse(null, 'Produto deletado com sucesso')
    )
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
