'use client'

import React from 'react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowUpDown, Download, FileSpreadsheet, Filter, LineChart as LineChartIcon, MapPin, Minus, TrendingDown, TrendingUp } from 'lucide-react'

type Unit = 'kg' | 'head'
type SaleForm = 'carcaça' | 'vivo'
type SortKey = 'region' | 'count' | 'avg' | 'min' | 'max'

type MarketData = {
  summary: { current: { avg: number | null; count: number }; variation: { daily: number | null; weekly: number | null; monthly: number | null }; officialRef?: number | null; usedFallback?: boolean; effectiveDate?: string } | null
  regions: { region: string; count: number; avg: number | null; min: number | null; max: number | null }[]
  history: { date: string; avg: number | null; count: number }[]
  records: { id: string; date: string; region: string; value: number | null; outOfBand?: boolean }[]
  anchor?: { ref: number | null; bandPct: number }
}

const emptyData: MarketData = { summary: null, regions: [], history: [], records: [] }

function formatAOA(value: number | null) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(value)
}

function pathOrChild(pathname: string, path: string) { return pathname === path || pathname.startsWith(`${path}/`) }

function Trend({ value }: { value: number | null }) {
  if (value == null || Number.isNaN(value)) return <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-sm text-gray-500"><Minus className="h-3.5 w-3.5" />—</span>
  const positive = value > 0
  const Icon = value === 0 ? Minus : positive ? TrendingUp : TrendingDown
  return <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${value === 0 ? 'bg-gray-50 text-gray-500' : positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}><Icon className="h-3.5 w-3.5" />{value.toFixed(2)}%</span>
}

export default function BolsaClient() {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')
  const { data: session } = useSession()
  const [saleForm, setSaleForm] = React.useState<SaleForm>('carcaça')
  const [region, setRegion] = React.useState('')
  const [breed, setBreed] = React.useState('')
  const [periodDays, setPeriodDays] = React.useState(90)
  const [regionsList, setRegionsList] = React.useState<string[]>([])
  const [breedsList, setBreedsList] = React.useState<string[]>([])
  const [cleanOutliers, setCleanOutliers] = React.useState(false)
  const [weighted, setWeighted] = React.useState(false)
  const [bandPct, setBandPct] = React.useState(10)
  const [granularity, setGranularity] = React.useState('day')
  const [chartType, setChartType] = React.useState<'line' | 'area'>('area')
  const [data, setData] = React.useState<MarketData>(emptyData)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'region', dir: 'asc' })
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null)
  const unit: Unit = saleForm === 'vivo' ? 'head' : 'kg'

  const query = React.useMemo(() => {
    const end = new Date()
    const start = new Date(end)
    start.setDate(start.getDate() - periodDays)
    const params = new URLSearchParams({ unit, saleForm, start: start.toISOString(), end: end.toISOString(), granularity })
    if (region) params.set('region', region)
    if (breed) params.set('breed', breed)
    if (cleanOutliers) params.set('cleanOutliers', 'true')
    if (weighted) params.set('weighted', 'true')
    params.set('bandPct', String(bandPct / 100))
    return params
  }, [unit, saleForm, region, breed, periodDays, granularity, cleanOutliers, weighted, bandPct])

  React.useEffect(() => {
    fetch('/api/market/meta', { cache: 'no-store' }).then(response => response.json()).then(result => {
      setRegionsList(result?.data?.regions || [])
      setBreedsList(result?.data?.breeds || [])
    }).catch(() => undefined)
  }, [])

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const suffix = query.toString()
        const [summary, regions, history, records] = await Promise.all([
          fetch(`/api/market/summary?${suffix}`, { cache: 'no-store' }).then(response => response.json()),
          fetch(`/api/market/regions?${suffix}`, { cache: 'no-store' }).then(response => response.json()),
          fetch(`/api/market/history?${suffix}`, { cache: 'no-store' }).then(response => response.json()),
          fetch(`/api/market/records?${suffix}&limit=200`, { cache: 'no-store' }).then(response => response.json()),
        ])
        if (!cancelled) setData({ summary: summary?.data || null, regions: regions?.data?.regions || [], history: history?.data?.series || [], records: records?.data?.records || [], anchor: records?.data?.anchor })
      } catch { if (!cancelled) setError(isEn ? 'Unable to load market data' : 'Falha ao carregar dados da bolsa') }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [query, isEn])

  const points = data.history.filter(point => point.avg != null)
  const sortedRegions = [...data.regions].sort((a, b) => {
    const left = a[sort.key] ?? 0; const right = b[sort.key] ?? 0
    const result = left < right ? -1 : left > right ? 1 : 0
    return sort.dir === 'asc' ? result : -result
  })
  const toggleSort = (key: SortKey) => setSort(current => ({ key, dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc' }))
  const chartPoints = points.map((point, index) => ({ x: 40 + index / Math.max(points.length - 1, 1) * 940, y: 230 - ((point.avg! - Math.min(...points.map(item => item.avg!))) / Math.max(Math.max(...points.map(item => item.avg!)) - Math.min(...points.map(item => item.avg!)), 1)) * 200 }))
  const chartPath = chartPoints.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
  const areaPath = chartPoints.length ? `${chartPath} L ${chartPoints.at(-1)!.x} 230 L 40 230 Z` : ''

  function downloadCSV() {
    const rows = data.records.map(record => [record.id, record.date.slice(0, 10), record.region, record.value ?? '', record.outOfBand ? 'sim' : 'não'])
    const csv = [['ID', 'Data', 'Região', 'Valor', 'Fora da banda'], ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'bolsa-registos.csv'; link.click(); URL.revokeObjectURL(url)
  }

  return <div>
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-gray-400"><Filter className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-wide">{isEn ? 'Filters' : 'Filtros'}</span></div>
      <div className="grid gap-3 md:grid-cols-4">
        <label className="text-xs font-medium text-gray-500">{isEn ? 'Sale form' : 'Forma de venda'}<select value={saleForm} onChange={event => setSaleForm(event.target.value as SaleForm)} className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"><option value="carcaça">{isEn ? 'Carcass (AOA/kg)' : 'Carcaça (AOA/kg)'}</option><option value="vivo">{isEn ? 'Live (AOA/head)' : 'Vivo (AOA/cabeça)'}</option></select></label>
        <label className="text-xs font-medium text-gray-500">{isEn ? 'Region' : 'Região'}<select value={region} onChange={event => setRegion(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5"><option value="">{isEn ? 'All' : 'Todas'}</option>{regionsList.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="text-xs font-medium text-gray-500">{isEn ? 'Period' : 'Período'}<select value={periodDays} onChange={event => setPeriodDays(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5"><option value={30}>30 dias</option><option value={90}>90 dias</option><option value={180}>180 dias</option><option value={365}>365 dias</option></select></label>
        {session ? <label className="text-xs font-medium text-gray-500">{isEn ? 'Breed' : 'Raça'}<select value={breed} onChange={event => setBreed(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5"><option value="">{isEn ? 'All' : 'Todas'}</option>{breedsList.map(item => <option key={item}>{item}</option>)}</select></label> : <div />}
      </div>
    </div>

    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white shadow-sm"><div className="text-xs font-medium text-primary-100">{isEn ? 'Current average price' : 'Preço médio atual'} ({unit === 'kg' ? 'AOA/kg' : 'AOA/cabeça'})</div><div className="mt-1 text-3xl font-bold">{loading ? '...' : formatAOA(data.summary?.current.avg ?? null)}</div><div className="mt-1 text-xs text-primary-100">{data.summary?.current.count ?? 0} {isEn ? 'records' : 'registos'}</div></div>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="text-xs font-medium text-gray-500">{isEn ? 'Daily variation' : 'Variação diária'}</div><Trend value={data.summary?.variation.daily ?? null} /></div>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex justify-between gap-4"><div><div className="text-xs font-medium text-gray-500">{isEn ? 'Weekly variation' : 'Variação semanal'}</div><Trend value={data.summary?.variation.weekly ?? null} /></div><div><div className="text-xs font-medium text-gray-500">{isEn ? 'Monthly variation' : 'Variação mensal'}</div><Trend value={data.summary?.variation.monthly ?? null} /></div></div><div className="mt-2 text-xs text-gray-500">{data.summary?.officialRef != null && `Ref. oficial: ${formatAOA(data.summary.officialRef)}`}</div></div>
    </div>

    <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><LineChartIcon className="h-4 w-4 text-primary-600" /><h2 className="font-semibold text-gray-800">{isEn ? 'Historical series' : 'Série histórica'}</h2><span className="text-xs text-gray-400">{points.length} {isEn ? 'useful points' : 'pontos úteis'}</span></div><div className="flex items-center gap-2 text-xs text-gray-500"><button onClick={() => setChartType('line')} className={`rounded-full px-3 py-1 ${chartType === 'line' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>Linha</button><button onClick={() => setChartType('area')} className={`rounded-full px-3 py-1 ${chartType === 'area' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>Área</button><select value={granularity} onChange={event => setGranularity(event.target.value)} className="rounded-lg border border-gray-200 px-2 py-1"><option value="hour">Hora</option><option value="day">Dia</option><option value="month">Mês</option><option value="year">Ano</option></select></div></div>{error ? <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p> : chartPath ? <svg viewBox="0 0 1000 260" className="h-64 w-full" onMouseMove={event => { const rect = event.currentTarget.getBoundingClientRect(); setHoverIndex(Math.min(points.length - 1, Math.max(0, Math.round(((event.clientX - rect.left) / rect.width) * (points.length - 1))))) }} onMouseLeave={() => setHoverIndex(null)}><line x1="40" y1="230" x2="980" y2="230" stroke="#e5e7eb" />{chartType === 'area' && <motion.path d={areaPath} fill="#16a34a" fillOpacity=".12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} /> }<motion.path d={chartPath} fill="none" stroke="#16a34a" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />{chartPoints.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={hoverIndex === index ? 5 : 2.5} fill="#16a34a" />)}{hoverIndex != null && <text x={chartPoints[hoverIndex].x} y="25" textAnchor="middle" className="fill-gray-700 text-[12px]">{formatAOA(points[hoverIndex].avg)}</text>}</svg> : <p className="rounded border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">{loading ? 'A carregar...' : 'Sem dados'}</p>}</section>

    <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-600" /><h2 className="font-semibold text-gray-800">{isEn ? 'Prices by region' : 'Preços por região'}</h2></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-gray-500">{(['region', 'count', 'avg', 'min', 'max'] as SortKey[]).map(key => { const labels: Record<SortKey, string> = { region: isEn ? 'Region' : 'Região', count: 'N', avg: 'Média', min: 'Mín', max: 'Máx' }; const active = sort.key === key; const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown; return <th key={key} className="py-2.5 pr-4"><button onClick={() => toggleSort(key)} className="inline-flex items-center gap-1">{labels[key]}<Icon className="h-3.5 w-3.5" /></button></th> })}</tr></thead><tbody className="divide-y divide-gray-50">{sortedRegions.map(item => <tr key={item.region} className="hover:bg-gray-50"><td className="py-2.5 pr-4 font-medium">{item.region}</td><td className="py-2.5 pr-4">{item.count}</td><td className="py-2.5 pr-4 font-semibold">{formatAOA(item.avg)}</td><td className="py-2.5 pr-4">{formatAOA(item.min)}</td><td className="py-2.5">{formatAOA(item.max)}</td></tr>)}</tbody></table></div></section>

    <section className="mt-8 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-semibold text-gray-800">{isEn ? 'Recent records' : 'Registos recentes'}</h2><button onClick={downloadCSV} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs hover:bg-gray-50"><FileSpreadsheet className="h-3.5 w-3.5" />CSV</button></div><table className="min-w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-gray-500"><th className="py-2.5 pr-4">Data</th><th className="py-2.5 pr-4">Região</th><th className="py-2.5 pr-4">Preço</th><th className="py-2.5">Estado</th></tr></thead><tbody className="divide-y divide-gray-50">{data.records.map(record => <tr key={record.id} className={record.outOfBand ? 'bg-red-50/50' : ''}><td className="py-2.5 pr-4">{record.date.slice(0, 10)}</td><td className="py-2.5 pr-4">{record.region}</td><td className="py-2.5 pr-4 font-medium">{formatAOA(record.value)}</td><td className="py-2.5">{record.outOfBand ? 'Fora' : 'Dentro'}</td></tr>)}</tbody></table></section>

    <section className="mt-6 grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cleanOutliers} onChange={event => setCleanOutliers(event.target.checked)} />{isEn ? 'Remove outliers' : 'Remover valores atípicos'}</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={weighted} onChange={event => setWeighted(event.target.checked)} />{isEn ? 'Weighted average' : 'Média ponderada'}</label><label className="text-sm font-medium">{isEn ? 'Tolerance ±%' : 'Tolerância ±%'}<input type="number" min={1} max={50} value={bandPct} onChange={event => setBandPct(Number(event.target.value) || 10)} className="ml-2 w-20 rounded-lg border border-gray-200 px-2 py-1" /></label></section>
  </div>
}
