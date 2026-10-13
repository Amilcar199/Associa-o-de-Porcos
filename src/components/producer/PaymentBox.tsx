'use client'

import { useEffect, useState } from 'react'

type PaymentRow = {
  _id: string
  purpose: 'pro' | 'highlight'
  amount: number
  status: string
  provider: string
  createdAt: string
  effectUntil?: string
  product?: string
}

type Offer = { amount: number; days: number; label: string }

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  failed: 'Recusado',
  expired: 'Expirado',
}

export default function PaymentBox({
  purpose,
  productId,
  showHistory = false,
  isEn = false,
  onPaid,
}: {
  purpose: 'pro' | 'highlight'
  productId?: string
  showHistory?: boolean
  isEn?: boolean
  onPaid?: () => void
}) {
  const [offer, setOffer] = useState<Offer | null>(null)
  const [provider, setProvider] = useState('fake')
  const [rows, setRows] = useState<PaymentRow[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const response = await fetch('/api/me/payments', { cache: 'no-store' })
    const json = await response.json()
    if (!response.ok) {
      setError(json.error || (isEn ? 'Could not load payments.' : 'Não foi possível carregar os pagamentos.'))
      return
    }
    setProvider(json.data?.provider || 'fake')
    setOffer(json.data?.offers?.[purpose] || null)
    setRows(Array.isArray(json.data?.payments) ? json.data.payments : [])
  }

  useEffect(() => { load() }, [purpose, productId])

  const pending = rows.find((row) => row.status === 'pending' && row.purpose === purpose && (!productId || row.product === productId))

  async function start() {
    setError('')
    setBusy(true)
    try {
      const response = await fetch('/api/me/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, productId }),
      })
      const json = await response.json()
      if (!response.ok) {
        setError(json.error || (isEn ? 'Could not start the payment.' : 'Não foi possível iniciar o pagamento.'))
        return
      }
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function finish(id: string, outcome: 'paid' | 'failed') {
    setError('')
    setBusy(true)
    try {
      const response = await fetch(`/api/me/payments/${id}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome }),
      })
      const json = await response.json()
      if (!response.ok) {
        setError(json.error || (isEn ? 'Could not close the payment.' : 'Não foi possível fechar o pagamento.'))
        return
      }
      await load()
      if (outcome === 'paid') onPaid?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      {offer && (
        <p className="text-sm text-gray-700">
          {offer.amount.toLocaleString('pt-AO')} AOA · {offer.days} {isEn ? 'days' : 'dias'}
          {provider === 'fake' ? (isEn ? ' · simulated payment' : ' · pagamento simulado') : ''}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!pending && (
        <button type="button" className="btn-primary" disabled={busy} onClick={start}>
          {purpose === 'pro' ? (isEn ? 'Pay for Pro' : 'Pagar Plano Pro') : (isEn ? 'Pay for highlight' : 'Pagar destaque')}
        </button>
      )}
      {pending && provider === 'fake' && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm text-white disabled:opacity-60" disabled={busy} onClick={() => finish(pending._id, 'paid')}>
            {isEn ? 'Simulate accepted payment' : 'Simular pagamento aceite'}
          </button>
          <button type="button" className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-60" disabled={busy} onClick={() => finish(pending._id, 'failed')}>
            {isEn ? 'Simulate refusal' : 'Simular recusa'}
          </button>
        </div>
      )}
      {showHistory && (
        <ul className="space-y-2 text-sm text-gray-600">
          {rows.map((row) => (
            <li key={row._id}>
              {row.purpose === 'pro' ? 'Pro' : (isEn ? 'Highlight' : 'Destaque')} · {row.amount.toLocaleString('pt-AO')} AOA · {STATUS_LABEL[row.status] || row.status}
              {row.effectUntil ? ` · ${isEn ? 'until' : 'até'} ${new Date(row.effectUntil).toLocaleDateString(isEn ? 'en' : 'pt-AO')}` : ''}
            </li>
          ))}
          {rows.length === 0 && <li>{isEn ? 'No payments yet.' : 'Ainda não há pagamentos.'}</li>}
        </ul>
      )}
    </div>
  )
}
