'use client'

import { useEffect, useState } from 'react'

type Row = {
  _id: string
  action: string
  entity: string
  entityId?: string
  summary?: string
  createdAt: string
  actor?: { name?: string; email?: string } | null
  changes?: Record<string, { from?: unknown; to?: unknown }>
}

const ACTION_LABEL: Record<string, string> = {
  'product.create': 'Suíno criado',
  'product.update': 'Suíno alterado',
  'product.delete': 'Suíno removido',
  'listing.update': 'Estado do anúncio',
  'offer.create': 'Anúncio enviado',
  'offer.update': 'Anúncio alterado',
  'offer.highlight': 'Destaque',
  'offer.sold': 'Marcado como vendido',
  'account.update': 'Conta alterada',
  'backup.export': 'Cópia de segurança',
}

export default function AdminAuditPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/audit-logs?limit=40', { cache: 'no-store' })
      .then(async (response) => {
        const json = await response.json()
        if (!response.ok) {
          setError(json.error || 'Não foi possível carregar os registos.')
          return
        }
        setRows(Array.isArray(json.data?.rows) ? json.data.rows : [])
      })
      .catch(() => setError('Não foi possível carregar os registos.'))
  }, [])

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Registos</h1>
        <p className="mt-1 text-gray-600">Quem criou, alterou ou removeu suínos, anúncios, planos e cópias de segurança.</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {rows.length === 0 && !error && <p className="text-sm text-gray-500">Ainda não há registos.</p>}
      <div className="space-y-3">
        {rows.map((row) => {
          const changes = row.changes ? Object.entries(row.changes) : []
          return (
            <article key={row._id} className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="font-medium text-gray-900">{ACTION_LABEL[row.action] || row.action}</p>
              <p className="text-sm text-gray-500">
                {row.actor?.name || 'Sistema'}
                {row.summary ? ` · ${row.summary}` : ''}
                {' · '}
                {new Date(row.createdAt).toLocaleString('pt-AO')}
              </p>
              {changes.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {changes.map(([field, change]) => (
                    <li key={field}>{field}: {String(change?.from ?? '—')} → {String(change?.to ?? '—')}</li>
                  ))}
                </ul>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
