export type TranslationProvider = 'deepl' | 'google' | 'aws' | 'none'

export type LocaleKey = 'pt' | 'en' | 'es'

export const DEFAULT_CONTENT_LOCALE: LocaleKey = 'pt'

export function getTargetLocales(): LocaleKey[] {
  const env = (process.env.TARGET_LOCALES || 'en,es').toLowerCase()
  const items = env.split(',').map((s) => s.trim()).filter(Boolean)
  const allowed: LocaleKey[] = []
  for (const it of items) {
    if (it.startsWith('en')) allowed.push('en')
    else if (it.startsWith('es')) allowed.push('es')
    else if (it.startsWith('pt')) continue // skip pt as target
  }
  // Remove dupes
  return Array.from(new Set(allowed))
}

export function getProvider(): TranslationProvider {
  const p = (process.env.TRANSLATION_PROVIDER || 'none').toLowerCase()
  if (p === 'deepl' || p === 'google' || p === 'aws') return p
  return 'none'
}

export function getProviderApiKey(): string | undefined {
  const p = getProvider()
  if (p === 'deepl') return process.env.DEEPL_API_KEY
  if (p === 'google') return process.env.GOOGLE_TRANSLATE_API_KEY
  if (p === 'aws') return process.env.AWS_TRANSLATE_ACCESS_KEY_ID // paired with secret via env/provider config
  return undefined
}

export function resolveLocaleKey(localeCookie: string | undefined | null): LocaleKey {
  const val = (localeCookie || '').toLowerCase()
  if (val.startsWith('en')) return 'en'
  if (val.startsWith('es')) return 'es'
  return 'pt'
}

