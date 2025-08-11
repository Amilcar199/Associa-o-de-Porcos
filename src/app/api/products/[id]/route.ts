export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { validateSession, errorResponse, successResponse, isValidObjectId, sanitizeInput } from '@/lib/api-utils'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/products/[id] - Buscar produto específico
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID do produto inválido')
    }

    const product = await Product.findById(id)

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
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID do produto inválido')
    }

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    // Buscar produto existente
    const product = await Product.findById(id)
    if (!product) {
      return errorResponse('Produto não encontrado', 404)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Validar dados obrigatórios
    if (!sanitizedData.name || !sanitizedData.breed || sanitizedData.price === undefined) {
      return errorResponse('Nome, raça e preço são obrigatórios')
    }

    // Mapear campos aceitos
    const updateData: any = {
      name: sanitizedData.name,
      description: sanitizedData.description,
      breed: sanitizedData.breed,
      age: sanitizedData.age,
      weight: sanitizedData.weight,
      price: sanitizedData.price,
      features: sanitizedData.features,
      healthStatus: sanitizedData.healthStatus,
      vaccinated: sanitizedData.vaccinated,
      location: sanitizedData.location,
      tags: sanitizedData.tags,
    }
    if (sanitizedData.images || sanitizedData.imageUrl) {
      updateData.images = Array.isArray(sanitizedData.images) && sanitizedData.images.length
        ? sanitizedData.images
        : (sanitizedData.imageUrl ? [sanitizedData.imageUrl] : [])
    }
    if (typeof sanitizedData.isAvailable === 'boolean') {
      updateData.availability = sanitizedData.isAvailable ? 'available' : 'reserved'
    } else if (sanitizedData.availability) {
      updateData.availability = sanitizedData.availability
    }

    // Atualizar produto
    Object.assign(product, updateData)
    await product.save()

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
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID do produto inválido')
    }

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const product = await Product.findById(id)
    if (!product) {
      return errorResponse('Produto não encontrado', 404)
    }

    // Deletar produto permanentemente
    await Product.findByIdAndDelete(id)

    return NextResponse.json(
      successResponse(null, 'Produto deletado com sucesso')
    )
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
