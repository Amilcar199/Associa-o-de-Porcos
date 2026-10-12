'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'
import { MUNICIPALITIES_BY_PROVINCE } from '@/components/sections/PigMap/province-municipalities'
import { PRODUCER_CATEGORIES, PRODUCER_HERD_MINIMUMS, PRODUCER_REGIONS, provincesForRegion } from '@/lib/producer-filters'

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
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [region, setRegion] = useState('')
  const [province, setProvince] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [minHerd, setMinHerd] = useState('')
  const [sort, setSort] = useState('recent')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const provinceOptions = useMemo(() => {
    const names = provincesForRegion(region)
    return names ? [...names].sort((a, b) => a.localeCompare(b, 'pt')) : ANGOLA_PROVINCE_NAMES
  }, [region])
  const municipalityOptions = province ? MUNICIPALITIES_BY_PROVINCE[province] || [] : []
  const activeFilterCount = [
    debouncedQuery,
    region,
    province,
    municipality,
    minHerd,
    sort !== 'recent' ? sort : '',
    categories.length ? 'categories' : '',
  ].filter(Boolean).length

  useEffect(() => {
    fetch('/api/farms/stats', { cache: 'no-store' })
      .then((response) => response.json())
      .then((json) => { if (json?.data?.totals) setTotals({ ...emptyTotals, ...json.data.totals }) })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const params = new URLSearchParams({ limit: '24', page: String(page), sort })
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (region) params.set('region', region)
    if (province) params.set('province', province)
    if (municipality) params.set('municipality', municipality)
    if (minHerd) params.set('minHerd', minHerd)
    categories.forEach((category) => params.append('category', category))
    setLoading(true)
    const controller = new AbortController()
    fetch(`/api/farms?${params}`, { cache: 'no-store', signal: controller.signal })
      .then((response) => response.json())
      .then((json) => {
        setFarms(json?.data || [])
        setPages(json?.pagination?.pages || 1)
        setTotal(json?.pagination?.total || 0)
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setFarms([])
        setTotal(0)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [debouncedQuery, region, province, municipality, categories, minHerd, sort, page])

  const clearFilters = () => {
    setQuery('')
    setDebouncedQuery('')
    setRegion('')
    setProvince('')
    setMunicipality('')
    setCategories([])
    setMinHerd('')
    setSort('recent')
    setPage(1)
    setLoading(true)
  }

  const toggleCategory = (id: string) => {
    setCategories((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    setPage(1)
  }

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

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-semibold text-gray-900">{isEn ? 'Find a producer' : 'Encontrar um produtor'}</h2>
            <p className="text-sm text-gray-500">{isEn ? 'Filter by region, place and what the farm produces.' : 'Filtre por região, local e pelo que a fazenda produz.'}</p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
            {activeFilterCount} {isEn ? 'active filters' : 'filtros ativos'}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-medium text-gray-600 sm:col-span-2">
            {isEn ? 'Search' : 'Pesquisa'}
            <input
              id="producer-search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1) }}
              placeholder={isEn ? 'Producer, farm or municipality' : 'Produtor, fazenda ou município'}
              className="input-field px-3 py-2"
            />
          </label>
          <label className="text-xs font-medium text-gray-600">
            {isEn ? 'Region' : 'Região'}
            <select
              id="producer-region"
              value={region}
              onChange={(event) => {
                const next = event.target.value
                setRegion(next)
                setProvince('')
                setMunicipality('')
                setPage(1)
              }}
              className="input-field px-3 py-2"
            >
              <option value="">{isEn ? 'All regions' : 'Todas as regiões'}</option>
              {PRODUCER_REGIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-gray-600">
            {isEn ? 'Province' : 'Província'}
            <select
              id="producer-province"
              value={province}
              onChange={(event) => {
                setProvince(event.target.value)
                setMunicipality('')
                setPage(1)
              }}
              className="input-field px-3 py-2"
            >
              <option value="">{isEn ? 'All provinces' : 'Todas as províncias'}</option>
              {provinceOptions.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-gray-600">
            {isEn ? 'Municipality' : 'Município'}
            <select
              id="producer-municipality"
              value={municipality}
              disabled={!province}
              onChange={(event) => { setMunicipality(event.target.value); setPage(1) }}
              className="input-field px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">{province ? (isEn ? 'All municipalities' : 'Todos os municípios') : (isEn ? 'Choose a province first' : 'Escolha primeiro a província')}</option>
              {municipalityOptions.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-gray-600">
            {isEn ? 'Minimum herd' : 'Efectivo mínimo'}
            <select
              id="producer-min-herd"
              value={minHerd}
              onChange={(event) => { setMinHerd(event.target.value); setPage(1) }}
              className="input-field px-3 py-2"
            >
              <option value="">{isEn ? 'Any size' : 'Qualquer efectivo'}</option>
              {PRODUCER_HERD_MINIMUMS.map((value) => (
                <option key={value} value={String(value)}>{formatCount(value)}+</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-gray-600">
            {isEn ? 'Sort' : 'Ordenar'}
            <select
              id="producer-sort"
              value={sort}
              onChange={(event) => { setSort(event.target.value); setPage(1) }}
              className="input-field px-3 py-2"
            >
              <option value="recent">{isEn ? 'Most recent' : 'Mais recentes'}</option>
              <option value="name">{isEn ? 'Name' : 'Nome'}</option>
              <option value="herd">{isEn ? 'Largest herd' : 'Maior efectivo'}</option>
              <option value="capacity">{isEn ? 'Largest capacity' : 'Maior capacidade'}</option>
            </select>
          </label>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-600">{isEn ? 'Production' : 'Categoria'}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRODUCER_CATEGORIES.map((category) => {
              const selected = categories.includes(category.id)
              return (
                <button
                  key={category.id}
                  id={`producer-category-${category.id}`}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(category.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${selected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary-200 hover:bg-white'}`}
                >
                  {isEn ? category.labelEn : category.label}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {isEn
              ? 'Selecting more than one category shows farms that produce at least one of them.'
              : 'Ao escolher mais de uma categoria, aparecem fazendas que produzem pelo menos uma delas.'}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            id="producer-clear-filters"
            type="button"
            onClick={clearFilters}
            disabled={activeFilterCount === 0 && !query}
            className={`rounded-lg border px-3 py-1.5 text-sm ${activeFilterCount > 0 || query ? 'text-gray-700 hover:bg-gray-50' : 'cursor-not-allowed bg-gray-50 text-gray-400'}`}
          >
            {isEn ? 'Clear filters' : 'Limpar filtros'}
          </button>
          <span className="ml-auto text-sm text-gray-500">
            {loading
              ? (isEn ? 'Loading producers...' : 'A carregar produtores...')
              : `${formatCount(total)} ${isEn ? (total === 1 ? 'producer' : 'producers') : (total === 1 ? 'produtor' : 'produtores')}`}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {farms.map((farm) => {
          const tags = PRODUCER_CATEGORIES.filter((category) => {
            if (category.id === 'sows') return (farm.production?.sows || 0) > 0
            if (category.id === 'boars') return (farm.production?.boars || 0) > 0
            if (category.id === 'fattening') return (farm.production?.fattening || 0) > 0
            if (category.id === 'slaughter') return (farm.herd?.forSlaughter || 0) > 0
            return (farm.herd?.forBreeding || 0) > 0
          })
          return (
          <Link key={farm._id} href={`/produtores/${farm._id}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md">
            <h2 className="font-heading text-lg font-semibold text-gray-900">{farm.producerName}</h2>
            <p className="text-sm text-gray-600">{farm.farmName || (isEn ? 'Farm' : 'Fazenda')} · {farm.province}{farm.municipality ? ` · ${farm.municipality}` : ''}</p>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag.id} className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                    {isEn ? tag.labelEn : tag.label}
                  </span>
                ))}
              </div>
            )}
            {farm.description && <p className="mt-2 text-sm leading-relaxed text-gray-700">{farm.description}</p>}
            <p className="mt-3 text-sm font-medium text-primary-700">{isEn ? 'View contact' : 'Ver contacto'}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div><dt className="text-xs text-gray-500">{isEn ? 'Total pigs' : 'Total de porcos'}</dt><dd>{formatCount(farm.herd?.total || 0)}</dd></div>
              <div><dt className="text-xs text-gray-500">{isEn ? 'Females' : 'Fêmeas'}</dt><dd>{formatCount(farm.herd?.females || 0)}</dd></div>
              <div><dt className="text-xs text-gray-500">{isEn ? 'For slaughter' : 'Para abate'}</dt><dd>{formatCount(farm.herd?.forSlaughter || 0)}</dd></div>
              <div><dt className="text-xs text-gray-500">{isEn ? 'For breeding' : 'Para reprodução'}</dt><dd>{formatCount(farm.herd?.forBreeding || 0)}</dd></div>
            </dl>
          </Link>
          )
        })}
      </div>
      {!loading && farms.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          {isEn ? 'No approved farms match these filters.' : 'Nenhuma fazenda aprovada corresponde a estes filtros.'}
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
