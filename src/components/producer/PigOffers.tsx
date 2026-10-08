'use client'

import { FormEvent, useEffect, useState } from 'react'
import ImageUpload from '@/components/admin/ui/ImageUpload'
import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'
import { PIG_BREEDS } from '@/lib/pig-listings'
import { useLanguage } from '@/components/providers/LanguageProvider'

const emptyOffer = {
  name: '',
  breed: 'Landrace',
  age: 6,
  weight: 80,
  quantity: 1,
  saleForm: 'vivo',
  price: '',
  pricePerKg: '',
  location: 'Luanda',
  healthStatus: 'good',
  vaccinated: false,
  description: '',
  contactPhone: '',
  whatsapp: '',
  images: [] as string[],
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Recusado',
  sold: 'Vendido',
  expired: 'Expirado',
}

export default function PigOffers() {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const [offers, setOffers] = useState<any[]>([])
  const [form, setForm] = useState(emptyOffer)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const response = await fetch('/api/products?mine=1', { cache: 'no-store' })
    if (!response.ok) return
    const json = await response.json()
    setOffers(json.data || [])
  }

  useEffect(() => { load() }, [])

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const response = await fetch(editingId ? `/api/me/offers/${editingId}` : '/api/me/offers', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await response.json()
    setSaving(false)
    if (!response.ok) {
      setError(json.error || (isEn ? 'Could not save the listing.' : 'Não foi possível guardar o anúncio.'))
      return
    }
    setMessage(json.message || (isEn ? 'Listing sent for approval.' : 'Anúncio enviado para aprovação.'))
    setEditingId(null)
    setForm(emptyOffer)
    load()
  }

  async function markSold(id: string) {
    const response = await fetch(`/api/me/offers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingStatus: 'sold' }),
    })
    if (response.ok) load()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-3">
        <p className="text-sm text-gray-600">{isEn ? 'Listings are pigs only: live or carcass.' : 'Os anúncios são só de suínos: vivos ou em carcaça.'}</p>
        {offers.map((offer) => (
          <article key={offer._id} className="rounded-xl border border-gray-100 bg-white p-4">
            <h3 className="font-medium text-gray-900">{offer.name}</h3>
            <p className="text-sm text-gray-500">{offer.breed} · {offer.quantity || 1} · {isEn ? offer.listingStatus : (STATUS_LABEL[offer.listingStatus] || 'No catálogo')}</p>
            <div className="mt-2 flex gap-2">
              <button type="button" className="text-sm font-medium text-primary-700" onClick={() => { setEditingId(offer._id); setForm({ ...emptyOffer, ...offer, price: offer.price ?? '', pricePerKg: offer.pricePerKg ?? '', images: offer.images || [] }) }}>{isEn ? 'Edit' : 'Editar'}</button>
              {offer.listingStatus !== 'sold' && <button type="button" className="text-sm text-gray-600" onClick={() => markSold(offer._id)}>{isEn ? 'Mark sold' : 'Marcar vendido'}</button>}
            </div>
          </article>
        ))}
        {offers.length === 0 && <p className="text-sm text-gray-500">{isEn ? 'You have no pig listings yet.' : 'Ainda não tem anúncios de suínos.'}</p>}
      </div>
      <form onSubmit={save} className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="font-heading text-xl font-semibold">{editingId ? (isEn ? 'Edit listing' : 'Editar anúncio') : (isEn ? 'Publish pigs' : 'Publicar suínos')}</h2>
        {message && <p className="text-sm text-primary-800">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <input className="input-field" placeholder={isEn ? 'Listing name' : 'Nome do anúncio'} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <select className="input-field" value={form.breed} onChange={(event) => setForm({ ...form, breed: event.target.value })}>
          {PIG_BREEDS.map((breed) => <option key={breed}>{breed}</option>)}
        </select>
        <div className="grid gap-3 sm:grid-cols-3">
          <input className="input-field" type="number" min={0} placeholder={isEn ? 'Age (months)' : 'Idade (meses)'} value={form.age} onChange={(event) => setForm({ ...form, age: Number(event.target.value) })} />
          <input className="input-field" type="number" min={1} placeholder={isEn ? 'Weight (kg)' : 'Peso (kg)'} value={form.weight} onChange={(event) => setForm({ ...form, weight: Number(event.target.value) })} />
          <input className="input-field" type="number" min={1} placeholder={isEn ? 'Quantity' : 'Quantidade'} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} />
        </div>
        <select className="input-field" value={form.saleForm} onChange={(event) => setForm({ ...form, saleForm: event.target.value })}>
          <option value="vivo">{isEn ? 'Live' : 'Vivo'}</option>
          <option value="carcaça">{isEn ? 'Carcass' : 'Carcaça'}</option>
        </select>
        <select className="input-field" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })}>
          {ANGOLA_PROVINCE_NAMES.map((name) => <option key={name}>{name}</option>)}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input-field" type="number" min={0} placeholder={isEn ? 'Price per head' : 'Preço por cabeça'} value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          <input className="input-field" type="number" min={0} placeholder={isEn ? 'Price per kg' : 'Preço por kg'} value={form.pricePerKg} onChange={(event) => setForm({ ...form, pricePerKg: event.target.value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input-field" placeholder={isEn ? 'Phone' : 'Telefone'} value={form.contactPhone} onChange={(event) => setForm({ ...form, contactPhone: event.target.value })} />
          <input className="input-field" placeholder="WhatsApp" value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.vaccinated} onChange={(event) => setForm({ ...form, vaccinated: event.target.checked })} />
          {isEn ? 'Vaccinated' : 'Vacinado'}
        </label>
        <textarea className="input-field" rows={3} placeholder={isEn ? 'Describe the pigs' : 'Descreva os suínos'} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <ImageUpload label={isEn ? 'Photo' : 'Foto'} onImageUploaded={(url) => setForm((current) => ({ ...current, images: [...current.images, url].slice(0, 6) }))} />
        <p className="text-sm text-gray-500">{form.images.length} {isEn ? 'photo(s)' : 'foto(s)'}</p>
        <button className="btn-primary" disabled={saving}>{isEn ? 'Submit for approval' : 'Enviar para aprovação'}</button>
      </form>
    </div>
  )
}
