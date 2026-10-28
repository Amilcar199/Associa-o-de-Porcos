'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { getFlag, Locale } from '@/lib/i18n/config'
import { useLanguage } from '@/components/providers/LanguageProvider'

const OPTIONS: { label: string; value: Locale }[] = [
  { label: 'Português', value: 'pt-AO' },
  { label: 'English', value: 'en-US' },
]

export default function HeaderLanguageMenu({ tone = 'light', compact = false }: { tone?: 'light' | 'dark'; compact?: boolean }) {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const current = useMemo(() => OPTIONS.find(o => o.value === locale) || OPTIONS[0], [locale])
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const code = locale.startsWith('en') ? 'EN' : 'PT'

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={compact
          ? `inline-flex h-7 items-center gap-1 rounded-full px-1.5 ${tone === 'dark' ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
          : tone === 'dark'
            ? 'inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-white/90 hover:bg-white/10'
            : 'inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-gray-700 hover:bg-gray-100'}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={current.label}
        title={current.label}
      >
        <Globe size={compact ? 14 : 16} strokeWidth={1.75} />
        <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-medium tracking-wide`}>{code}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[400] mt-1.5 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="menuitem"
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 ${opt.value === locale ? 'font-medium text-primary-700' : 'text-gray-700'}`}
              onClick={() => {
                setLocale(opt.value)
                setOpen(false)
              }}
            >
              <span className="text-base leading-none">{getFlag(opt.value)}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
