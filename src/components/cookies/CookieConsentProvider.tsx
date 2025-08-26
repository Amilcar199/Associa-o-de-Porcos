'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Cookies from 'js-cookie'
import { useLanguage } from '@/components/providers/LanguageProvider'
import pt from '@/lib/i18n/dictionaries/pt'
import en from '@/lib/i18n/dictionaries/en'

const CONSENT_COOKIE_KEY = 'cookie-consent'

export type ConsentState = {
	necessary: boolean
	analytics: boolean
	marketing: boolean
}

const DEFAULT_CONSENT: ConsentState = {
	necessary: true,
	analytics: false,
	marketing: false,
}

type CookieContextValue = {
	consent: ConsentState
	setConsent: (next: ConsentState) => void
	openPreferences: () => void
}

const CookieContext = createContext<CookieContextValue | undefined>(undefined)

export function useCookieConsent() {
	const ctx = useContext(CookieContext)
	if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider')
	return ctx
}

export default function CookieConsentProvider({ children }: { children: React.ReactNode }) {
	const { locale } = useLanguage()
	const dict = locale.startsWith('en') ? en : pt
	const [consent, setConsentState] = useState<ConsentState>(DEFAULT_CONSENT)
	const [showBanner, setShowBanner] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)

	useEffect(() => {
		const raw = Cookies.get(CONSENT_COOKIE_KEY)
		if (raw) {
			try {
				const parsed = JSON.parse(raw) as ConsentState
				setConsentState({ ...DEFAULT_CONSENT, ...parsed })
				setShowBanner(false)
				return
			} catch {}
		}
		setShowBanner(true)
	}, [])

	const setConsent = useCallback((next: ConsentState) => {
		Cookies.set(CONSENT_COOKIE_KEY, JSON.stringify(next), { expires: 365, sameSite: 'lax' })
		setConsentState(next)
	}, [])

	const acceptAll = () => {
		const next: ConsentState = { necessary: true, analytics: true, marketing: true }
		setConsent(next)
		setShowBanner(false)
	}
	const rejectAll = () => {
		const next: ConsentState = { necessary: true, analytics: false, marketing: false }
		setConsent(next)
		setShowBanner(false)
	}

	const openPreferences = useCallback(() => setIsModalOpen(true), [])

	const value = useMemo(() => ({ consent, setConsent, openPreferences }), [consent, setConsent, openPreferences])

	return (
		<CookieContext.Provider value={value}>
			{children}
			{showBanner && (
				<div className="fixed bottom-0 inset-x-0 z-50">
					<div className="mx-auto max-w-5xl m-4 rounded-lg border border-gray-200 bg-white shadow-xl">
						<div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div className="md:max-w-3xl">
								<p className="text-sm font-semibold text-gray-900">{dict.cookies.title}</p>
								<p className="mt-1 text-sm text-gray-600">{dict.cookies.desc}</p>
							</div>
							<div className="flex items-center gap-2">
								<button onClick={rejectAll} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">{dict.cookies.rejectAll}</button>
								<button onClick={acceptAll} className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 text-sm">{dict.cookies.acceptAll}</button>
								<button onClick={() => setIsModalOpen(true)} className="px-4 py-2 rounded-md text-sm text-primary-700 hover:bg-primary-50">{dict.cookies.openPreferences}</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/30" onClick={() => setIsModalOpen(false)} />
					<div className="relative z-10 w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-xl p-6">
						<h2 className="text-lg font-semibold text-gray-900">{dict.cookies.manageTitle}</h2>
						<div className="mt-4 space-y-4">
							<label className="flex items-start gap-3">
								<input type="checkbox" checked disabled className="mt-1" />
								<span className="text-sm text-gray-700">Necessários (sempre ativos)</span>
							</label>
							<label className="flex items-start gap-3">
								<input type="checkbox" checked={consent.analytics} onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })} className="mt-1" />
								<span className="text-sm text-gray-700">Analíticos</span>
							</label>
							<label className="flex items-start gap-3">
								<input type="checkbox" checked={consent.marketing} onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })} className="mt-1" />
								<span className="text-sm text-gray-700">Marketing</span>
							</label>
						</div>
						<div className="mt-6 flex justify-end gap-2">
							<button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">Cancelar</button>
							<button onClick={() => { Cookies.set(CONSENT_COOKIE_KEY, JSON.stringify(consent), { expires: 365, sameSite: 'lax' }); setIsModalOpen(false); setShowBanner(false) }} className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 text-sm">{dict.cookies.save}</button>
						</div>
					</div>
				</div>
			)}
		</CookieContext.Provider>
	)
}