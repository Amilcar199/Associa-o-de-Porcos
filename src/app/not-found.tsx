'use client'

import Link from 'next/link'
import { Home, Search, Mail } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { BRAND_SHORT } from '@/lib/brand'

export default function NotFound() {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100">
          <span className="text-5xl" role="img" aria-label="pig">🐷</span>
        </div>

        <p className="text-6xl font-heading font-bold text-primary-600">404</p>

        <h1 className="mt-3 text-2xl font-heading font-semibold text-gray-900">
          {isEn ? 'This page went looking for food and got lost' : 'Esta página foi à procura de comida e perdeu-se'}
        </h1>

        <p className="mt-3 text-gray-600">
          {isEn
            ? "The page you're looking for doesn't exist or may have been moved."
            : 'A página que procura não existe ou pode ter sido movida.'}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <Home size={18} />
            {isEn ? 'Back to homepage' : 'Voltar ao início'}
          </Link>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Search size={18} />
            {isEn ? 'View products' : 'Ver produtos'}
          </Link>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Mail size={18} />
            {isEn ? 'Contact us' : 'Contactar-nos'}
          </Link>
        </div>

        <p className="mt-10 text-xs text-gray-400">{BRAND_SHORT}</p>
      </div>
    </div>
  )
}
