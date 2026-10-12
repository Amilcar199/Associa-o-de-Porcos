'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getFlag, Locale } from '@/lib/i18n/config'
import { useLanguage } from '@/components/providers/LanguageProvider'

const OPTIONS: { label: string; value: Locale }[] = [
  { label: 'Português (AO)', value: 'pt-AO' },
  { label: 'English (US)', value: 'en-US' },
]

const MENU_WIDTH = 192

export default function HeaderLanguageMenu() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const current = useMemo(() => OPTIONS.find(o => o.value === locale) || OPTIONS[0], [locale])
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const place = () => {
      const button = buttonRef.current
      if (!button) return
      const rect = button.getBoundingClientRect()
      const menuHeight = OPTIONS.length * 40 + 8
      let top = rect.bottom + 8
      if (top + menuHeight > window.innerHeight - 8) {
        top = Math.max(8, rect.top - menuHeight - 8)
      }
      let left = rect.right - MENU_WIDTH
      left = Math.min(Math.max(8, left), window.innerWidth - MENU_WIDTH - 8)
      setPos({ top, left })
    }

    place()

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  const code = locale.startsWith('en') ? 'EN' : locale === 'pt-BR' ? 'BR' : locale === 'pt-PT' ? 'PT' : 'AO'

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm shadow-sm hover:bg-gray-50 cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={current.label}
        title={current.label}
      >
        <span className="text-lg leading-none" aria-hidden>{getFlag(locale)}</span>
        <span className="text-xs font-semibold text-gray-700 leading-none">{code}</span>
        <span className={`text-[10px] text-gray-500 leading-none ${open ? 'rotate-180' : ''}`} aria-hidden>▾</span>
      </button>
      {open && mounted && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: MENU_WIDTH, zIndex: 400 }}
          className="rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <ul className="py-1 text-sm">
            {OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="menuitem"
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 ${opt.value === locale ? 'text-primary-600' : 'text-gray-700'}`}
                  onClick={() => {
                    setLocale(opt.value)
                    setOpen(false)
                  }}
                >
                  <span className="text-base leading-none" aria-hidden>{getFlag(opt.value)}</span>
                  <span>{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )}
    </>
  )
}