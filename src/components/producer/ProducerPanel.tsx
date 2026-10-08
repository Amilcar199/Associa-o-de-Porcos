'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ImageUpload from '@/components/admin/ui/ImageUpload'
import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'
import PigOffers from '@/components/producer/PigOffers'
import { useLanguage } from '@/components/providers/LanguageProvider'

type SectionId = 'inicio' | 'perfil' | 'fazenda' | 'animais' | 'anuncios' | 'pedidos' | 'contactos' | 'cotacoes' | 'conteudos' | 'notificacoes'

const emptyFarm = {
  producerName: '',
  farmName: '',
  province: 'Luanda',
  municipality: '',
  phone: '',
  email: '',
  capacity: '',
  description: '',
  notes: '',
  photos: [] as string[],
  herd: { total: 0, females: 0, forSlaughter: 0, forBreeding: 0 },
  production: { sows: 0, boars: 0, fattening: 0 },
}

export default function ProducerPanel() {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const router = useRouter()
  const { status } = useSession()
  const [section, setSection] = useState<SectionId>('inicio')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [overview, setOverview] = useState<any>(null)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', location: '', specialty: '', company: '', bio: '' })
  const [farmForm, setFarmForm] = useState(emptyFarm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [quote, setQuote] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const t = (pt: string, en: string) => (isEn ? en : pt)

  const load = useCallback(async () => {
    const response = await fetch('/api/me/overview', { cache: 'no-store' })
    if (response.status === 401) {
      router.push('/login')
      return
    }
    const json = await response.json()
    if (!response.ok) {
      setError(json.error || (isEn ? 'Could not open the area.' : 'Não foi possível abrir a área.'))
      setLoading(false)
      return
    }
    setOverview(json.data)
    const profile = json.data.profile
    setProfileForm({
      name: profile.name || '',
      phone: profile.phone || '',
      location: profile.location || '',
      specialty: profile.specialty || '',
      company: profile.company || '',
      bio: profile.bio || '',
    })
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

  useEffect(() => {
    if (section !== 'cotacoes') return
    fetch('/api/market/summary?unit=kg&saleForm=carcaça', { cache: 'no-store' })
      .then((response) => response.json())
      .then((json) => setQuote(json.data || null))
      .catch(() => setQuote(null))
  }, [section])

  const sections: { id: SectionId; label: string }[] = [
    { id: 'inicio', label: t('Início', 'Home') },
    { id: 'perfil', label: t('Perfil', 'Profile') },
    { id: 'fazenda', label: t('Fazenda', 'Farm') },
    { id: 'animais', label: t('Animais', 'Animals') },
    { id: 'anuncios', label: t('Anúncios', 'Listings') },
    { id: 'pedidos', label: t('Pedidos', 'Requests') },
    { id: 'contactos', label: t('Contactos', 'Contacts') },
    { id: 'cotacoes', label: t('Cotações', 'Prices') },
    { id: 'conteudos', label: t('Conteúdos', 'Content') },
    { id: 'notificacoes', label: t('Notificações', 'Notifications') },
  ]

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    })
    const json = await response.json()
    setSaving(false)
    if (!response.ok) {
      setError(json.error || t('Não foi possível guardar o perfil.', 'Could not save the profile.'))
      return
    }
    setMessage(t('Perfil actualizado.', 'Profile updated.'))
    load()
  }

  function editFarm(farm: any) {
    setEditingId(farm._id)
    setFarmForm({
      producerName: farm.producerName || '',
      farmName: farm.farmName || '',
      province: farm.province || 'Luanda',
      municipality: farm.municipality || '',
      phone: farm.phone || '',
      email: farm.email || '',
      capacity: farm.capacity ?? '',
      description: farm.description || '',
      notes: farm.notes || '',
      photos: farm.photos || [],
      herd: {
        total: farm.herd?.total ?? 0,
        females: farm.herd?.females ?? 0,
        forSlaughter: farm.herd?.forSlaughter ?? 0,
        forBreeding: farm.herd?.forBreeding ?? 0,
      },
      production: {
        sows: farm.production?.sows ?? 0,
        boars: farm.production?.boars ?? 0,
        fattening: farm.production?.fattening ?? 0,
      },
    })
    setSection('fazenda')
  }

  async function saveFarm(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const response = await fetch(editingId ? `/api/me/farms/${editingId}` : '/api/me/farms', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmForm),
    })
    const json = await response.json()
    setSaving(false)
    if (!response.ok) {
      setError(json.error || t('Não foi possível guardar a fazenda.', 'Could not save the farm.'))
      return
    }
    setMessage(json.message || t('Fazenda guardada.', 'Farm saved.'))
    setEditingId(null)
    setFarmForm(emptyFarm)
    load()
  }

  async function saveNotifications(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: overview?.profile?.preferences }),
    })
    const json = await response.json()
    setSaving(false)
    if (!response.ok) setError(json.error || t('Não foi possível guardar.', 'Could not save.'))
    else setMessage(t('Preferências guardadas.', 'Preferences saved.'))
  }

  async function requestMembership() {
    setError('')
    setMessage('')
    const response = await fetch('/api/user/membership-request', { method: 'POST' })
    const json = await response.json()
    if (!response.ok) setError(json.error || t('Não foi possível enviar o pedido.', 'Could not send the request.'))
    else {
      setMessage(t('Pedido de adesão enviado.', 'Membership request sent.'))
      load()
    }
  }

  if (loading) {
    return <section className="container-custom py-16 text-gray-600">{t('A abrir a sua área…', 'Opening your area…')}</section>
  }

  const profile = overview?.profile
  const farms = overview?.farms || []
  const animals = overview?.animals || []
  const money = new Intl.NumberFormat(isEn ? 'en' : 'pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })

  return (
    <section className="container-custom py-10">
      <div className="mb-6">
        <p className="text-sm font-medium text-primary-700">{t('Área do produtor', 'Producer area')}</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-primary-800">{profile?.name}</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          {t(
            'O seu perfil, a fazenda, os animais ligados à conta, os pedidos e as cotações da associação.',
            'Your profile, farm, animals linked to the account, requests and the association prices.'
          )}
        </p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => { setSection(item.id); setError(''); setMessage('') }}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${section === item.id ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {message && <p className="mb-4 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-800">{message}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {section === 'inicio' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            [t('Fazendas', 'Farms'), farms.length, 'fazenda'],
            [t('Animais na conta', 'Animals on the account'), animals.length, 'animais'],
            [t('Pedidos de contacto', 'Contact requests'), overview?.contacts?.length || 0, 'pedidos'],
            [t('Conteúdos de membro', 'Member content'), overview?.contentCount || 0, 'conteudos'],
          ].map(([label, value, id]) => (
            <button key={String(id)} type="button" onClick={() => setSection(id as SectionId)} className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm">
              <div className="text-sm text-gray-500">{label}</div>
              <div className="mt-1 font-heading text-3xl font-bold text-gray-900">{value}</div>
            </button>
          ))}
        </div>
      )}

      {section === 'perfil' && (
        <form onSubmit={saveProfile} className="max-w-2xl space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
          <Field label={t('Nome', 'Name')} value={profileForm.name} onChange={(value) => setProfileForm({ ...profileForm, name: value })} />
          <Field label={t('Telefone', 'Phone')} value={profileForm.phone} onChange={(value) => setProfileForm({ ...profileForm, phone: value })} />
          <Field label={t('Localização', 'Location')} value={profileForm.location} onChange={(value) => setProfileForm({ ...profileForm, location: value })} />
          <Field label={t('Especialidade', 'Specialty')} value={profileForm.specialty} onChange={(value) => setProfileForm({ ...profileForm, specialty: value })} />
          <Field label={t('Exploração ou empresa', 'Farm or company')} value={profileForm.company} onChange={(value) => setProfileForm({ ...profileForm, company: value })} />
          <label className="block text-sm text-gray-700">
            {t('Informação profissional', 'Professional information')}
            <textarea className="input-field" rows={4} value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} />
          </label>
          <p className="text-sm text-gray-500">{t('O email da conta mantém-se', 'The account email stays')} {profile?.email}.</p>
          <button className="btn-primary" disabled={saving}>{t('Guardar perfil', 'Save profile')}</button>
        </form>
      )}

      {section === 'fazenda' && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <button type="button" className="btn-secondary w-full" onClick={() => { setEditingId(null); setFarmForm({ ...emptyFarm, producerName: profile?.name || '', phone: profile?.phone || '', email: profile?.email || '' }) }}>
              {t('Nova fazenda', 'New farm')}
            </button>
            {farms.map((farm: any) => (
              <button key={farm._id} type="button" onClick={() => editFarm(farm)} className="block w-full rounded-xl border border-gray-100 bg-white p-4 text-left">
                <div className="font-medium text-gray-900">{farm.farmName || farm.producerName}</div>
                <div className="text-sm text-gray-500">{farm.province} · {farm.status}</div>
              </button>
            ))}
            {farms.length === 0 && <p className="text-sm text-gray-500">{t('Ainda não há fazendas ligadas a esta conta.', 'No farms are linked to this account yet.')}</p>}
          </div>
          <form onSubmit={saveFarm} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="font-heading text-xl font-semibold">{editingId ? t('Editar fazenda', 'Edit farm') : t('Registar fazenda', 'Register farm')}</h2>
            <p className="text-sm text-gray-500">{t('Uma fazenda nova fica pendente até a associação aprovar. Os números do mapa usam o rebanho; matrizes, reprodutores e engorda descrevem a exploração.', 'A new farm stays pending until the association approves it. Map figures use the herd; sows, boars and fattening describe the farm.')}</p>
            <Field label={t('Produtor', 'Producer')} value={farmForm.producerName} onChange={(value) => setFarmForm({ ...farmForm, producerName: value })} />
            <Field label={t('Nome da fazenda', 'Farm name')} value={farmForm.farmName} onChange={(value) => setFarmForm({ ...farmForm, farmName: value })} />
            <label className="block text-sm text-gray-700">
              {t('Província', 'Province')}
              <select className="input-field" value={farmForm.province} onChange={(event) => setFarmForm({ ...farmForm, province: event.target.value })}>
                {ANGOLA_PROVINCE_NAMES.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <Field label={t('Município', 'Municipality')} value={farmForm.municipality} onChange={(value) => setFarmForm({ ...farmForm, municipality: value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('Telefone', 'Phone')} value={farmForm.phone} onChange={(value) => setFarmForm({ ...farmForm, phone: value })} />
              <Field label="Email" value={farmForm.email} onChange={(value) => setFarmForm({ ...farmForm, email: value })} />
            </div>
            <Field label={t('Capacidade', 'Capacity')} value={String(farmForm.capacity)} onChange={(value) => setFarmForm({ ...farmForm, capacity: value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label={t('Total de animais', 'Total animals')} value={farmForm.herd.total} onChange={(value) => setFarmForm({ ...farmForm, herd: { ...farmForm.herd, total: value } })} />
              <NumberField label={t('Fêmeas no mapa', 'Females on the map')} value={farmForm.herd.females} onChange={(value) => setFarmForm({ ...farmForm, herd: { ...farmForm.herd, females: value } })} />
              <NumberField label={t('Para abate', 'For slaughter')} value={farmForm.herd.forSlaughter} onChange={(value) => setFarmForm({ ...farmForm, herd: { ...farmForm.herd, forSlaughter: value } })} />
              <NumberField label={t('Para reprodução', 'For breeding')} value={farmForm.herd.forBreeding} onChange={(value) => setFarmForm({ ...farmForm, herd: { ...farmForm.herd, forBreeding: value } })} />
              <NumberField label={t('Matrizes', 'Sows')} value={farmForm.production.sows} onChange={(value) => setFarmForm({ ...farmForm, production: { ...farmForm.production, sows: value } })} />
              <NumberField label={t('Reprodutores', 'Boars')} value={farmForm.production.boars} onChange={(value) => setFarmForm({ ...farmForm, production: { ...farmForm.production, boars: value } })} />
              <NumberField label={t('Engorda', 'Fattening')} value={farmForm.production.fattening} onChange={(value) => setFarmForm({ ...farmForm, production: { ...farmForm.production, fattening: value } })} />
            </div>
            <label className="block text-sm text-gray-700">
              {t('Descrição', 'Description')}
              <textarea className="input-field" rows={3} value={farmForm.description} onChange={(event) => setFarmForm({ ...farmForm, description: event.target.value })} />
            </label>
            <label className="block text-sm text-gray-700">
              {t('Dados produtivos', 'Production notes')}
              <textarea className="input-field" rows={3} value={farmForm.notes} onChange={(event) => setFarmForm({ ...farmForm, notes: event.target.value })} />
            </label>
            <ImageUpload category="farm" label={t('Foto da fazenda', 'Farm photo')} onImageUploaded={(url) => setFarmForm((current) => ({ ...current, photos: [...current.photos, url].slice(0, 6) }))} />
            {farmForm.photos.length > 0 && <p className="text-sm text-gray-500">{farmForm.photos.length} {t('foto(s)', 'photo(s)')}</p>}
            <button className="btn-primary" disabled={saving}>{t('Guardar fazenda', 'Save farm')}</button>
          </form>
        </div>
      )}

      {section === 'animais' && <AnimalList items={animals} empty={t('Nenhum animal está ligado a esta conta. Os anúncios públicos são publicados pela associação.', 'No animals are linked to this account. Public listings are published by the association.')} />}
      {section === 'anuncios' && <PigOffers />}

      {section === 'pedidos' && (
        <div className="space-y-4">
          {profile?.role === 'visitor' && (
            <button type="button" className="btn-primary" onClick={requestMembership}>{t('Pedir adesão de membro', 'Request membership')}</button>
          )}
          <h2 className="font-heading text-lg font-semibold">{t('Pedidos de adesão', 'Membership requests')}</h2>
          {(overview?.requests || []).map((item: any) => (
            <p key={item._id} className="text-sm text-gray-600">{new Date(item.createdAt).toLocaleString(isEn ? 'en' : 'pt-AO')}</p>
          ))}
          {(overview?.requests || []).length === 0 && <p className="text-sm text-gray-500">{t('Sem pedidos de adesão.', 'No membership requests.')}</p>}
          <h2 className="font-heading text-lg font-semibold">{t('Mensagens enviadas', 'Messages sent')}</h2>
          {(overview?.contacts || []).map((item: any) => (
            <article key={item._id} className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="font-medium">{item.subject}</h3>
              <p className="text-sm text-gray-500">{item.status}</p>
            </article>
          ))}
        </div>
      )}

      {section === 'contactos' && (
        <div className="max-w-xl space-y-3 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-700">
          <p><strong>Email:</strong> {profile?.email}</p>
          <p><strong>{t('Telefone', 'Phone')}:</strong> {profile?.phone || '—'}</p>
          <p><strong>{t('Localização', 'Location')}:</strong> {profile?.location || '—'}</p>
          <Link href="/contato" className="inline-flex font-medium text-primary-700">{t('Falar com a associação', 'Talk to the association')}</Link>
        </div>
      )}

      {section === 'cotacoes' && (
        <div className="max-w-xl rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="font-heading text-xl font-semibold">{t('Preço médio da carcaça', 'Average carcass price')}</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{quote?.current?.avg != null ? money.format(quote.current.avg) : '—'}</p>
          <p className="mt-1 text-sm text-gray-500">{t('Referência oficial', 'Official reference')}: {quote?.officialRef != null ? money.format(quote.officialRef) : '—'}</p>
          <Link href="/bolsa" className="mt-4 inline-flex text-sm font-medium text-primary-700">{t('Abrir a bolsa', 'Open the market')}</Link>
        </div>
      )}

      {section === 'conteudos' && (
        <div className="max-w-xl space-y-3">
          <p className="text-gray-600">
            {profile?.role === 'visitor'
              ? t('Os conteúdos de formação abrem depois da adesão ser aprovada.', 'Training content opens after membership is approved.')
              : t(`${overview?.contentCount || 0} conteúdos disponíveis na área de membros.`, `${overview?.contentCount || 0} items available in the members area.`)}
          </p>
          {profile?.role !== 'visitor' && <Link href="/membros" className="btn-primary inline-flex">{t('Abrir conteúdos', 'Open content')}</Link>}
        </div>
      )}

      {section === 'notificacoes' && overview?.profile && (
        <form onSubmit={saveNotifications} className="max-w-xl space-y-3 rounded-2xl border border-gray-100 bg-white p-6">
          <Toggle label={t('Email', 'Email')} checked={Boolean(overview.profile.preferences?.emailNotifications)} onChange={(checked) => setOverview({ ...overview, profile: { ...overview.profile, preferences: { ...overview.profile.preferences, emailNotifications: checked } } })} />
          <Toggle label="SMS" checked={Boolean(overview.profile.preferences?.smsNotifications)} onChange={(checked) => setOverview({ ...overview, profile: { ...overview.profile, preferences: { ...overview.profile.preferences, smsNotifications: checked } } })} />
          <Toggle label={t('Newsletter', 'Newsletter')} checked={Boolean(overview.profile.preferences?.newsletter)} onChange={(checked) => setOverview({ ...overview, profile: { ...overview.profile, preferences: { ...overview.profile.preferences, newsletter: checked } } })} />
          <button className="btn-primary" disabled={saving}>{t('Guardar', 'Save')}</button>
        </form>
      )}
    </section>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-gray-700">
      {label}
      <input className="input-field" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm text-gray-700">
      {label}
      <input className="input-field" type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm text-gray-800">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}

function AnimalList({ items, empty }: { items: any[]; empty: string }) {
  if (!items.length) return <p className="text-sm text-gray-500">{empty}</p>
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item._id} className="rounded-xl border border-gray-100 bg-white p-4">
          <h3 className="font-medium text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-600">{item.breed} · {item.age} meses · {item.weight} kg</p>
        </article>
      ))}
    </div>
  )
}
