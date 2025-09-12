export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { validateSession, errorResponse, successResponse, isValidObjectId, sanitizeInput, generateSlug } from '@/lib/api-utils'
import { getGlossary } from '@/lib/translation/glossary'
import { getTargetLocales, DEFAULT_CONTENT_LOCALE } from '@/lib/translation/config'
import { translateRichText } from '@/lib/translation/service'

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

    // Buscar o produto, mesmo se o campo isActive não existir (registros antigos)
    const product = await Product.findOne({ _id: id, $or: [ { isActive: true }, { isActive: { $exists: false } } ] })

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

    // i18n updates
    const targets = getTargetLocales()
    const glossary = getGlossary()
    ;(product as any).name_i18n = (product as any).name_i18n || {}
    ;(product as any).description_i18n = (product as any).description_i18n || {}
    ;(product as any).shortDescription_i18n = (product as any).shortDescription_i18n || {}
    ;(product as any).slug_i18n = (product as any).slug_i18n || {}
    ;(product as any).meta_i18n = (product as any).meta_i18n || {}
    ;(product as any).meta_i18n.autoTranslated = (product as any).meta_i18n.autoTranslated || {}
    ;(product as any).meta_i18n.lockedByLocale = (product as any).meta_i18n.lockedByLocale || {}

    ;(product as any).name_i18n[DEFAULT_CONTENT_LOCALE] = product.name
    ;(product as any).description_i18n[DEFAULT_CONTENT_LOCALE] = product.description
    if (sanitizedData.shortDescription) {
      ;(product as any).shortDescription_i18n[DEFAULT_CONTENT_LOCALE] = sanitizedData.shortDescription
    }
    ;(product as any).slug_i18n[DEFAULT_CONTENT_LOCALE] = generateSlug(product.name)

    for (const locale of targets) {
      if ((product as any).meta_i18n.lockedByLocale?.[locale]) continue
      const manualName = sanitizedData[`name_${locale}`]
      if (manualName) {
        ;(product as any).name_i18n[locale] = manualName
      } else if (!(product as any).name_i18n[locale] && product.name) {
        const { text } = await translateRichText(product.name, 'pt', locale, glossary)
        ;(product as any).name_i18n[locale] = text
        ;(product as any).meta_i18n.autoTranslated.name = { ...((product as any).meta_i18n.autoTranslated.name || {}), [locale]: true }
      }

      const manualShort = sanitizedData[`shortDescription_${locale}`]
      const baseShort = sanitizedData.shortDescription || product.shortDescription_i18n?.[DEFAULT_CONTENT_LOCALE]
      if (manualShort) {
        ;(product as any).shortDescription_i18n[locale] = manualShort
      } else if (!(product as any).shortDescription_i18n[locale] && baseShort) {
        const { text } = await translateRichText(baseShort, 'pt', locale, glossary)
        ;(product as any).shortDescription_i18n[locale] = text
        ;(product as any).meta_i18n.autoTranslated.shortDescription = { ...((product as any).meta_i18n.autoTranslated.shortDescription || {}), [locale]: true }
      }

      const manualDesc = sanitizedData[`description_${locale}`]
      if (manualDesc) {
        ;(product as any).description_i18n[locale] = manualDesc
      } else if (!(product as any).description_i18n[locale] && product.description) {
        const { text } = await translateRichText(product.description, 'pt', locale, glossary)
        ;(product as any).description_i18n[locale] = text
        ;(product as any).meta_i18n.autoTranslated.description = { ...((product as any).meta_i18n.autoTranslated.description || {}), [locale]: true }
      }

      const manualSlug = sanitizedData[`slug_${locale}`]
      if (manualSlug) {
        ;(product as any).slug_i18n[locale] = manualSlug
      } else if (!(product as any).slug_i18n[locale]) {
        const base = (product as any).name_i18n[locale] || product.name
        ;(product as any).slug_i18n[locale] = generateSlug(base)
      }
    }

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
