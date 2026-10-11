'use client'

import { useState } from 'react'

export default function AdminBackupPage() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function download() {
    setError('')
    setBusy(true)
    try {
      const response = await fetch('/api/admin/backups', { cache: 'no-store' })
      if (!response.ok) {
        const json = await response.json().catch(() => ({}))
        setError(json.error || 'Não foi possível gerar a cópia.')
        return
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `assuino-copia-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Não foi possível gerar a cópia.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Cópia de segurança</h1>
        <p className="mt-1 text-gray-600">Descarrega contas, suínos, fazendas, notícias, conteúdos, bolsa e pedidos. As senhas e os tokens ficam de fora. Guarde o ficheiro fora deste servidor.</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {busy ? 'A gerar…' : 'Descarregar cópia'}
      </button>
    </div>
  )
}
