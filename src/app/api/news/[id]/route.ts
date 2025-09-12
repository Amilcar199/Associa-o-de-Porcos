export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import News from '@/models/News'
import { validateSession, errorResponse, successResponse, isValidObjectId, sanitizeInput, generateSlug } from '@/lib/api-utils'
import { getGlossary } from '@/lib/translation/glossary'
import { getTargetLocales, DEFAULT_CONTENT_LOCALE } from '@/lib/translation/config'
import { translateRichText } from '@/lib/translation/service'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/news/[id] - Buscar notícia específica
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID da notícia inválido')
    }

    const news = await News.findById(id)

    if (!news) {
      return errorResponse('Notícia não encontrada', 404)
    }

    // Incrementar visualizações se for uma requisição pública
    if (!req.headers.get('authorization')) {
      await news.incrementViews()
    }

    return NextResponse.json(successResponse(news))
  } catch (error) {
    console.error('Erro ao buscar notícia:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

// PUT /api/news/[id] - Atualizar notícia (apenas admins)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID da notícia inválido')
    }

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    // Buscar notícia existente
    const news = await News.findById(id)
    if (!news) {
      return errorResponse('Notícia não encontrada', 404)
    }

    const body = await req.json()
    const sanitizedData = sanitizeInput(body)

    // Atualizar notícia base
    if (sanitizedData.title) news.title = sanitizedData.title
    if (sanitizedData.excerpt) news.excerpt = sanitizedData.excerpt
    if (sanitizedData.content) {
      const { sanitizeHtmlSafe } = await import('@/lib/sanitize')
      news.content = sanitizeHtmlSafe(sanitizedData.content)
    }
    if (sanitizedData.category) news.category = sanitizedData.category
    if (sanitizedData.tags) news.tags = sanitizedData.tags
    if (typeof sanitizedData.published === 'boolean') news.published = sanitizedData.published
    if (sanitizedData.featuredImage) news.featuredImage = sanitizedData.featuredImage
    if (Array.isArray(sanitizedData.images)) news.images = sanitizedData.images

    // i18n update: fill only missing targets, respect manual overrides
    const targets = getTargetLocales()
    const glossary = getGlossary()
    news.title_i18n = news.title_i18n || ({} as any)
    news.excerpt_i18n = news.excerpt_i18n || ({} as any)
    news.content_i18n = news.content_i18n || ({} as any)
    news.slug_i18n = news.slug_i18n || ({} as any)
    news.meta_i18n = news.meta_i18n || ({} as any)
    news.meta_i18n.autoTranslated = news.meta_i18n.autoTranslated || {}
    news.meta_i18n.lockedByLocale = news.meta_i18n.lockedByLocale || {}

    // ensure base pt stored
    news.title_i18n[DEFAULT_CONTENT_LOCALE] = news.title
    news.excerpt_i18n[DEFAULT_CONTENT_LOCALE] = news.excerpt
    news.content_i18n[DEFAULT_CONTENT_LOCALE] = news.content
    news.slug_i18n[DEFAULT_CONTENT_LOCALE] = news.slug || generateSlug(news.title)

    for (const locale of targets) {
      if (news.meta_i18n.lockedByLocale?.[locale]) continue

      const manualTitle = sanitizedData[`title_${locale}`]
      if (manualTitle) {
        news.title_i18n[locale] = manualTitle
      } else if (!news.title_i18n[locale] && news.title) {
        const { text } = await translateRichText(news.title, 'pt', locale, glossary)
        news.title_i18n[locale] = text
        news.meta_i18n.autoTranslated.title = { ...(news.meta_i18n.autoTranslated.title || {}), [locale]: true }
      }

      const manualExcerpt = sanitizedData[`excerpt_${locale}`]
      if (manualExcerpt) {
        news.excerpt_i18n[locale] = manualExcerpt
      } else if (!news.excerpt_i18n[locale] && news.excerpt) {
        const { text } = await translateRichText(news.excerpt, 'pt', locale, glossary)
        news.excerpt_i18n[locale] = text
        news.meta_i18n.autoTranslated.summary = { ...(news.meta_i18n.autoTranslated.summary || {}), [locale]: true }
      }

      const manualContent = sanitizedData[`content_${locale}`]
      if (manualContent) {
        news.content_i18n[locale] = manualContent
      } else if (!news.content_i18n[locale] && news.content) {
        const { sanitizeHtmlSafe } = await import('@/lib/sanitize')
        const { text } = await translateRichText(news.content, 'pt', locale, glossary)
        news.content_i18n[locale] = sanitizeHtmlSafe(text)
        news.meta_i18n.autoTranslated.body = { ...(news.meta_i18n.autoTranslated.body || {}), [locale]: true }
      }

      const manualSlug = sanitizedData[`slug_${locale}`]
      if (manualSlug) {
        news.slug_i18n[locale] = manualSlug
      } else if (!news.slug_i18n[locale]) {
        const baseTitle = news.title_i18n[locale] || news.title
        news.slug_i18n[locale] = generateSlug(baseTitle)
      }
    }

    await news.save()

    return NextResponse.json(
      successResponse(news, 'Notícia atualizada com sucesso')
    )
  } catch (error: any) {
    console.error('Erro ao atualizar notícia:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return errorResponse(`Erro de validação: ${errors.join(', ')}`)
    }
    
    return errorResponse('Erro interno do servidor', 500)
  }
}

// DELETE /api/news/[id] - Deletar notícia (apenas admins)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const { id } = params

    if (!isValidObjectId(id)) {
      return errorResponse('ID da notícia inválido')
    }

    // Validar sessão (apenas admins)
    const authResult = await validateSession(req, true)
    if ('error' in authResult) {
      return errorResponse(authResult.error || 'Erro de autenticação', authResult.status)
    }

    const news = await News.findById(id)
    if (!news) {
      return errorResponse('Notícia não encontrada', 404)
    }

    // Deletar notícia permanentemente
    await News.findByIdAndDelete(id)

    return NextResponse.json(
      successResponse(null, 'Notícia deletada com sucesso')
    )
  } catch (error) {
    console.error('Erro ao deletar notícia:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
