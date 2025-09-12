import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import News from '@/models/News'
import { errorResponse, successResponse, isValidObjectId, validateSession, generateSlug } from '@/lib/api-utils'
import { getTargetLocales, DEFAULT_CONTENT_LOCALE } from '@/lib/translation/config'
import { getGlossary } from '@/lib/translation/glossary'
import { translateRichText } from '@/lib/translation/service'
import { sanitizeHtmlSafe } from '@/lib/sanitize'

interface RouteParams { params: { id: string } }

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()

    const auth = await validateSession(req, true)
    if ('error' in auth) {
      return errorResponse(auth.error || 'Não autorizado', auth.status)
    }

    const { id } = params
    if (!isValidObjectId(id)) {
      return errorResponse('ID inválido')
    }

    const body = await req.json().catch(() => ({}))
    const locales: Array<'en'|'es'> = Array.isArray(body?.locales) && body.locales.length
      ? body.locales
      : (getTargetLocales() as Array<'en'|'es'>)
    const fields: Array<'title'|'summary'|'body'> = Array.isArray(body?.fields) && body.fields.length
      ? body.fields
      : ['title','summary','body']
    const force: boolean = !!body?.force

    const doc: any = await News.findById(id)
    if (!doc) return errorResponse('Notícia não encontrada', 404)

    doc.title_i18n = doc.title_i18n || {}
    doc.excerpt_i18n = doc.excerpt_i18n || {}
    doc.content_i18n = doc.content_i18n || {}
    doc.slug_i18n = doc.slug_i18n || {}
    doc.meta_i18n = doc.meta_i18n || {}
    doc.meta_i18n.autoTranslated = doc.meta_i18n.autoTranslated || {}
    doc.meta_i18n.lockedByLocale = doc.meta_i18n.lockedByLocale || {}

    // ensure base pt
    doc.title_i18n[DEFAULT_CONTENT_LOCALE] = doc.title
    doc.excerpt_i18n[DEFAULT_CONTENT_LOCALE] = doc.excerpt
    doc.content_i18n[DEFAULT_CONTENT_LOCALE] = doc.content
    doc.slug_i18n[DEFAULT_CONTENT_LOCALE] = doc.slug || generateSlug(doc.title)

    const glossary = getGlossary()

    for (const locale of locales) {
      if (doc.meta_i18n.lockedByLocale?.[locale]) continue
      if (fields.includes('title')) {
        if (force || !doc.title_i18n[locale]) {
          const { text } = await translateRichText(doc.title, 'pt', locale, glossary)
          doc.title_i18n[locale] = text
          doc.meta_i18n.autoTranslated.title = { ...(doc.meta_i18n.autoTranslated.title || {}), [locale]: true }
        }
      }
      if (fields.includes('summary')) {
        if (force || !doc.excerpt_i18n[locale]) {
          const { text } = await translateRichText(doc.excerpt || '', 'pt', locale, glossary)
          doc.excerpt_i18n[locale] = text
          doc.meta_i18n.autoTranslated.summary = { ...(doc.meta_i18n.autoTranslated.summary || {}), [locale]: true }
        }
      }
      if (fields.includes('body')) {
        if (force || !doc.content_i18n[locale]) {
          const { text } = await translateRichText(doc.content || '', 'pt', locale, glossary)
          doc.content_i18n[locale] = sanitizeHtmlSafe(text)
          doc.meta_i18n.autoTranslated.body = { ...(doc.meta_i18n.autoTranslated.body || {}), [locale]: true }
        }
      }

      // slug per locale
      const baseTitle = doc.title_i18n[locale] || doc.title
      doc.slug_i18n[locale] = generateSlug(baseTitle)
    }

    await doc.save()
    return NextResponse.json(successResponse(doc, 'Retradução concluída'))
  } catch (e) {
    console.error('Erro ao retraduzir notícia:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

