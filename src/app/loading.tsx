'use client'

import { useLanguage } from '@/components/providers/LanguageProvider'

export default function RootLoading() {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
        <p className="mt-3 text-sm font-medium text-primary-700">{isEn ? 'Loading...' : 'Carregando...'}</p>
      </div>
    </div>
  )
}

