'use client'

import React from 'react'

type Unit = 'kg' | 'head'

interface MetaRes { success: boolean, data: { regions: string[], breeds: string[], lastUpdated: string | null } }
interface SummaryRes { success: boolean, data: { unit: Unit, current: { avg: number | null, count: number }, variation: { daily: number | null, weekly: number | null, monthly: number | null }, officialRef?: number | null, usedFallback?: boolean, effectiveDate?: string } }
interface OverallRes { success: boolean, data: { unit?: Unit, avg: number | null, count: number } }
interface RegionsRes { success: boolean, data: { unit: Unit, regions: { region: string, count: number, avg: number | null, min: number | null, max: number | null }[] } }
interface HistoryRes { success: boolean, data: { unit: Unit, series: { date: string, avg: number | null, count: number }[] } }
interface RecordsRes { success: boolean, data: { unit: Unit, records: { id: string, date: string, region: string, value: number | null, saleForm?: string | null, outOfBand?: boolean }[], anchor?: { ref: number | null, bandPct: number } } }

interface LoadingState { summary: boolean, overall: boolean, regions: boolean, history: boolean, records: boolean }
interface ErrorState { summary: string, overall: string, regions: string, history: string, records: string }

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
  const [saleForm, setSaleForm] = React.useState('carcaça' as 'carcaça' | 'vivo')
  const unit: Unit = saleForm === 'vivo' ? 'head' : 'kg'
  const [region, setRegion] = React.useState('' as string)
  const [periodDays, setPeriodDays] = React.useState(90 as number)
  const [regionsList, setRegionsList] = React.useState([] as string[])
  const [cleanOutliers, setCleanOutliers] = React.useState(false as boolean)
  const [weighted, setWeighted] = React.useState(false as boolean)
  const [bandPct, setBandPct] = React.useState(10 as number)
  const [sortKey, setSortKey] = React.useState('region' as 'region' | 'count' | 'avg' | 'min' | 'max')
  const [sortDir, setSortDir] = React.useState('asc' as 'asc' | 'desc')

  const endISO = React.useMemo(() => new Date().toISOString(), [])
  const startISO = React.useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - periodDays); return d.toISOString()
  }, [periodDays])

  const params = React.useMemo(() => {
    const p = new URLSearchParams()
    p.set('unit', unit)
    p.set('saleForm', saleForm)
    if (region) p.set('region', region)
    return p
  }, [unit, saleForm, region])

  const paramsWithRange = React.useMemo(() => {
    const p = new URLSearchParams(params)
    p.set('start', startISO); p.set('end', endISO)
    if (cleanOutliers) p.set('cleanOutliers', 'true')
    if (weighted) p.set('weighted', 'true')
    if (!Number.isNaN(bandPct)) p.set('bandPct', String(bandPct/100))
    return p
  }, [params, startISO, endISO, cleanOutliers, weighted, bandPct])

  const [summary, setSummary] = React.useState(null as SummaryRes["data"] | null)
  const [overall, setOverall] = React.useState(null as OverallRes["data"] | null)
  const [regionsData, setRegionsData] = React.useState(null as RegionsRes["data"] | null)
  const [historyData, setHistoryData] = React.useState(null as HistoryRes["data"] | null)
  const [recordsData, setRecordsData] = React.useState(null as RecordsRes["data"] | null)
  const [loading, setLoading] = React.useState({ summary: false, overall: false, regions: false, history: false, records: false } as LoadingState)
  const [error, setError] = React.useState({ summary: '', overall: '', regions: '', history: '', records: '' } as ErrorState)
  const autoSwitchedRef = React.useRef(false)
  const [chartType, setChartType] = React.useState('area' as 'area' | 'line')
  const [hoverIdx, setHoverIdx] = React.useState(null as number | null)

  React.useEffect(() => { (async () => {
    try {
      const meta: MetaRes = await (await fetch('/api/market/meta', { cache: 'no-store' })).json()
      setRegionsList(meta?.data?.regions || [])
    } catch {}
  })() }, [])

  React.useEffect(() => { (async () => {
    // Summary
    setLoading(l => ({ ...l, summary: true })); setError(e => ({ ...e, summary: '' }))
    try {
      const s: SummaryRes = await (await fetch(`/api/market/summary?${params.toString()}`, { cache: 'no-store' })).json()
      setSummary(s?.data || null)
    } catch {
      setError(e => ({ ...e, summary: 'Falha ao carregar resumo' }))
    } finally { setLoading(l => ({ ...l, summary: false })) }

    // Overall
    setLoading(l => ({ ...l, overall: true })); setError(e => ({ ...e, overall: '' }))
    try {
      const o: OverallRes = await (await fetch(`/api/market/overall?${params.toString()}`, { cache: 'no-store' })).json()
      setOverall(o?.data || null)
    } catch {
      setError(e => ({ ...e, overall: 'Falha ao carregar média geral' }))
    } finally { setLoading(l => ({ ...l, overall: false })) }

    // Regions
    setLoading(l => ({ ...l, regions: true })); setError(e => ({ ...e, regions: '' }))
    try {
      const r: RegionsRes = await (await fetch(`/api/market/regions?${paramsWithRange.toString()}`, { cache: 'no-store' })).json()
      setRegionsData(r?.data || null)
    } catch {
      setError(e => ({ ...e, regions: 'Falha ao carregar regiões' }))
    } finally { setLoading(l => ({ ...l, regions: false })) }

    // History
    setLoading(l => ({ ...l, history: true })); setError(e => ({ ...e, history: '' }))
    try {
      const h: HistoryRes = await (await fetch(`/api/market/history?${paramsWithRange.toString()}`, { cache: 'no-store' })).json()
      setHistoryData(h?.data || null)
    } catch {
      setError(e => ({ ...e, history: 'Falha ao carregar histórico' }))
    } finally { setLoading(l => ({ ...l, history: false })) }

    // Records
    setLoading(l => ({ ...l, records: true })); setError(e => ({ ...e, records: '' }))
    try {
      const recParams = new URLSearchParams(params)
      if (cleanOutliers) recParams.set('cleanOutliers', 'true')
      if (!Number.isNaN(bandPct)) recParams.set('bandPct', String(bandPct/100))
      const rec: RecordsRes = await (await fetch(`/api/market/records?${recParams.toString()}&limit=200`, { cache: 'no-store' })).json()
      setRecordsData(rec?.data || null)
    } catch {
      setError(e => ({ ...e, records: 'Falha ao carregar registos' }))
    } finally { setLoading(l => ({ ...l, records: false })) }
  })() }, [params, paramsWithRange, cleanOutliers, bandPct])

  const sortedRegions = React.useMemo(() => {
    const list = [...(regionsData?.regions || [])]
    list.sort((a, b) => {
      const va: any = (a as any)[sortKey]
      const vb: any = (b as any)[sortKey]
      const cmp = (va ?? 0) < (vb ?? 0) ? -1 : (va ?? 0) > (vb ?? 0) ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [regionsData, sortKey, sortDir])

  const chart = React.useMemo(() => {
    const series = (historyData?.series || []).filter((p: HistoryRes["data"]["series"][number]) => p.avg != null)
    if (!series.length) return { path: '', area: '', ticks: [] as { y: number, v: number }[], labels: [] as { x: number, text: string }[], pts: [] as { x:number,y:number }[], series }
    const width = 1000, height = 260, paddingX = 40, paddingY = 20
    const ys = series.map((p: any) => p.avg as number)
    let minY = Math.min(...ys), maxY = Math.max(...ys)
    if (maxY === minY) { minY -= 1; maxY += 1 }
    const rangeY = Math.max(1e-6, maxY - minY)
    const toXY = (val: number, idx: number) => {
      const x = paddingX + (idx / Math.max(1, series.length - 1)) * (width - paddingX * 2)
      const y = height - paddingY - ((val - minY) / rangeY) * (height - paddingY * 2)
      return { x, y }
    }
    const pts = series.map((p: any, i: number) => toXY(p.avg as number, i))
    const path = 'M ' + pts.map((p: any, i: number) => `${i ? 'L' : ''} ${p.x} ${p.y}`).join(' ')
    const area = `M ${pts[0].x} ${height - paddingY} ` + pts.map((p: any) => `L ${p.x} ${p.y}`).join(' ') + ` L ${pts[pts.length-1].x} ${height - paddingY} Z`
    const ticks = Array.from({ length: 5 }).map((_, i) => {
      const v = minY + (i * (maxY - minY) / 4)
      const y = height - paddingY - ((v - minY) / Math.max(1, maxY - minY)) * (height - paddingY * 2)
      return { y, v }
    })
    const labelsIdx = [0, Math.floor(series.length / 2), series.length - 1]
    const labels = labelsIdx.map((idx) => {
      const x = paddingX + (idx / Math.max(1, series.length - 1)) * (width - paddingX * 2)
      return { x, text: series[idx]?.date || '' }
    })
    return { path, area, ticks, labels, pts, series }
  }, [historyData])

  const chartPointCount = React.useMemo(() => (historyData?.series || []).filter((p: HistoryRes["data"]["series"][number]) => p.avg != null).length, [historyData])

  // Auto-switch saleForm if current selection has no usable points but the other has
  React.useEffect(() => { (async () => {
    if (loading.history) return
    if (autoSwitchedRef.current) return
    const used = (historyData?.series || []).some((p: any) => p?.avg != null)
    if (used) return
    const altForm = saleForm === 'carcaça' ? 'vivo' : 'carcaça'
    const altUnit: Unit = altForm === 'vivo' ? 'head' : 'kg'
    const altParams = new URLSearchParams()
    altParams.set('unit', altUnit)
    altParams.set('saleForm', altForm)
    if (region) altParams.set('region', region)
    altParams.set('start', startISO); altParams.set('end', endISO)
    if (cleanOutliers) altParams.set('cleanOutliers', 'true')
    if (weighted) altParams.set('weighted', 'true')
    if (!Number.isNaN(bandPct)) altParams.set('bandPct', String(bandPct/100))
    try {
      const h: HistoryRes = await (await fetch(`/api/market/history?${altParams.toString()}`, { cache: 'no-store' })).json()
      const hasAlt = (h?.data?.series || []).some((p: any) => p?.avg != null)
      if (hasAlt) {
        autoSwitchedRef.current = true
        setSaleForm(altForm as any)
      }
    } catch {}
  })() }, [historyData, loading.history, saleForm, region, startISO, endISO, cleanOutliers, weighted, bandPct])

  function downloadCSV() {
    const rows = (recordsData?.records || []).map((r: RecordsRes["data"]["records"][number]) => ({
      id: r.id,
      data: fmtDateISO(r.date),
      regiao: r.region,
      forma: r.saleForm || saleForm,
      unidade: unit,
      valor: r.value ?? '',
      fonte: 'amostral',
      fora_banda: r.outOfBand ? 'sim' : 'não'
    }))
    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'data', label: 'Data' },
      { key: 'regiao', label: 'Região' },
      { key: 'forma', label: 'Forma' },
      { key: 'unidade', label: 'Unidade' },
      { key: 'valor', label: 'Valor' },
      { key: 'fonte', label: 'Fonte' },
      { key: 'fora_banda', label: 'Fora da banda' }
    ]
    const headerLine = headers.map(h => '"' + h.label.replace(/"/g, '""') + '"').join(',')
    const body = rows.map((r: any) => headers.map((h: any) => {
      const v = (r as any)[h.key]
      const s = v == null ? '' : (typeof v === 'number' ? String(v) : String(v))
      return '"' + s.replace(/"/g, '""') + '"'
    }).join(',')).join('\n')
    const csv = headerLine + '\n' + body
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bolsa-registos-${new Date().toISOString().slice(0,10)}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  function exportSVG() {
    const meta = `Forma=${saleForm}; Região=${region||'todas'}; Período=${periodDays}d; Unidade=${unit}; Outliers=${cleanOutliers?'on':'off'}; Weighted=${weighted?'on':'off'}; Band=${bandPct}%`
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="260"><desc>${meta}</desc><rect x="0" y="0" width="1000" height="260" fill="white"/><text x="20" y="30" font-size="14" fill="#111">Série histórica (${historyData?.series?.length||0} pts)</text></svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bolsa-historico-${new Date().toISOString().slice(0,10)}.svg`
    a.click()
    setTimeout(()=>URL.revokeObjectURL(url), 2000)
  }

  async function exportPNG() {
    const meta = `Forma=${saleForm}; Região=${region||'todas'}; Período=${periodDays}d; Unidade=${unit}; Outliers=${cleanOutliers?'on':'off'}; Weighted=${weighted?'on':'off'}; Band=${bandPct}%`
    const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1000\" height=\"260\"><desc>${meta}</desc><rect x=\"0\" y=\"0\" width=\"1000\" height=\"260\" fill=\"white\"/><text x=\"20\" y=\"30\" font-size=\"14\" fill=\"#111\">Série histórica (${historyData?.series?.length||0} pts)</text></svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    await new Promise<void>((resolve, reject)=>{ img.onload=()=>resolve(); img.onerror=()=>reject(); img.src=url })
    const canvas = document.createElement('canvas')
    canvas.width = 1000; canvas.height = 260
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,1000,260)
    ctx.drawImage(img,0,0)
    const pngUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = pngUrl
    a.download = `bolsa-historico-${new Date().toISOString().slice(0,10)}.png`
    a.click()
    setTimeout(()=>URL.revokeObjectURL(url), 2000)
  }

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
              {regionsList.map((r: string) => <option key={r} value={r}>{r}</option>)}
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
          {loading.summary ? (
            <div className="mt-2 h-8 w-40 bg-gray-100 rounded animate-pulse" />
          ) : (
            <div className="text-3xl font-bold mt-1 text-primary-800">{formatAOA(summary?.current?.avg ?? null)}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">{loading.summary ? 'A carregar…' : <>Base {summary?.current?.count ?? 0} registos</>}</div>
          {!!error.summary && <div className="text-xs text-red-600 mt-1">{error.summary}</div>}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-500">Variação diária</div>
          {loading.summary ? (
            <div className="mt-2 h-6 w-20 bg-gray-100 rounded animate-pulse" />
          ) : (
            <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-sm ${((summary?.variation?.daily ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{formatPct(summary?.variation?.daily ?? null)}</div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex justify-between">
            <div>
              <div className="text-xs text-gray-500">Variação semanal</div>
              {loading.summary ? (
                <div className="mt-2 h-6 w-20 bg-gray-100 rounded animate-pulse" />
              ) : (
                <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-sm ${((summary?.variation?.weekly ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{formatPct(summary?.variation?.weekly ?? null)}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-500">Variação mensal</div>
              {loading.summary ? (
                <div className="mt-2 h-6 w-20 bg-gray-100 rounded animate-pulse" />
              ) : (
                <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-sm ${((summary?.variation?.monthly ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{formatPct(summary?.variation?.monthly ?? null)}</div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {!loading.summary && summary?.officialRef != null && (<span>Ref. oficial: {formatAOA(summary?.officialRef ?? null)}</span>)}
            {!loading.summary && summary?.usedFallback && (<span className="ml-2 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Usando melhor dia ({fmtDateISO(summary?.effectiveDate)})</span>)}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Série histórica</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{loading.history ? '…' : chartPointCount} pontos úteis</span>
            <div className="flex items-center border rounded overflow-hidden">
              <button onClick={()=>setChartType('line')} className={`px-2 py-1 ${chartType==='line'?'bg-gray-100 text-gray-800':'text-gray-500'}`}>Linha</button>
              <button onClick={()=>setChartType('area')} className={`px-2 py-1 ${chartType==='area'?'bg-gray-100 text-gray-800':'text-gray-500'}`}>Área</button>
            </div>
            <button onClick={exportSVG} className="px-2 py-1 border rounded hover:bg-gray-50">Exportar SVG</button>
            <button onClick={exportPNG} className="px-2 py-1 border rounded hover:bg-gray-50">Exportar PNG</button>
          </div>
        </div>
        {loading.history ? (
          <div className="h-64 bg-gray-50 border border-dashed border-gray-200 rounded animate-pulse" />
        ) : error.history ? (
          <div className="h-12 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error.history}</div>
        ) : chart.path ? (
          <div className="h-64">
            <svg viewBox="0 0 1000 260" preserveAspectRatio="none" className="w-full h-full"
              onMouseMove={(e)=>{
                const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
                const x = ((e.clientX - rect.left) / rect.width) * 1000
                const pts = chart.pts as {x:number,y:number}[]
                if (!pts.length) { setHoverIdx(null); return }
                let best = 0, bestDist = Math.abs(x - pts[0].x)
                for (let i=1;i<pts.length;i++){ const d = Math.abs(x - pts[i].x); if (d < bestDist){ best=i; bestDist=d } }
                setHoverIdx(best)
              }}
              onMouseLeave={()=>setHoverIdx(null)}>
              <defs>
                <linearGradient id="grad-line" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g>
                <line x1="40" y1="10" x2="40" y2="240" stroke="#e5e7eb" />
                <line x1="40" y1="240" x2="980" y2="240" stroke="#e5e7eb" />
              </g>
              {chart.ticks.map((t, i) => (
                <g key={i}>
                  <line x1="40" x2="980" y1={t.y} y2={t.y} stroke="#f3f4f6" />
                  <text x="36" y={t.y} textAnchor="end" dominantBaseline="middle" className="fill-gray-400 text-[10px]">{formatAOA(t.v)}</text>
                </g>
              ))}
              {chart.labels.map((l, i) => (
                <text key={i} x={l.x} y={252} textAnchor="middle" className="fill-gray-400 text-[10px]">{l.text}</text>
              ))}
              <path d={chart.path} stroke="#16a34a" strokeWidth="2.5" fill="none" />
              {chartType==='area' && (<path d={chart.area} fill="url(#grad-line)" />)}
              {chart.pts.map((p,i)=> (
                <circle key={i} cx={p.x} cy={p.y} r={2} fill="#16a34a" />
              ))}
              {hoverIdx != null && chart.pts[hoverIdx] && (
                <g>
                  <line x1={chart.pts[hoverIdx].x} x2={chart.pts[hoverIdx].x} y1={20} y2={240} stroke="#9ca3af" strokeDasharray="4 4" />
                  <circle cx={chart.pts[hoverIdx].x} cy={chart.pts[hoverIdx].y} r={4} fill="#16a34a" stroke="#ffffff" strokeWidth="1.5" />
                  <rect x={Math.min(880, Math.max(50, chart.pts[hoverIdx].x - 40))} y={30} width="140" height="40" rx="6" ry="6" fill="#111827" opacity="0.9" />
                  <text x={Math.min(950, Math.max(60, chart.pts[hoverIdx].x - 30))} y={48} className="fill-white text-[10px]">{(chart.series[hoverIdx] as any)?.date}</text>
                  <text x={Math.min(950, Math.max(60, chart.pts[hoverIdx].x - 30))} y={62} className="fill-white text-[12px] font-semibold">{formatAOA((chart.series[hoverIdx] as any)?.avg ?? null)}</text>
                </g>
              )}
            </svg>
          </div>
        ) : (
          <div className="h-12 text-xs text-gray-600 bg-gray-50 border border-dashed border-gray-200 rounded p-2">Sem dados</div>
        )}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Preços por região</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4"><button onClick={()=>{ setSortKey('region'); setSortDir(sortKey==='region' && sortDir==='asc'?'desc':'asc') }} className="hover:underline">Região {sortKey==='region' ? (sortDir==='asc'?'▲':'▼') : ''}</button></th>
                <th className="py-2 pr-4"><button onClick={()=>{ setSortKey('count'); setSortDir(sortKey==='count' && sortDir==='asc'?'desc':'asc') }} className="hover:underline">N {sortKey==='count' ? (sortDir==='asc'?'▲':'▼') : ''}</button></th>
                <th className="py-2 pr-4"><button onClick={()=>{ setSortKey('avg'); setSortDir(sortKey==='avg' && sortDir==='asc'?'desc':'asc') }} className="hover:underline">Média ({unit === 'kg' ? 'AOA/kg' : 'AOA/cabeça'}) {sortKey==='avg' ? (sortDir==='asc'?'▲':'▼') : ''}</button></th>
                <th className="py-2 pr-4"><button onClick={()=>{ setSortKey('min'); setSortDir(sortKey==='min' && sortDir==='asc'?'desc':'asc') }} className="hover:underline">Mín {sortKey==='min' ? (sortDir==='asc'?'▲':'▼') : ''}</button></th>
                <th className="py-2"><button onClick={()=>{ setSortKey('max'); setSortDir(sortKey==='max' && sortDir==='asc'?'desc':'asc') }} className="hover:underline">Máx {sortKey==='max' ? (sortDir==='asc'?'▲':'▼') : ''}</button></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading.regions ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-4"><div className="h-4 w-28 bg-gray-100 rounded animate-pulse" /></td>
                    <td className="py-2 pr-4"><div className="h-4 w-10 bg-gray-100 rounded animate-pulse" /></td>
                    <td className="py-2 pr-4"><div className="h-4 w-20 bg-gray-100 rounded animate-pulse" /></td>
                    <td className="py-2 pr-4"><div className="h-4 w-16 bg-gray-100 rounded animate-pulse" /></td>
                    <td className="py-2"><div className="h-4 w-16 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : error.regions ? (
                <tr><td colSpan={5} className="py-3 text-sm text-red-600">{error.regions}</td></tr>
              ) : (
                sortedRegions.map((r: RegionsRes["data"]["regions"][number]) => (
                  <tr key={r.region}>
                    <td className="py-2 pr-4 text-gray-800">{r.region}</td>
                    <td className="py-2 pr-4">{r.count}</td>
                    <td className="py-2 pr-4">{formatAOA(r.avg)}</td>
                    <td className="py-2 pr-4">{formatAOA(r.min)}</td>
                    <td className="py-2">{formatAOA(r.max)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Registos recentes</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Referência oficial: {formatAOA(recordsData?.anchor?.ref ?? null)} ±{Math.round((recordsData?.anchor?.bandPct || 0)*100)}%</span>
            <button onClick={downloadCSV} className="px-2 py-1 border rounded hover:bg-gray-50">Exportar CSV</button>
          </div>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Data</th>
              <th className="py-2 pr-4">Região</th>
              <th className="py-2 pr-4">Preço ({unit === 'kg' ? 'AOA/kg' : 'AOA/cabeça'})</th>
              <th className="py-2">Fora da tolerância</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading.records ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-2 pr-4"><div className="h-4 w-24 bg-gray-100 rounded animate-pulse" /></td>
                  <td className="py-2 pr-4"><div className="h-4 w-28 bg-gray-100 rounded animate-pulse" /></td>
                  <td className="py-2 pr-4"><div className="h-4 w-20 bg-gray-100 rounded animate-pulse" /></td>
                  <td className="py-2"><div className="h-4 w-12 bg-gray-100 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : error.records ? (
              <tr><td colSpan={4} className="py-3 text-sm text-red-600">{error.records}</td></tr>
            ) : (
              (recordsData?.records || []).map((r: RecordsRes["data"]["records"][number]) => (
                <tr key={r.id} className={r.outOfBand ? 'bg-red-50' : ''}>
                  <td className="py-2 pr-4">{fmtDateISO(r.date)}</td>
                  <td className="py-2 pr-4">{r.region}</td>
                  <td className="py-2 pr-4">{formatAOA(r.value)}</td>
                  <td className="py-2">{r.outOfBand ? <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Fora</span> : <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">Dentro</span>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={cleanOutliers} onChange={e=>setCleanOutliers(e.target.checked)} />
            Remover valores atípicos (± tolerância%)
          </label>
          <div className="text-xs text-gray-500 mt-1">Descarta preços fora da tolerância em relação à referência oficial (se existir) para a região/forma.</div>
        </div>
        <div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={weighted} onChange={e=>setWeighted(e.target.checked)} />
            Média ponderada pelo peso (kg)
          </label>
          <div className="text-xs text-gray-500 mt-1">Dá mais peso a amostras com maior peso vivo/carcaça ao calcular a média.</div>
        </div>
        <div>
          <label className="text-sm text-gray-700">
            Tolerância ±% (em torno da referência)
            <input type="number" min={1} max={50} value={bandPct} onChange={e=>setBandPct(parseInt(e.target.value||'10'))} className="ml-2 w-20 px-2 py-1 border rounded" />
          </label>
          <div className="text-xs text-gray-500 mt-1">Ex.: 10% mantém preços entre -10% e +10% da referência oficial.</div>
        </div>
      </div>
    </div>
  )
}

