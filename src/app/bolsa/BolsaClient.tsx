'use client'

import { useEffect, useMemo, useState } from 'react'

type Unit = 'kg' | 'head'

interface MetaRes { success: boolean, data: { regions: string[], breeds: string[], lastUpdated: string | null } }
interface SummaryRes { success: boolean, data: { unit: Unit, current: { avg: number | null, count: number }, variation: { daily: number | null, weekly: number | null, monthly: number | null }, officialRef?: number | null, usedFallback?: boolean, effectiveDate?: string } }
interface OverallRes { success: boolean, data: { unit?: Unit, avg: number | null, count: number } }
interface RegionsRes { success: boolean, data: { unit: Unit, regions: { region: string, count: number, avg: number | null, min: number | null, max: number | null }[] } }
interface HistoryRes { success: boolean, data: { unit: Unit, series: { date: string, avg: number | null, count: number }[] } }
interface RecordsRes { success: boolean, data: { unit: Unit, records: { id: string, date: string, region: string, value: number | null, saleForm?: string | null, outOfBand?: boolean }[], anchor?: { ref: number | null, bandPct: number } } }

function formatAOA(v: number | null) {
  if (v == null || Number.isNaN(v)) return '—'
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v)
}
function formatPct(v: number | null) {
  if (v == null || Number.isNaN(v)) return '—'
  return `${v.toFixed(2)}%`
}
function fmtDateISO(s?: string) { return s ? s.slice(0,10) : '—' }

export default function BolsaClient() {
  const [saleForm, setSaleForm] = useState<'carcaça' | 'vivo'>('carcaça')
  const unit: Unit = saleForm === 'vivo' ? 'head' : 'kg'
  const [region, setRegion] = useState<string>('')
  const [periodDays, setPeriodDays] = useState<number>(90)
  const [regionsList, setRegionsList] = useState<string[]>([])

  const endISO = useMemo(() => new Date().toISOString(), [])
  const startISO = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - periodDays); return d.toISOString()
  }, [periodDays])

  const params = useMemo(() => {
    const p = new URLSearchParams()
    p.set('unit', unit)
    p.set('saleForm', saleForm)
    if (region) p.set('region', region)
    return p
  }, [unit, saleForm, region])

  const paramsWithRange = useMemo(() => {
    const p = new URLSearchParams(params)
    p.set('start', startISO); p.set('end', endISO)
    return p
  }, [params, startISO, endISO])

  const [summary, setSummary] = useState<SummaryRes["data"] | null>(null)
  const [overall, setOverall] = useState<OverallRes["data"] | null>(null)
  const [regionsData, setRegionsData] = useState<RegionsRes["data"] | null>(null)
  const [historyData, setHistoryData] = useState<HistoryRes["data"] | null>(null)
  const [recordsData, setRecordsData] = useState<RecordsRes["data"] | null>(null)

  useEffect(() => { (async () => {
    try {
      const meta: MetaRes = await (await fetch('/api/market/meta', { cache: 'no-store' })).json()
      setRegionsList(meta?.data?.regions || [])
    } catch {}
  })() }, [])

  useEffect(() => { (async () => {
    try {
      const s: SummaryRes = await (await fetch(`/api/market/summary?${params.toString()}`, { cache: 'no-store' })).json()
      setSummary(s?.data || null)
    } catch {}
    try {
      const o: OverallRes = await (await fetch(`/api/market/overall?${params.toString()}`, { cache: 'no-store' })).json()
      setOverall(o?.data || null)
    } catch {}
    try {
      const r: RegionsRes = await (await fetch(`/api/market/regions?${paramsWithRange.toString()}`, { cache: 'no-store' })).json()
      setRegionsData(r?.data || null)
    } catch {}
    try {
      const h: HistoryRes = await (await fetch(`/api/market/history?${paramsWithRange.toString()}`, { cache: 'no-store' })).json()
      setHistoryData(h?.data || null)
    } catch {}
    try {
      const rec: RecordsRes = await (await fetch(`/api/market/records?${params.toString()}&limit=50`, { cache: 'no-store' })).json()
      setRecordsData(rec?.data || null)
    } catch {}
  })() }, [params, paramsWithRange])

  return (
    <div>
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-xs text-gray-500">
            Forma de venda
            <select value={saleForm} onChange={e=>setSaleForm(e.target.value as any)} className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200">
              <option value="carcaça">Carcaça (AOA/kg)</option>
              <option value="vivo">Vivo (AOA/cabeça)</option>
            </select>
          </label>
          <label className="text-xs text-gray-500">
            Região
            <select value={region} onChange={e=>setRegion(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200">
              <option value="">Todas</option>
              {regionsList.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="text-xs text-gray-500">
            Período
            <select value={periodDays} onChange={e=>setPeriodDays(parseInt(e.target.value))} className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200">
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
              <option value={180}>180 dias</option>
              <option value={365}>365 dias</option>
            </select>
          </label>
          <label className="text-xs text-gray-400">
            Raça (apenas autenticados)
            <select disabled className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-400">
              <option>—</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-500">Preço médio atual ({unit === 'kg' ? 'AOA/kg' : 'AOA/cabeça'})</div>
          <div className="text-3xl font-bold mt-1 text-primary-800">{formatAOA(summary?.current?.avg ?? null)}</div>
          <div className="text-xs text-gray-500 mt-1">Base {summary?.current?.count ?? 0} registos</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-500">Variação diária</div>
          <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-sm ${((summary?.variation?.daily ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{formatPct(summary?.variation?.daily ?? null)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex justify-between">
            <div>
              <div className="text-xs text-gray-500">Variação semanal</div>
              <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-sm ${((summary?.variation?.weekly ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{formatPct(summary?.variation?.weekly ?? null)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Variação mensal</div>
              <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-sm ${((summary?.variation?.monthly ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{formatPct(summary?.variation?.monthly ?? null)}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {summary?.officialRef != null && (<span>Ref. oficial: {formatAOA(summary?.officialRef ?? null)}</span>)}
            {summary?.usedFallback && (<span className="ml-2 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Usando melhor dia ({fmtDateISO(summary?.effectiveDate)})</span>)}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Série histórica</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{historyData?.series?.length || 0} pontos</span>
            <button className="px-2 py-1 border rounded hover:bg-gray-50">Exportar SVG</button>
            <button className="px-2 py-1 border rounded hover:bg-gray-50">Exportar PNG</button>
          </div>
        </div>
        <div className="h-12 text-xs text-gray-600 bg-gray-50 border border-dashed border-gray-200 rounded p-2">{historyData?.series?.slice(-5).map(p=>`${p.date}: ${p.avg ?? '—'}`).join(' · ') || 'Sem dados'}</div>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Preços por região</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Região</th>
                <th className="py-2 pr-4">N</th>
                <th className="py-2 pr-4">Média ({unit === 'kg' ? 'AOA/kg' : 'AOA/cabeça'})</th>
                <th className="py-2 pr-4">Mín</th>
                <th className="py-2">Máx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(regionsData?.regions || []).map(r => (
                <tr key={r.region}>
                  <td className="py-2 pr-4 text-gray-800">{r.region}</td>
                  <td className="py-2 pr-4">{r.count}</td>
                  <td className="py-2 pr-4">{formatAOA(r.avg)}</td>
                  <td className="py-2 pr-4">{formatAOA(r.min)}</td>
                  <td className="py-2">{formatAOA(r.max)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Registos recentes</h3>
          <div className="text-xs text-gray-500">Âncora: {formatAOA(recordsData?.anchor?.ref ?? null)} ±{Math.round((recordsData?.anchor?.bandPct || 0)*100)}%</div>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Data</th>
              <th className="py-2 pr-4">Região</th>
              <th className="py-2 pr-4">Preço ({unit === 'kg' ? 'AOA/kg' : 'AOA/cabeça'})</th>
              <th className="py-2">Fora da banda</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(recordsData?.records || []).map((r) => (
              <tr key={r.id} className={r.outOfBand ? 'bg-red-50' : ''}>
                <td className="py-2 pr-4">{fmtDateISO(r.date)}</td>
                <td className="py-2 pr-4">{r.region}</td>
                <td className="py-2 pr-4">{formatAOA(r.value)}</td>
                <td className="py-2">{r.outOfBand ? <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Sim</span> : <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">Não</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

