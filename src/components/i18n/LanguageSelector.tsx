'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { getFlag, Locale } from '@/lib/i18n/config'
import { useLanguage } from '@/components/providers/LanguageProvider'

const OPTIONS: { label: string; value: Locale }[] = [
	{ label: 'Português (Angola)', value: 'pt-AO' },
	{ label: 'Português (Brasil)', value: 'pt-BR' },
	{ label: 'Português (Portugal)', value: 'pt-PT' },
	{ label: 'English (US)', value: 'en-US' },
]

export default function LanguageSelector() {
	const { locale, setLocale } = useLanguage()
	const [open, setOpen] = useState(false)
	const current = useMemo(() => OPTIONS.find(o => o.value === locale) || OPTIONS[0], [locale])
	const ref = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const onPointerDown = (e: PointerEvent) => {
			if (!ref.current) return
			if (!ref.current.contains(e.target as Node)) setOpen(false)
		}

		document.addEventListener('pointerdown', onPointerDown)
		return () => document.removeEventListener('pointerdown', onPointerDown)
	}, [])

	return (
		<div className="fixed top-2 right-2 z-[120]">
			<div className="relative z-[130]" ref={ref}>
				<button
					type="button"
					onPointerDown={(e) => e.stopPropagation()}
					onClick={() => setOpen(v => !v)}
					className="flex items-center gap-2 rounded-md border border-gray-300 bg-white/90 backdrop-blur px-3 py-1.5 shadow-sm hover:bg-white"
					aria-haspopup="menu"
					aria-expanded={open}
				>
					<span className="text-lg leading-none">{getFlag(locale)}</span>
					<span className="text-sm text-gray-700">{current.label}</span>
					<span className={`text-gray-500 text-xs ${open ? 'rotate-180' : ''}`}>▾</span>
				</button>
				{open && (
					<div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-[140]">
						<ul className="py-1 text-sm">
							{OPTIONS.map(opt => (
								<li key={opt.value}>
									<button
										type="button"
										className={`flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-100 ${opt.value === locale ? 'text-primary-600' : 'text-gray-700'}`}
										onPointerDown={(e) => e.stopPropagation()}
										onClick={() => { setLocale(opt.value); setOpen(false) }}
									>
										<span className="text-lg leading-none">{getFlag(opt.value)}</span>
										<span>{opt.label}</span>
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	)
}