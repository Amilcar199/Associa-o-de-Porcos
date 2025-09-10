export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import User from '@/models/User'
import { validateSession, errorResponse, successResponse, sanitizeInput, getPaginationParams, getSearchFilters, buildMongoQuery, buildMongoSort, paginateResults } from '@/lib/api-utils'
import { getGlossary } from '@/lib/translation/glossary'
import { getTargetLocales, DEFAULT_CONTENT_LOCALE } from '@/lib/translation/config'
import { translateRichText } from '@/lib/translation/service'
import { generateSlug } from '@/lib/api-utils'

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

    // i18n: gerar traduções e slugs por idioma
    const glossary = getGlossary()
    const targets = getTargetLocales()
    const namePt: string = productData.name || ''
    const { sanitizeHtmlSafe } = await import('@/lib/sanitize')
    const descPt: string = sanitizeHtmlSafe(productData.description || '')
    const shortPt: string = (sanitizedData.shortDescription || '').toString()

    const name_i18n: any = { [DEFAULT_CONTENT_LOCALE]: namePt }
    const description_i18n: any = { [DEFAULT_CONTENT_LOCALE]: descPt }
    const shortDescription_i18n: any = { [DEFAULT_CONTENT_LOCALE]: shortPt }
    const slug_i18n: any = {}
    const meta_i18n: any = { autoTranslated: {}, lockedByLocale: {} }

    // slug base pt usando name
    slug_i18n[DEFAULT_CONTENT_LOCALE] = generateSlug(namePt)

    for (const locale of targets) {
      const manualName = sanitizedData[`name_${locale}`]
      if (manualName) {
        name_i18n[locale] = manualName
      } else if (namePt) {
        const { text } = await translateRichText(namePt, 'pt', locale, glossary)
        name_i18n[locale] = text
        meta_i18n.autoTranslated.name = { ...(meta_i18n.autoTranslated.name || {}), [locale]: true }
      }

      const manualShort = sanitizedData[`shortDescription_${locale}`]
      if (manualShort) {
        shortDescription_i18n[locale] = manualShort
      } else if (shortPt) {
        const { text } = await translateRichText(shortPt, 'pt', locale, glossary)
        shortDescription_i18n[locale] = text
        meta_i18n.autoTranslated.shortDescription = { ...(meta_i18n.autoTranslated.shortDescription || {}), [locale]: true }
      }

      const manualDesc = sanitizedData[`description_${locale}`]
      if (manualDesc) {
        description_i18n[locale] = manualDesc
      } else if (descPt) {
        const { text } = await translateRichText(descPt, 'pt', locale, glossary)
        description_i18n[locale] = sanitizeHtmlSafe(text)
        meta_i18n.autoTranslated.description = { ...(meta_i18n.autoTranslated.description || {}), [locale]: true }
      }

      const manualSlug = sanitizedData[`slug_${locale}`]
      const baseTitle = name_i18n[locale] || manualName || namePt
      slug_i18n[locale] = manualSlug || generateSlug(baseTitle)
    }

    productData.name_i18n = name_i18n
    productData.description_i18n = description_i18n
    productData.shortDescription_i18n = shortDescription_i18n
    productData.slug_i18n = slug_i18n
    productData.meta_i18n = meta_i18n

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
