export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { validateSession, errorResponse, successResponse, isValidObjectId, sanitizeInput } from '@/lib/api-utils'
import { publicListingFilter } from '@/lib/pig-listings'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    const product = await Product.findOne({ _id: id, ...publicListingFilter() })
    if (!product) {
      const session = await getServerSession(authOptions)
      const userId = (session as any)?.user?.id
      const isAdmin = (session as any)?.user?.role === 'admin'
      const own = userId
        ? await Product.findOne({ _id: id, ...(isAdmin ? {} : { seller: userId }) })
        : null
      if (!own) return errorResponse('Produto não encontrado', 404)
      return NextResponse.json(successResponse(own))
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

    // Mapear campos aceitos
    const updateData: any = {
      name: sanitizedData.name,
      description: sanitizedData.description,
      breed: sanitizedData.breed,
      age: sanitizedData.age,
      weight: sanitizedData.weight,
      price: sanitizedData.price,
      pricePerKg: sanitizedData.pricePerKg,
      saleForm: sanitizedData.saleForm,
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
    if (sanitizedData.videos) {
      updateData.videos = Array.isArray(sanitizedData.videos) ? sanitizedData.videos : []
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
