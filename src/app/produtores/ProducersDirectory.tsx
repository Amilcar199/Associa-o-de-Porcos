'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'

type FarmCard = {
  _id: string
  producerName: string
  farmName?: string
  province: string
  municipality?: string
  herd?: { total?: number; females?: number; forSlaughter?: number; forBreeding?: number }
  capacity?: number
  production?: { sows?: number; boars?: number; fattening?: number }
  description?: string
}

type Totals = {
  farmersCount: number
  totalPigs: number
  females: number
  forSlaughter: number
  forBreeding: number
  capacity: number
  sows: number
  boars: number
  fattening: number
  municipalities: number
  provincesWithFarms: number
}

const emptyTotals: Totals = {
  farmersCount: 0, totalPigs: 0, females: 0, forSlaughter: 0, forBreeding: 0,
  capacity: 0, sows: 0, boars: 0, fattening: 0, municipalities: 0, provincesWithFarms: 0,
}

function formatCount(value: number) {
  return new Intl.NumberFormat('pt-AO').format(value || 0)
}

export default function ProducersDirectory() {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')
  const [totals, setTotals] = useState<Totals>(emptyTotals)
  const [farms, setFarms] = useState<FarmCard[]>([])
  const [province, setProvince] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/farms/stats', { cache: 'no-store' })
      .then((response) => response.json())
      .then((json) => { if (json?.data?.totals) setTotals({ ...emptyTotals, ...json.data.totals }) })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams({ limit: '24', page: String(page) })
    if (province) params.set('province', province)
    setLoading(true)
    fetch(`/api/farms?${params}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((json) => {
        setFarms(json?.data || [])
        setPages(json?.pagination?.pages || 1)
      })
      .catch(() => setFarms([]))
      .finally(() => setLoading(false))
  }, [province, page])

  const visible = farms.filter((farm) => {
    const haystack = `${farm.producerName} ${farm.farmName || ''} ${farm.municipality || ''}`.toLowerCase()
    return !query || haystack.includes(query.toLowerCase())
  })

  const figures = [
    { label: isEn ? 'Approved farms' : 'Fazendas aprovadas', value: totals.farmersCount },
    { label: isEn ? 'Provinces with farms' : 'Províncias com fazendas', value: totals.provincesWithFarms },
    { label: isEn ? 'Municipalities' : 'Municípios', value: totals.municipalities },
    { label: isEn ? 'Pigs' : 'Suínos', value: totals.totalPigs },
    { label: isEn ? 'Sows' : 'Matrizes', value: totals.sows },
    { label: isEn ? 'Boars' : 'Reprodutores', value: totals.boars },
    { label: isEn ? 'Fattening' : 'Engorda', value: totals.fattening },
    { label: isEn ? 'For slaughter' : 'Para abate', value: totals.forSlaughter },
    { label: isEn ? 'Capacity' : 'Capacidade', value: totals.capacity },
  ]

  return (
    <div className="container-custom py-10">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {figures.map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatCount(item.value)}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-600">
        {isEn
          ? 'These figures come from farms approved by the association. Prices and market trends stay on the pig market page.'
          : 'Estes números vêm das fazendas aprovadas pela associação. Preços e tendências de mercado ficam na Bolsa.'}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={isEn ? 'Search producer or farm' : 'Procurar produtor ou fazenda'}
          className="input-field"
        />
        <select
          value={province}
          onChange={(event) => { setProvince(event.target.value); setPage(1) }}
          className="input-field"
        >
          <option value="">{isEn ? 'All provinces' : 'Todas as províncias'}</option>
          {ANGOLA_PROVINCE_NAMES.map((name) => <option key={name}>{name}</option>)}
        </select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {visible.map((farm) => (
          <Link key={farm._id} href={`/produtores/${farm._id}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md">
            <h2 className="font-heading text-lg font-semibold text-gray-900">{farm.producerName}</h2>
            <p className="text-sm text-gray-600">{farm.farmName || (isEn ? 'Farm' : 'Fazenda')} · {farm.province}{farm.municipality ? ` · ${farm.municipality}` : ''}</p>
            {farm.description && <p className="mt-2 text-sm leading-relaxed text-gray-700">{farm.description}</p>}
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div><dt className="text-xs text-gray-500">{isEn ? 'Pigs' : 'Suínos'}</dt><dd>{formatCount(farm.herd?.total || 0)}</dd></div>
              <div><dt className="text-xs text-gray-500">{isEn ? 'Sows' : 'Matrizes'}</dt><dd>{formatCount(farm.production?.sows || 0)}</dd></div>
              <div><dt className="text-xs text-gray-500">{isEn ? 'Boars' : 'Reprodutores'}</dt><dd>{formatCount(farm.production?.boars || 0)}</dd></div>
              <div><dt className="text-xs text-gray-500">{isEn ? 'Fattening' : 'Engorda'}</dt><dd>{formatCount(farm.production?.fattening || 0)}</dd></div>
              <div><dt className="text-xs text-gray-500">{isEn ? 'For slaughter' : 'Para abate'}</dt><dd>{formatCount(farm.herd?.forSlaughter || 0)}</dd></div>
              <div><dt className="text-xs text-gray-500">{isEn ? 'Capacity' : 'Capacidade'}</dt><dd>{farm.capacity ? formatCount(farm.capacity) : '—'}</dd></div>
            </dl>
          </Link>
        ))}
      </div>
      {!loading && visible.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          {isEn ? 'No approved farms for this search yet.' : 'Ainda não há fazendas aprovadas nesta pesquisa.'}
        </p>
      )}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>{isEn ? 'Previous' : 'Anterior'}</button>
          <span className="text-sm text-gray-600">{page} / {pages}</span>
          <button type="button" className="btn-secondary" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>{isEn ? 'Next' : 'Seguinte'}</button>
        </div>
      )}
    </div>
  )
}
