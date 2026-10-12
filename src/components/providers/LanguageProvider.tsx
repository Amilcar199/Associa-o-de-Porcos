'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { DEFAULT_LOCALE, Locale, languageToRouteSegment, normalizeLocale, parseAcceptLanguage } from '@/lib/i18n/config'
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
	const pathnameRef = useRef(pathname)
	const routerRef = useRef(router)
	pathnameRef.current = pathname
	routerRef.current = router
	const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

	useEffect(() => {
		const existing = Cookies.get(LOCALE_COOKIE_KEY)
		if (existing && (existing === 'pt-AO' || existing === 'pt-PT' || existing === 'pt-BR' || existing === 'en-US')) {
			setLocaleState(existing as Locale)
			return
		}
		Cookies.remove(LOCALE_COOKIE_KEY, { path: '/' })
		// Detect from browser
		const detected = typeof navigator !== 'undefined' ? (navigator.language || '').toLowerCase() : ''
		const resolved = normalizeLocale(parseAcceptLanguage(detected))
		Cookies.set(LOCALE_COOKIE_KEY, resolved, { expires: 365, sameSite: 'lax' })
		setLocaleState(resolved)
	}, [])

	const setLocale = useCallback((next: Locale, options?: { updateRoute?: boolean }) => {
		Cookies.set(LOCALE_COOKIE_KEY, next, { expires: 365, sameSite: 'lax', path: '/' })
		setLocaleState(next)
		const parts = (pathnameRef.current || '/').split('/').filter(Boolean)
		const first = parts[0]
		const hasLangPrefix = first === 'pt' || first === 'en'
		const rest = hasLangPrefix ? parts.slice(1).join('/') : parts.join('/')
		const segment = languageToRouteSegment(normalizeLocale(next))
		const newPath = `/${segment}${rest ? `/${rest}` : ''}`
		const currentPath = pathnameRef.current || '/'

		if (options?.updateRoute === false || newPath === currentPath) {
			routerRef.current.refresh()
			return
		}

		routerRef.current.replace(newPath)
	}, [])

	const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])
	return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
	const ctx = useContext(LanguageContext)
	if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
	return ctx
}