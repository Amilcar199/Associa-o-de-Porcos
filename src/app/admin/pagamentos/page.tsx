'use client'

import { useEffect, useState } from 'react'

type Row = {
  _id: string
  purpose: string
  amount: number
  status: string
  provider: string
  createdAt: string
  effectUntil?: string
  user?: { name?: string; email?: string }
  product?: { name?: string }
}

const STATUS: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  failed: 'Recusado',
  expired: 'Expirado',
}

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/payments', { cache: 'no-store' })
      .then(async (response) => {
        const json = await response.json()
        if (!response.ok) {
          setError(json.error || 'Não foi possível carregar os pagamentos.')
          return
        }
        setRows(Array.isArray(json.data) ? json.data : [])
      })
      .catch(() => setError('Não foi possível carregar os pagamentos.'))
  }, [])

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
        <p className="mt-1 text-gray-600">Histórico do Plano Pro e dos destaques. O gateway actual é simulado; o MULTICAIXA substitui só a cobrança.</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {rows.length === 0 && !error && <p className="text-sm text-gray-500">Ainda não há pagamentos.</p>}
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row._id} className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="font-medium text-gray-900">{row.purpose === 'pro' ? 'Plano Pro' : 'Destaque'} · {row.amount.toLocaleString('pt-AO')} AOA · {STATUS[row.status] || row.status}</p>
            <p className="text-sm text-gray-500">
              {row.user?.name || 'Conta'} · {row.provider}
              {row.product?.name ? ` · ${row.product.name}` : ''}
              {' · '}
              {new Date(row.createdAt).toLocaleString('pt-AO')}
              {row.effectUntil ? ` · até ${new Date(row.effectUntil).toLocaleDateString('pt-AO')}` : ''}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
