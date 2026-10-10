'use client'

import { useEffect, useState } from 'react'

type Row = {
  _id: string
  quantity: number
  saleForm: string
  breed?: string
  province: string
  phone: string
  note?: string
  status: string
  createdAt: string
  buyer?: { name?: string; email?: string }
}

export default function AdminQuoteRequestsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/quote-requests', { cache: 'no-store' })
      .then((response) => response.json())
      .then((json) => setRows(Array.isArray(json.data) ? json.data : []))
      .catch(() => setError('Não foi possível carregar os pedidos.'))
  }, [])

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos de cotação</h1>
        <p className="mt-1 text-gray-600">Procura publicada pelos compradores. As respostas dos produtores entram na etapa seguinte.</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {rows.length === 0 && !error && <p className="text-sm text-gray-500">Ainda não há pedidos.</p>}
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row._id} className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="font-medium text-gray-900">{row.quantity} · {row.saleForm} · {row.breed || 'qualquer raça'} · {row.province}</p>
            <p className="mt-1 text-sm text-gray-500">{row.buyer?.name || 'Comprador'} · {row.phone} · {row.status}</p>
            {row.note && <p className="mt-2 text-sm text-gray-600">{row.note}</p>}
          </article>
        ))}
      </div>
    </div>
  )
}
