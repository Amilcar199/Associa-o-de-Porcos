'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'
import { PIG_BREEDS } from '@/lib/pig-listings'

type QuoteItem = {
  _id: string
  quantity: number
  saleForm: string
  breed?: string
  province: string
  phone: string
  note?: string
  status: string
  createdAt: string
}

const emptyForm = {
  quantity: '1',
  saleForm: 'vivo',
  breed: '',
  province: 'Luanda',
  phone: '',
  note: '',
}

export default function BuyerArea() {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const router = useRouter()
  const { status } = useSession()
  const [items, setItems] = useState<QuoteItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const t = (pt: string, en: string) => (isEn ? en : pt)

  const load = useCallback(async () => {
    const response = await fetch('/api/me/quote-requests', { cache: 'no-store' })
    if (response.status === 401) {
      router.push('/login')
      return
    }
    const json = await response.json()
    if (!response.ok) {
      setError(json.error || t('Não foi possível abrir a área.', 'Could not open the area.'))
      setLoading(false)
      return
    }
    setItems(Array.isArray(json.data) ? json.data : [])
    setLoading(false)
  }, [isEn, router])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    load()
  }, [status, load, router])

  async function publish(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const response = await fetch('/api/me/quote-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
    })
    const json = await response.json()
    setSaving(false)
    if (!response.ok) {
      setError(json.error || t('Não foi possível publicar o pedido.', 'Could not publish the request.'))
      return
    }
    setMessage(t('Pedido publicado. Os produtores passam a vê-lo na área deles.', 'Request published. Producers can now see it in their area.'))
    setForm(emptyForm)
    load()
  }

  if (loading) {
    return <section className="container-custom py-16 text-gray-600">{t('A abrir a área do comprador…', 'Opening the buyer area…')}</section>
  }

  return (
    <section className="container-custom py-10">
      <p className="text-sm font-medium text-primary-700">{t('Área do comprador', 'Buyer area')}</p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-primary-800">{t('Pedidos de cotação', 'Quote requests')}</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        {t(
          'Publique o que precisa: quantos suínos, vivo ou carcaça, raça e província. O pedido fica aberto para os produtores associados. A resposta deles entra na etapa seguinte.',
          'Publish what you need: how many pigs, live or carcass, breed and province. The request stays open for member producers. Their reply comes in the next stage.'
        )}
      </p>

      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          t('1. O comprador publica a procura', '1. The buyer publishes the demand'),
          t('2. O pedido aparece na área do produtor', '2. The request shows in the producer area'),
          t('3. A resposta à cotação vem a seguir', '3. The quote reply comes next'),
        ].map((step) => (
          <li key={step} className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-700">{step}</li>
        ))}
      </ol>

      {message && <p className="mt-4 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-800">{message}</p>}
      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={publish} className="mt-8 max-w-2xl space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="font-heading text-xl font-semibold">{t('Novo pedido', 'New request')}</h2>
        <label className="block text-sm text-gray-700">
          {t('Quantidade', 'Quantity')}
          <input className="input-field" inputMode="numeric" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} required />
        </label>
        <label className="block text-sm text-gray-700">
          {t('Forma', 'Form')}
          <select className="input-field" value={form.saleForm} onChange={(event) => setForm({ ...form, saleForm: event.target.value })}>
            <option value="vivo">{t('Vivo', 'Live')}</option>
            <option value="carcaça">{t('Carcaça', 'Carcass')}</option>
          </select>
        </label>
        <label className="block text-sm text-gray-700">
          {t('Raça', 'Breed')}
          <select className="input-field" value={form.breed} onChange={(event) => setForm({ ...form, breed: event.target.value })}>
            <option value="">{t('Qualquer raça', 'Any breed')}</option>
            {PIG_BREEDS.map((breed) => <option key={breed}>{breed}</option>)}
          </select>
        </label>
        <label className="block text-sm text-gray-700">
          {t('Província', 'Province')}
          <select className="input-field" value={form.province} onChange={(event) => setForm({ ...form, province: event.target.value })}>
            {ANGOLA_PROVINCE_NAMES.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label className="block text-sm text-gray-700">
          {t('Telefone', 'Phone')}
          <input className="input-field" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
        </label>
        <label className="block text-sm text-gray-700">
          {t('Nota', 'Note')}
          <textarea className="input-field" rows={3} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </label>
        <button className="btn-primary" disabled={saving}>{t('Publicar pedido', 'Publish request')}</button>
      </form>

      <div className="mt-8 space-y-3">
        <h2 className="font-heading text-xl font-semibold">{t('Os meus pedidos', 'My requests')}</h2>
        {items.length === 0 && <p className="text-sm text-gray-500">{t('Ainda não há pedidos.', 'There are no requests yet.')}</p>}
        {items.map((item) => (
          <article key={item._id} className="rounded-2xl border border-gray-100 bg-white p-4">
            <p className="font-medium text-gray-900">
              {item.quantity} · {item.saleForm} · {item.breed || t('qualquer raça', 'any breed')} · {item.province}
            </p>
            <p className="mt-1 text-sm text-gray-500">{item.phone} · {t('aberto', 'open')}</p>
            {item.note && <p className="mt-2 text-sm text-gray-600">{item.note}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}
