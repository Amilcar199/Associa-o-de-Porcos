export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import News from '@/models/News'
import {
  getPaginationParams,
  getSearchFilters,
  buildMongoQuery,
  paginateResults,
  successResponse,
  errorResponse,
  paginatedResponse,
  sanitizeInput,
  validateSession,
  generateSlug
} from '@/lib/api-utils'
import { getTargetLocales, DEFAULT_CONTENT_LOCALE } from '@/lib/translation/config'
import { getGlossary } from '@/lib/translation/glossary'
import { translateRichText } from '@/lib/translation/service'

// GET /api/news - Listar notícias com paginação e filtros
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const pagination = getPaginationParams(searchParams)
    const filters = getSearchFilters(searchParams)

    // Filtros específicos para notícias
    const newsFilters: any = {}
    
    if (searchParams.get('author')) {
      newsFilters.author = searchParams.get('author')
    }
    if (searchParams.get('slug')) {
      newsFilters.slug = searchParams.get('slug')
    }

    // Filtros de data
    if (searchParams.get('dateFrom')) {
      const dateFrom = new Date(searchParams.get('dateFrom')!)
      newsFilters.publishedAt = { ...newsFilters.publishedAt, $gte: dateFrom }
    }
    if (searchParams.get('dateTo')) {
      const dateTo = new Date(searchParams.get('dateTo')!)
      newsFilters.publishedAt = { ...newsFilters.publishedAt, $lte: dateTo }
    }

    // Construir query final
    const baseQuery = buildMongoQuery(filters)
    const finalQuery = { 
      ...baseQuery, 
      ...newsFilters,
      published: true // Apenas notícias publicadas para o público
    }

    // Se for busca por slug específico, retornar apenas um resultado
    if (newsFilters.slug) {
      const news = await News.findOne(finalQuery).populate('author', 'name avatar')
      
      if (!news) {
        return errorResponse('Notícia não encontrada', 404)
      }

      // Incrementar visualizações
      await News.findByIdAndUpdate(news._id, { $inc: { views: 1 } })

      return NextResponse.json(successResponse(news))
    }

    // Executar consulta com paginação
    const result = await paginateResults(
      News,
      finalQuery,
      pagination,
      'author'
    )

    return NextResponse.json(paginatedResponse(result.data, result.pagination))
  } catch (error) {
    console.error('Erro ao buscar notícias:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// POST /api/news - Criar nova notícia (apenas admins)
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Validar sessão (apenas admins podem criar notícias)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Definir o autor como o usuário logado
    sanitizedData.author = authResult.user.id

    // Gerar slug se não fornecido
    if (!sanitizedData.slug && sanitizedData.title) {
      sanitizedData.slug = generateSlug(sanitizedData.title)
      
      // Verificar se slug já existe
      const existingNews = await News.findOne({ slug: sanitizedData.slug })
      if (existingNews) {
        sanitizedData.slug = `${sanitizedData.slug}-${Date.now()}`
      }
    }

    // Definir data de publicação se publicado
    if (sanitizedData.published && !sanitizedData.publishedAt) {
      sanitizedData.publishedAt = new Date()
    }

    // i18n: preencher campos base e gerar traduções quando necessário
    const glossary = getGlossary()
    const targets = getTargetLocales()

    // Base PT (DEFAULT_CONTENT_LOCALE)
    const titlePt: string = sanitizedData.title || ''
    const excerptPt: string = sanitizedData.excerpt || ''
    const contentPt: string = sanitizeInput(sanitizedData.content || '')
    const { sanitizeHtmlSafe } = await import('@/lib/sanitize')
    const contentPtSan = sanitizeHtmlSafe(contentPt)

    const title_i18n: any = { [DEFAULT_CONTENT_LOCALE]: titlePt }
    const excerpt_i18n: any = { [DEFAULT_CONTENT_LOCALE]: excerptPt }
    const content_i18n: any = { [DEFAULT_CONTENT_LOCALE]: contentPtSan }
    const slug_i18n: any = {}
    const meta_i18n: any = { autoTranslated: {}, lockedByLocale: {} }

    // Garantir slug base PT
    sanitizedData.slug = sanitizedData.slug || generateSlug(titlePt)
    slug_i18n[DEFAULT_CONTENT_LOCALE] = sanitizedData.slug

    // Traduzir para cada alvo se não veio manualmente
    for (const locale of targets) {
      // title
      const manualTitle = sanitizedData[`title_${locale}`]
      if (manualTitle) {
        title_i18n[locale] = manualTitle
      } else {
        const { text, provider } = await translateRichText(titlePt, 'pt', locale, glossary)
        title_i18n[locale] = text
        meta_i18n.autoTranslated.title = { ...(meta_i18n.autoTranslated.title || {}), [locale]: true }
      }

      // excerpt -> summary
      const manualExcerpt = sanitizedData[`excerpt_${locale}`]
      if (manualExcerpt) {
        excerpt_i18n[locale] = manualExcerpt
      } else {
        const { text } = await translateRichText(excerptPt, 'pt', locale, glossary)
        excerpt_i18n[locale] = text
        meta_i18n.autoTranslated.summary = { ...(meta_i18n.autoTranslated.summary || {}), [locale]: true }
      }

      // content -> body
      const manualContent = sanitizedData[`content_${locale}`]
      if (manualContent) {
        content_i18n[locale] = manualContent
      } else {
        const { text } = await translateRichText(contentPtSan, 'pt', locale, glossary)
        content_i18n[locale] = sanitizeHtmlSafe(text)
        meta_i18n.autoTranslated.body = { ...(meta_i18n.autoTranslated.body || {}), [locale]: true }
      }

      // slug por idioma (derivado do título traduzido, editável depois)
      const manualSlug = sanitizedData[`slug_${locale}`]
      const baseTitle = title_i18n[locale] || manualTitle || titlePt
      slug_i18n[locale] = manualSlug || generateSlug(baseTitle)
    }

    // Incorporar no payload
    sanitizedData.title_i18n = title_i18n
    sanitizedData.excerpt_i18n = excerpt_i18n
    sanitizedData.content_i18n = content_i18n
    sanitizedData.slug_i18n = slug_i18n
    sanitizedData.meta_i18n = meta_i18n

    // Criar notícia
    const news = new News(sanitizedData)
    await news.save()

    // Buscar notícia com dados do autor
    const populatedNews = await News.findById(news._id).populate('author', 'name avatar')

    return NextResponse.json(
      successResponse(populatedNews, 'Notícia criada com sucesso'),
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao criar notícia:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }

    if (error.code === 11000 && error.keyPattern?.slug) {
      return errorResponse('Já existe uma notícia com este slug')
    }
    
    return errorResponse('Erro interno do servidor', 500)
  }
}
