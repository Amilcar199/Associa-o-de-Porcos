'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, Download, Share2 } from 'lucide-react'

type Unit = 'kg' | 'head'

interface SummaryResponse {
  success: boolean
  data: {
    unit: Unit
    current: { avg: number | null, count: number }
    variation: { daily: number | null, weekly: number | null, monthly: number | null }
  }
}

interface OverallResponse {
  success: boolean
  data: { avg: number | null, count: number }
}

interface RegionsResponse {
  success: boolean
  data: {
    unit: Unit
    regions: { region: string, count: number, avg: number | null, min: number | null, max: number | null }[]
  }
}

interface HistoryPoint { date: string, avg: number | null, count: number }
interface HistoryResponse { success: boolean, data: { unit: Unit, series: HistoryPoint[] } }

interface RecordsRow {
  id: string
  name: string
  date: string
  region: string
  breed: string
  unit: Unit
  value: number | null
}
interface RecordsResponse { success: boolean, data: { unit: Unit, records: RecordsRow[] } }

interface MetaResponse {
  success: boolean
  data: {
    lastUpdated: string | null
    regions: string[]
    breeds: string[]
    methodology: { pt: string, en: string }
    dataSource: string
    volumeSeriesAvailable: boolean
  }
}

function formatCurrencyAOA(value: number | null) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(value)
}

function formatNumber(value: number | null, fractionDigits = 2) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-AO', { maximumFractionDigits: fractionDigits }).format(value)
}

function formatDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toISOString().slice(0, 10)
}

function computePath(points: { x: number, y: number }[]) {
  if (!points.length) return ''
  const [first, ...rest] = points
  return 'M ' + first.x + ' ' + first.y + rest.map(p => ` L ${p.x} ${p.y}`).join('')
}

function useFetch<T>(url: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    const doFetch = async () => {
      if (!url) { setData(null); return }
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(url, { cache: 'no-store' })
        const json = await res.json()
        if (!active) return
        setData(json)
      } catch (e: any) {
        if (!active) return
        setError(String(e?.message || 'Erro'))
      } finally {
        if (!active) return
        setLoading(false)
      }
    }
    doFetch()
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { data, loading, error }
}

function toCSV(rows: any[], headers: { key: string, label: string }[]) {
  const headerLine = headers.map(h => '"' + h.label.replace(/"/g, '""') + '"').join(',')
  const body = rows.map(r => headers.map(h => {
    const v = r[h.key]
    const s = v == null ? '' : (typeof v === 'number' ? String(v) : String(v))
    return '"' + s.replace(/"/g, '""') + '"'
  }).join(',')).join('\n')
  return headerLine + '\n' + body
}

export default function BolsaClient() {
  const router = useRouter()
  const [unit] = useState<Unit>('kg')
  const [region, setRegion] = useState<string>('')
  const [periodDays, setPeriodDays] = useState<number>(180)
  const compareMode: 'region' = 'region'
  const [compareItems, setCompareItems] = useState<string[]>([])
  const [compareVersion, setCompareVersion] = useState<number>(0)
  const [bgChartMetric, setBgChartMetric] = useState<'price' | 'volume'>('price')

  const periodStartISO = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - periodDays)
    return d.toISOString()
  }, [periodDays])

  const summaryUrl = useMemo(() => {
    const p = new URLSearchParams()
    p.set('unit', unit)
    if (region) p.set('region', region)
    return `/api/market/summary?${p.toString()}`
  }, [unit, region])

  const regionsUrl = useMemo(() => {
    const p = new URLSearchParams()
    p.set('unit', unit)
    if (region) p.set('region', region)
    const end = new Date().toISOString()
    p.set('start', periodStartISO)
    p.set('end', end)
    return `/api/market/regions?${p.toString()}`
  }, [unit, region, periodStartISO])

  const historyUrl = useMemo(() => {
    const p = new URLSearchParams()
    p.set('unit', unit)
    if (region) p.set('region', region)
    const end = new Date().toISOString()
    p.set('start', periodStartISO)
    p.set('end', end)
    return `/api/market/history?${p.toString()}`
  }, [unit, region, periodStartISO])

  const recordsUrl = useMemo(() => {
    const p = new URLSearchParams()
    p.set('unit', unit)
    if (region) p.set('region', region)
    p.set('limit', '300')
    return `/api/market/records?${p.toString()}`
  }, [unit, region])

  const { data: meta } = useFetch<MetaResponse>('/api/market/meta', [])
  const { data: summary } = useFetch<SummaryResponse>(summaryUrl, [summaryUrl])
  const { data: overall } = useFetch<OverallResponse>('/api/market/overall', [])
  const { data: regionsData } = useFetch<RegionsResponse>(regionsUrl, [regionsUrl])
  const { data: historyData } = useFetch<HistoryResponse>(historyUrl, [historyUrl])
  const { data: recordsData } = useFetch<RecordsResponse>(recordsUrl, [recordsUrl])

  const historyPoints = historyData?.data?.series || []

  const chartPoints = useMemo(() => {
    const series = historyPoints.filter(p => p.avg != null)
    if (!series.length) return [] as { x: number, y: number }[]
    const width = 1000
    const height = 240
    const paddingX = 40
    const paddingY = 20
    const xs = series.map((_, i) => i)
    const ys = series.map(p => p.avg as number)
    let minY = Math.min(...ys)
    let maxY = Math.max(...ys)
    if (maxY === minY) { minY = minY - 1; maxY = maxY + 1 }
    const rangeY = Math.max(1e-6, maxY - minY)
    return series.map((p, i) => {
      const x = paddingX + (i / Math.max(1, series.length - 1)) * (width - paddingX * 2)
      const y = height - paddingY - ((p.avg! - minY) / rangeY) * (height - paddingY * 2)
      return { x, y }
    })
  }, [historyPoints])

  const downloadCSV = () => {
    const rows = (recordsData?.data?.records || []).map(r => ({
      id: r.id,
      data: formatDate(r.date),
      regiao: r.region,
      unidade: r.unit,
      valor: r.value ?? ''
    }))
    const csv = toCSV(rows, [
      { key: 'id', label: 'ID' },
      { key: 'data', label: 'Data' },
      { key: 'regiao', label: 'Região' },
      { key: 'unidade', label: 'Unidade' },
      { key: 'valor', label: 'Valor' },
    ])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bolsa-registos-${new Date().toISOString().slice(0,10)}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  const shareReport = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const title = 'Bolsa de Suínos'
    const text = 'Indicadores e preços do mercado suinícola.'
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title, text, url: shareUrl })
      } else if ((navigator as any).clipboard) {
        await (navigator as any).clipboard.writeText(shareUrl)
        alert('Link copiado para a área de transferência')
      }
    } catch {}
  }

  const regions = meta?.data?.regions || []

  return (
    <div className="relative">
      <div className="relative container-custom py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary-800">Bolsa de Suínos</h1>
            <p className="text-gray-600">Preços de referência, tendências e indicadores da cadeia suinícola.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
              <Download size={16} /> Exportar CSV
            </button>
            <button onClick={shareReport} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
              <Share2 size={16} /> Partilhar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <select value={region} onChange={e => setRegion(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="">Região (todas)</option>
              {regions.map(r => (<option key={r} value={r}>{r}</option>))}
            </select>
            <select value={periodDays} onChange={e => setPeriodDays(parseInt(e.target.value))} className="px-3 py-2 border rounded-lg">
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
              <option value={180}>6 meses</option>
              <option value={365}>12 meses</option>
            </select>
            <select value={bgChartMetric} onChange={e => setBgChartMetric(e.target.value as any)} className="px-3 py-2 border rounded-lg">
              <option value="price">Preço</option>
              <option value="volume" disabled={!meta?.data?.volumeSeriesAvailable}>Volume/Atividade</option>
            </select>
          </div>
          {(compareMode as string) !== 'none' && (
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <select value={compareItems[0] || ''} onChange={e => {
                const next = [e.target.value, compareItems[1]] as string[]
                setCompareItems(next)
              }} className="px-3 py-2 border rounded-lg">
                <option value="">Selecione o 1º</option>
                {regions.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <select value={compareItems[1] || ''} onChange={e => {
                const next = [compareItems[0], e.target.value] as string[]
                setCompareItems(next)
              }} className="px-3 py-2 border rounded-lg">
                <option value="">Selecione o 2º</option>
                {regions.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="flex items-end">
                <button
                  onClick={() => { setCompareVersion(v => v + 1); const el = document.getElementById('comparativos'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                  disabled={!compareItems[0] || !compareItems[1]}
                  className={`px-3 py-2 rounded-lg border ${(!compareItems[0] || !compareItems[1]) ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'}`}
                >
                  Gerar comparação
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500">Preço médio atual (AOA) — média geral</div>
            <div className="text-3xl font-bold mt-1">{formatCurrencyAOA(overall?.data?.avg ?? null)}</div>
            <div className="text-xs text-gray-500 mt-1">Base {overall?.data?.count || 0} registos</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500">Variação diária</div>
            <div className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-sm ${((summary?.data?.variation?.daily ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {((summary?.data?.variation?.daily ?? 0) >= 0) ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {summary?.data?.variation?.daily == null ? '—' : `${formatNumber(summary?.data?.variation?.daily, 2)}%`}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-gray-500">Variação semanal</div>
                <div className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-sm ${((summary?.data?.variation?.weekly ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {((summary?.data?.variation?.weekly ?? 0) >= 0) ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {summary?.data?.variation?.weekly == null ? '—' : `${formatNumber(summary?.data?.variation?.weekly, 2)}%`}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Variação mensal</div>
                <div className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-sm ${((summary?.data?.variation?.monthly ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {((summary?.data?.variation?.monthly ?? 0) >= 0) ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {summary?.data?.variation?.monthly == null ? '—' : `${formatNumber(summary?.data?.variation?.monthly, 2)}%`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Série histórica</h3>
              <div className="text-xs text-gray-500">{historyPoints.length} pontos</div>
            </div>
            <div className="h-64">
              <svg viewBox="0 0 1000 260" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="grad2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Axes */}
                <g>
                  <line x1="40" y1="10" x2="40" y2="240" stroke="#e5e7eb" />
                  <line x1="40" y1="240" x2="980" y2="240" stroke="#e5e7eb" />
                </g>
                {(() => {
                  if (chartPoints.length < 1) {
                    return <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 text-sm">Sem dados suficientes</text>
                  }
                  const values = historyPoints.filter(p=>p.avg!=null).map(p=>p.avg as number)
                  let minY = Math.min(...values)
                  let maxY = Math.max(...values)
                  if (values.length === 1 || maxY === minY) { minY = minY - 1; maxY = maxY + 1 }
                  const ticks = 4
                  const height = 260
                  const paddingY = 20
                  const width = 1000
                  const paddingX = 40
                  const scaleY = (v: number) => height - paddingY - ((v - minY) / Math.max(1, maxY - minY)) * (height - paddingY * 2)
                  const xForIndex = (idx: number) => paddingX + (historyPoints.length<=1?0:(idx/(historyPoints.length-1)))*(width - paddingX - 20)
                  return (
                    <>
                      {Array.from({length: ticks+1}).map((_,i)=>{
                        const v = minY + (i*(maxY-minY)/ticks)
                        const y = scaleY(v)
                        return (
                          <g key={i}>
                            <line x1="40" x2="980" y1={y} y2={y} stroke="#f3f4f6" />
                            <text x="36" y={y} textAnchor="end" dominantBaseline="middle" className="fill-gray-400 text-[10px]">{formatNumber(v,0)}</text>
                          </g>
                        )
                      })}
                      {(() => {
                        const idxs = historyPoints.length <= 1 ? [0] : [0, Math.floor(historyPoints.length/2), Math.max(0, historyPoints.length-1)]
                        return idxs.map((idx, i)=>{
                          const x = xForIndex(idx)
                          const d = historyPoints[idx]?.date || ''
                          return <text key={i} x={x} y={252} textAnchor="middle" className="fill-gray-400 text-[10px]">{d}</text>
                        })
                      })()}
                      {chartPoints.length > 1 ? (
                        <>
                          <path d={computePath(chartPoints)} stroke="#16a34a" strokeWidth="2" fill="none" />
                          <path d={`M ${chartPoints[0].x} 240 ${computePath(chartPoints).replace('M ', 'L ')} L ${chartPoints[chartPoints.length-1].x} 240 Z`} fill="url(#grad2)" />
                        </>
                      ) : (
                        <circle cx={chartPoints[0].x} cy={chartPoints[0].y} r="3.5" fill="#16a34a" />
                      )}
                    </>
                  )
                })()}
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Preços por região</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-4">Região</th>
                    <th className="py-2 pr-4">Média</th>
                    <th className="py-2 pr-4">Mín</th>
                    <th className="py-2">Máx</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(regionsData?.data?.regions || []).map(r => (
                    <tr key={r.region}>
                      <td className="py-2 pr-4 text-gray-800">{r.region}</td>
                      <td className="py-2 pr-4">{formatCurrencyAOA(r.avg)}</td>
                      <td className="py-2 pr-4">{formatCurrencyAOA(r.min)}</td>
                      <td className="py-2">{formatCurrencyAOA(r.max)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="comparativos" className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Comparativos</h3>
            <div className="text-xs text-gray-500">Até 2 séries</div>
          </div>
          <SimpleComparison unit={unit} mode={compareMode} items={compareItems} periodStartISO={periodStartISO} version={compareVersion} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <h3 className="font-semibold text-gray-800">Registos recentes</h3>
            <div className="text-xs text-gray-500">{recordsData?.data?.records?.length || 0} itens</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Região</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(recordsData?.data?.records || []).map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(r.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.region}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrencyAOA(r.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">Metodologia e fonte dos dados</h3>
          <p className="text-gray-600 text-sm">{meta?.data?.methodology?.pt}</p>
          <div className="text-xs text-gray-500 mt-2">Fonte: {meta?.data?.dataSource} • Última atualização: {meta?.data?.lastUpdated ? formatDate(meta.data.lastUpdated) : '—'}</div>
        </div>
      </div>
    </div>
  )
}

function SimpleComparison({ unit, mode, items, periodStartISO, version }: { unit: Unit, mode: 'none' | 'region' | 'category', items: string[], periodStartISO: string, version: number }) {
  const endISO = new Date().toISOString()
  const urls = useMemo(() => {
    if (mode === 'none') return [] as string[]
    const build = (value: string) => {
      const p = new URLSearchParams()
      p.set('unit', unit)
      if (mode === 'region') p.set('region', value)
      if (mode === 'category') p.set('breed', value)
      p.set('start', periodStartISO)
      p.set('end', endISO)
      p.set('v', String(version))
      return `/api/market/history?${p.toString()}`
    }
    return items.filter(Boolean).slice(0, 2).map(build)
  }, [mode, items, unit, periodStartISO, endISO, version])

  const { data: s1 } = useFetch<HistoryResponse>(urls[0] || null, [urls[0], version, periodStartISO])
  const { data: s2 } = useFetch<HistoryResponse>(urls[1] || null, [urls[1], version, periodStartISO])

  const makeScale = (series: (HistoryPoint[])[]) => {
    const values = series.flat().map(p => (p && typeof p.avg === 'number') ? p.avg : 0)
    const minY = values.length ? Math.min(...values) : 0
    const maxY = values.length ? Math.max(...values) : 1
    return { minY, maxY }
  }

  const pointsA = Array.isArray(s1?.data?.series) ? (s1?.data?.series as any[]) : []
  const pointsB = Array.isArray(s2?.data?.series) ? (s2?.data?.series as any[]) : []
  const { minY, maxY } = makeScale([pointsA, pointsB])
  const rangeY = Math.max(1, maxY - minY)

  const toPoints = (pts: HistoryPoint[], color: string) => {
    const width = 1000
    const height = 260
    const paddingX = 20
    const paddingY = 20
    const filtered = pts.filter(p => p.avg != null)
    const coords = filtered.map((p, i) => {
      const x = paddingX + (i / Math.max(1, filtered.length - 1)) * (width - paddingX * 2)
      const y = height - paddingY - (((p.avg || 0) - minY) / rangeY) * (height - paddingY * 2)
      return { x, y }
    })
    return { coords, color }
  }

  const a = toPoints(pointsA, '#15803d')
  const b = toPoints(pointsB, '#1d4ed8')

  return (
    <div className="h-72">
      <svg viewBox="0 0 1000 260" preserveAspectRatio="none" className="w-full h-full">
        {/* axes */}
        <line x1="40" y1="10" x2="40" y2="240" stroke="#e5e7eb" />
        <line x1="40" y1="240" x2="980" y2="240" stroke="#e5e7eb" />
        {/* series as dots/lines */}
        {a.coords.length === 1 && <circle cx={a.coords[0].x} cy={a.coords[0].y} r="3.5" fill="#15803d" />}
        {a.coords.length > 1 && <path d={computePath(a.coords)} stroke="#15803d" strokeWidth="2" fill="none" />}
        {b.coords.length === 1 && <circle cx={b.coords[0].x} cy={b.coords[0].y} r="3.5" fill="#1d4ed8" />}
        {b.coords.length > 1 && <path d={computePath(b.coords)} stroke="#1d4ed8" strokeWidth="2" fill="none" />}
        {a.coords.length <= 0 && b.coords.length <= 0 && (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 text-sm">Selecione e clique em “Gerar comparação”</text>
        )}
      </svg>
    </div>
  )
}

