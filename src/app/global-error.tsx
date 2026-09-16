'use client'

import { useEffect } from 'react'

// Este ficheiro só é usado no caso extremo de o próprio layout raiz
// (src/app/layout.tsx) falhar — por isso não pode depender de providers
// (LanguageProvider, etc.), do Tailwind, ou de qualquer outro componente
// da aplicação. Tem de renderizar o seu próprio <html>/<body> e usar
// apenas estilos inline, para garantir que aparece mesmo que tudo o
// resto tenha falhado.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro crítico no layout raiz:', error)
  }, [error])

  return (
    <html lang="pt">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          backgroundColor: '#f9fafb',
          color: '#111827',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div
            style={{
              margin: '0 auto 24px',
              width: 96,
              height: 96,
              borderRadius: '9999px',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
            }}
          >
            ⚠️
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 12px' }}>
            Ocorreu um erro inesperado
          </h1>

          <p style={{ color: '#4b5563', margin: '0 0 8px', lineHeight: 1.5 }}>
            Pedimos desculpa pelo transtorno. A nossa equipa foi notificada.
            Pode tentar novamente ou voltar à página inicial.
          </p>

          {error?.digest && (
            <p style={{ color: '#9ca3af', fontSize: 12, margin: '8px 0' }}>
              Referência do erro: {error.digest}
            </p>
          )}

          <div
            style={{
              marginTop: 24,
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => reset()}
              style={{
                cursor: 'pointer',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                color: '#ffffff',
                backgroundColor: '#16a34a',
              }}
            >
              Tentar novamente
            </button>
            <a
              href="/"
              style={{
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                color: '#374151',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                textDecoration: 'none',
              }}
            >
              Voltar ao início
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
