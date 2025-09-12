import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
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
    if (!isValidObjectId(id)) return errorResponse('ID inválido')

    const body = await req.json().catch(() => ({}))
    const locales: Array<'en'|'es'> = Array.isArray(body?.locales) && body.locales.length
      ? body.locales
      : (getTargetLocales() as Array<'en'|'es'>)
    const fields: Array<'name'|'shortDescription'|'description'> = Array.isArray(body?.fields) && body.fields.length
      ? body.fields
      : ['name','shortDescription','description']
    const force: boolean = !!body?.force

    const doc: any = await Product.findById(id)
    if (!doc) return errorResponse('Produto não encontrado', 404)

    doc.name_i18n = doc.name_i18n || {}
    doc.shortDescription_i18n = doc.shortDescription_i18n || {}
    doc.description_i18n = doc.description_i18n || {}
    doc.slug_i18n = doc.slug_i18n || {}
    doc.meta_i18n = doc.meta_i18n || {}
    doc.meta_i18n.autoTranslated = doc.meta_i18n.autoTranslated || {}
    doc.meta_i18n.lockedByLocale = doc.meta_i18n.lockedByLocale || {}

    doc.name_i18n[DEFAULT_CONTENT_LOCALE] = doc.name
    doc.description_i18n[DEFAULT_CONTENT_LOCALE] = doc.description

    const glossary = getGlossary()

    for (const locale of locales) {
      if (doc.meta_i18n.lockedByLocale?.[locale]) continue
      if (fields.includes('name')) {
        if (force || !doc.name_i18n[locale]) {
          const { text } = await translateRichText(doc.name || '', 'pt', locale, glossary)
          doc.name_i18n[locale] = text
          doc.meta_i18n.autoTranslated.name = { ...(doc.meta_i18n.autoTranslated.name || {}), [locale]: true }
        }
      }
      if (fields.includes('shortDescription')) {
        const base = doc.shortDescription_i18n?.[DEFAULT_CONTENT_LOCALE]
        if (base && (force || !doc.shortDescription_i18n[locale])) {
          const { text } = await translateRichText(base, 'pt', locale, glossary)
          doc.shortDescription_i18n[locale] = text
          doc.meta_i18n.autoTranslated.shortDescription = { ...(doc.meta_i18n.autoTranslated.shortDescription || {}), [locale]: true }
        }
      }
      if (fields.includes('description')) {
        if (force || !doc.description_i18n[locale]) {
          const { text } = await translateRichText(doc.description || '', 'pt', locale, glossary)
          doc.description_i18n[locale] = sanitizeHtmlSafe(text)
          doc.meta_i18n.autoTranslated.description = { ...(doc.meta_i18n.autoTranslated.description || {}), [locale]: true }
        }
      }
      const base = doc.name_i18n[locale] || doc.name
      doc.slug_i18n[locale] = generateSlug(base)
    }

    await doc.save()
    return NextResponse.json(successResponse(doc, 'Retradução concluída'))
  } catch (e) {
    console.error('Erro ao retraduzir produto:', e)
    return errorResponse('Erro interno do servidor', 500)
  }
}

