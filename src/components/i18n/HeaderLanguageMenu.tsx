'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { getFlag, Locale } from '@/lib/i18n/config'
import { useLanguage } from '@/components/providers/LanguageProvider'

const OPTIONS: { label: string; value: Locale }[] = [
  { label: 'Português (AO)', value: 'pt-AO' },
  { label: 'Português (BR)', value: 'pt-BR' },
  { label: 'Português (PT)', value: 'pt-PT' },
  { label: 'English (US)', value: 'en-US' },
]

export default function HeaderLanguageMenu() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const current = useMemo(() => OPTIONS.find(o => o.value === locale) || OPTIONS[0], [locale])
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm shadow-sm hover:bg-gray-50"
        aria-haspopup="menu"
        aria-expanded={open}
        title={current.label}
      >
        <span className="text-lg leading-none">{getFlag(locale)}</span>
        <span className="text-xs font-semibold text-gray-700 leading-none">
          {locale === 'pt-AO' ? 'AO' : locale === 'pt-BR' ? 'BR' : locale === 'pt-PT' ? 'PT' : 'EN'}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-50">
          <ul className="py-1 text-sm">
            {OPTIONS.map(opt => (
              <li key={opt.value}>
                <button
                  className={`flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-100 ${opt.value === locale ? 'text-primary-600' : 'text-gray-700'}`}
                  onClick={() => { setLocale(opt.value); setOpen(false) }}
                >
                  <span className="text-base leading-none">{getFlag(opt.value)}</span>
                  <span>{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}