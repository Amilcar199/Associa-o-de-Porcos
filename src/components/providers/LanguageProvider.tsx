'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { DEFAULT_LOCALE, Locale, languageToRouteSegment, parseAcceptLanguage } from '@/lib/i18n/config'
import { usePathname, useRouter } from 'next/navigation'

const LOCALE_COOKIE_KEY = 'locale'

type LanguageContextValue = {
	locale: Locale
	setLocale: (next: Locale, options?: { updateRoute?: boolean }) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
	const router = useRouter()
	const pathname = usePathname()
	const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

	useEffect(() => {
		const existing = Cookies.get(LOCALE_COOKIE_KEY) as Locale | undefined
		if (existing) {
			setLocaleState(existing)
			return
		}
		// Detect from browser
		const detected = typeof navigator !== 'undefined' ? (navigator.language || '').toLowerCase() : ''
		const resolved = parseAcceptLanguage(detected)
		Cookies.set(LOCALE_COOKIE_KEY, resolved, { expires: 365, sameSite: 'lax' })
		setLocaleState(resolved)
	}, [])

	const setLocale = (next: Locale, options?: { updateRoute?: boolean }) => {
		Cookies.set(LOCALE_COOKIE_KEY, next, { expires: 365, sameSite: 'lax' })
		setLocaleState(next)
		if (options?.updateRoute !== false && pathname) {
			const parts = pathname.split('/').filter(Boolean)
			const first = parts[0]
			const hasLangPrefix = first === 'pt' || first === 'en'
			const rest = hasLangPrefix ? parts.slice(1).join('/') : parts.join('/')
			const segment = languageToRouteSegment(next)
			const newPath = `/${segment}/${rest}`.replace(/\/$/, '')
			router.push(newPath || `/${segment}`)
		}
	}

	const value = useMemo(() => ({ locale, setLocale }), [locale])
	return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
	const ctx = useContext(LanguageContext)
	if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
	return ctx
}