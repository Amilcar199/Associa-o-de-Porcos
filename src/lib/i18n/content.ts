import type { Locale } from '@/lib/i18n/config'

export function isEnglish(locale?: string | Locale | null) {
  return String(locale || '').startsWith('en')
}

export function localizeNews<T extends Record<string, any>>(news: T, locale?: string | Locale | null): T {
  if (!isEnglish(locale) || !news?.translations?.en) return news
  const translation = news.translations.en
  return { ...news, title: translation.title || news.title, content: translation.content || news.content, excerpt: translation.excerpt || news.excerpt, tags: translation.tags?.length ? translation.tags : news.tags }
}

export function localizeProduct<T extends Record<string, any>>(product: T, locale?: string | Locale | null): T {
  if (!isEnglish(locale) || !product?.translations?.en) return product
  const translation = product.translations.en
  return { ...product, name: translation.name || product.name, description: translation.description || product.description, location: translation.location || product.location, features: translation.features?.length ? translation.features : product.features, tags: translation.tags?.length ? translation.tags : product.tags }
}
