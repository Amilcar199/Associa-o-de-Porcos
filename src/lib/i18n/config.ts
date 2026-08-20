export type Locale = 'pt-AO' | 'pt-PT' | 'pt-BR' | 'en-US'

export const SUPPORTED_LOCALES: Locale[] = ['pt-AO', 'pt-PT', 'pt-BR', 'en-US']
export const DEFAULT_LOCALE: Locale = 'pt-AO'

export function isSupportedLocale(value: string | null | undefined): value is Locale {
	return value === 'pt-AO' || value === 'pt-PT' || value === 'pt-BR' || value === 'en-US'
}

export function normalizeLocale(value: string | null | undefined): Locale {
	if (isSupportedLocale(value)) return value
	if (value?.toLowerCase().startsWith('en')) return 'en-US'
	return DEFAULT_LOCALE
}

export function languageToRouteSegment(locale: Locale): 'pt' | 'en' {
	return locale.startsWith('pt') ? 'pt' : 'en'
}

export function routeSegmentToDefaultLocale(segment: string | null | undefined): Locale {
	if (!segment) return DEFAULT_LOCALE
	return segment === 'en' ? 'en-US' : 'pt-AO'
}

export function parseAcceptLanguage(header: string | null | undefined): Locale {
	if (!header) return DEFAULT_LOCALE
	const parts = header
		.split(',')
		.map((p) => p.trim())
		.map((p) => p.split(';')[0].toLowerCase())

	for (const code of parts) {
		if (code.startsWith('pt-ao')) return 'pt-AO'
		if (code.startsWith('pt-pt')) return 'pt-PT'
		if (code.startsWith('pt-br')) return 'pt-BR'
		if (code === 'pt') return 'pt-AO'
		if (code.startsWith('en-us')) return 'en-US'
		if (code === 'en') return 'en-US'
	}
	return DEFAULT_LOCALE
}

export function getFlag(locale: Locale): string {
	switch (locale) {
		case 'pt-AO':
			return '🇦🇴'
		case 'pt-PT':
			return '🇵🇹'
		case 'pt-BR':
			return '🇧🇷'
		case 'en-US':
			return '🇺🇸'
		default:
			return '🏳️'
	}
}