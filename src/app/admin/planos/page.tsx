'use client'

import { useEffect, useState } from 'react'

type Account = {
  _id: string
  name: string
  email: string
  role: string
  plan?: string
  verificationStatus?: string
}

export default function AdminPlansPage() {
  const [rows, setRows] = useState<Account[]>([])
  const [error, setError] = useState('')

  async function load() {
    const response = await fetch('/api/admin/users?limit=100', { cache: 'no-store' })
    const json = await response.json()
    if (!response.ok) {
      setError(json.error || 'Não foi possível carregar as contas.')
      return
    }
    setRows(Array.isArray(json.data) ? json.data : [])
  }

  useEffect(() => { load() }, [])

  async function update(id: string, body: Record<string, string>) {
    setError('')
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const json = await response.json()
      setError(json.error || 'Não foi possível actualizar a conta.')
      return
    }
    load()
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Planos e verificação</h1>
        <p className="mt-1 text-gray-600">O plano gratuito é o de origem. O Plano Pro também pode ser pago na área do produtor. Enquanto o MULTICAIXA não está ligado, esse pagamento é simulado.</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row._id} className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-sm text-gray-500">{row.email} · {row.role} · {row.plan === 'pro' ? 'Pro' : 'Gratuito'} · {row.verificationStatus || 'none'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => update(row._id, { plan: row.plan === 'pro' ? 'free' : 'pro' })}>
                {row.plan === 'pro' ? 'Passar ao gratuito' : 'Activar Plano Pro'}
              </button>
              {row.verificationStatus !== 'verified' && (
                <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => update(row._id, { verificationStatus: 'verified' })}>
                  Verificar
                </button>
              )}
              {row.verificationStatus === 'verified' && (
                <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => update(row._id, { verificationStatus: 'none' })}>
                  Retirar verificação
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
