'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { BRAND_SHORT } from '@/lib/brand'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')

  useEffect(() => {
    // Regista o erro na consola do servidor/cliente para diagnóstico.
    // Se no futuro for adicionado um serviço de monitorização (ex.: Sentry),
    // este é o ponto certo para enviar o erro para lá também.
    console.error('Erro capturado pela boundary da aplicação:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        <h1 className="text-2xl font-heading font-semibold text-gray-900">
          {isEn ? 'Something went wrong' : 'Ocorreu um erro'}
        </h1>

        <p className="mt-3 text-gray-600">
          {isEn
            ? "We're sorry, something unexpected happened on our end. You can try again, or head back to the homepage."
            : 'Pedimos desculpa, algo correu mal do nosso lado. Pode tentar novamente ou voltar à página inicial.'}
        </p>

        {error?.digest && (
          <p className="mt-2 text-xs text-gray-400">
            {isEn ? 'Error reference' : 'Referência do erro'}: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <RefreshCw size={18} />
            {isEn ? 'Try again' : 'Tentar novamente'}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Home size={18} />
            {isEn ? 'Back to homepage' : 'Voltar ao início'}
          </Link>
        </div>

        <p className="mt-10 text-xs text-gray-400">{BRAND_SHORT}</p>
      </div>
    </div>
  )
}
