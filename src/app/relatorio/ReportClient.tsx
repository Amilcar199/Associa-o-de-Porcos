'use client'

import React from 'react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { FileSpreadsheet, FileDown, Filter, MapPin, Minus, TrendingDown, TrendingUp } from 'lucide-react'

type Unit = 'kg' | 'head'
type SaleForm = 'carcaça' | 'vivo'

type RegionRow = { region: string; count: number; avg: number | null; min: number | null; max: number | null }

type Summary = {
  current: { avg: number | null; min?: number | null; max?: number | null; count: number }
  variation: { daily: number | null; weekly: number | null; monthly: number | null }
  officialRef?: number | null
  effectiveDate?: string
} | null

function formatAOA(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(value)
}

function Trend({ value, label }: { value: number | null; label: string }) {
  const Icon = value == null || Number.isNaN(value) ? Minus : value === 0 ? Minus : value > 0 ? TrendingUp : TrendingDown
  const tone =
    value == null || Number.isNaN(value) || value === 0
      ? 'bg-gray-50 text-gray-500'
      : value > 0
        ? 'bg-green-50 text-green-700'
        : 'bg-red-50 text-red-700'
  return (
    <div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
        {value == null || Number.isNaN(value) ? '—' : `${value.toFixed(2)}%`}
      </span>
    </div>
  )
}

export default function ReportClient() {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')

  const [saleForm, setSaleForm] = React.useState<SaleForm>('carcaça')
  const [periodDays, setPeriodDays] = React.useState(30)
  const [summary, setSummary] = React.useState<Summary>(null)
  const [regions, setRegions] = React.useState<RegionRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [exporting, setExporting] = React.useState(false)

  const unit: Unit = saleForm === 'vivo' ? 'head' : 'kg'
  const unitLabel = unit === 'kg' ? 'AOA/kg' : isEn ? 'AOA/head' : 'AOA/cabeça'
  const exportRef = React.useRef<HTMLDivElement | null>(null)

  const query = React.useMemo(() => {
    const end = new Date()
    const start = new Date(end)
    start.setDate(start.getDate() - periodDays)
    return new URLSearchParams({
      unit,
      saleForm,
      start: start.toISOString(),
      end: end.toISOString(),
      granularity: 'day',
    }).toString()
  }, [unit, saleForm, periodDays])

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [summaryRes, regionsRes] = await Promise.all([
          fetch(`/api/market/summary?${query}`, { cache: 'no-store' }).then(response => response.json()),
          fetch(`/api/market/regions?${query}`, { cache: 'no-store' }).then(response => response.json()),
        ])
        if (cancelled) return
        setSummary(summaryRes?.data || null)
        setRegions(regionsRes?.data?.regions || [])
      } catch {
        if (!cancelled) setError(isEn ? 'Unable to load the report data.' : 'Falha ao carregar os dados do relatório.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [query, isEn])

  const ranked = React.useMemo(
    () => [...regions].filter(row => row.avg != null).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0)),
    [regions]
  )
  const maxAvg = Math.max(1, ...ranked.map(row => row.avg ?? 0))

  function downloadCsv() {
    const header = [
      isEn ? 'Region' : 'Região',
      isEn ? 'Listings' : 'Anúncios',
      isEn ? 'Average' : 'Média',
      isEn ? 'Minimum' : 'Mínimo',
      isEn ? 'Maximum' : 'Máximo',
    ]
    const rows = ranked.map(row => [row.region, row.count, row.avg ?? '', row.min ?? '', row.max ?? ''])
    const csv = [header, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-bolsa-${saleForm}-${periodDays}d.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function downloadPdf() {
    const element = exportRef.current
    if (!element) return
    setExporting(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { jsPDF } = await import('jspdf')
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const properties = pdf.getImageProperties(imgData)
      const ratio = Math.min((pageWidth - 20) / properties.width, (pageHeight - 20) / properties.height)
      const width = properties.width * ratio
      const height = properties.height * ratio
      pdf.addImage(imgData, 'PNG', (pageWidth - width) / 2, 10, width, height)
      pdf.save(`relatorio-bolsa-${saleForm}-${periodDays}d.pdf`)
    } catch {
      setError(isEn ? 'Unable to generate the PDF.' : 'Não foi possível gerar o PDF.')
    } finally {
      setExporting(false)
    }
  }

  const hasData = ranked.length > 0

  return (
    <div>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-gray-400">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">{isEn ? 'Filters' : 'Filtros'}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-xs font-medium text-gray-500">
            {isEn ? 'Sale form' : 'Forma de venda'}
            <select
              value={saleForm}
              onChange={event => setSaleForm(event.target.value as SaleForm)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="carcaça">{isEn ? 'Carcass (AOA/kg)' : 'Carcaça (AOA/kg)'}</option>
              <option value="vivo">{isEn ? 'Live (AOA/head)' : 'Vivo (AOA/cabeça)'}</option>
            </select>
          </label>
          <label className="text-xs font-medium text-gray-500">
            {isEn ? 'Period' : 'Período'}
            <select
              value={periodDays}
              onChange={event => setPeriodDays(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value={7}>{isEn ? '7 days' : '7 dias'}</option>
              <option value={30}>{isEn ? '30 days' : '30 dias'}</option>
              <option value={180}>{isEn ? '6 months' : '6 meses'}</option>
              <option value={365}>{isEn ? '1 year' : '1 ano'}</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={downloadPdf}
              disabled={!hasData || exporting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileDown className="h-4 w-4" />
              {exporting ? (isEn ? 'Generating…' : 'A gerar…') : 'PDF'}
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={!hasData}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div ref={exportRef} className="bg-white">
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white shadow-sm">
            <div className="text-xs font-medium text-primary-100">
              {isEn ? 'Average' : 'Média'} · {saleForm === 'vivo' ? (isEn ? 'Live' : 'Vivo') : isEn ? 'Carcass' : 'Carcaça'} ({unitLabel})
            </div>
            <div className="mt-1 text-3xl font-bold">{loading ? '…' : formatAOA(summary?.current.avg)}</div>
            <div className="mt-1 text-xs text-primary-100">
              {summary?.current.count ?? 0} {isEn ? 'listings' : 'anúncios'} · {isEn ? 'min' : 'mín'}{' '}
              {formatAOA(summary?.current.min)} · {isEn ? 'max' : 'máx'} {formatAOA(summary?.current.max)}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Trend value={summary?.variation.daily ?? null} label={isEn ? 'Daily variation' : 'Variação diária'} />
            <div className="mt-3">
              <Trend value={summary?.variation.weekly ?? null} label={isEn ? 'Weekly variation' : 'Variação semanal'} />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Trend value={summary?.variation.monthly ?? null} label={isEn ? 'Monthly variation' : 'Variação mensal'} />
            <div className="mt-3 text-xs text-gray-500">
              {summary?.officialRef != null && `${isEn ? 'Official ref.' : 'Ref. oficial'}: ${formatAOA(summary.officialRef)}`}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {summary?.effectiveDate
                ? `${isEn ? 'Latest price day' : 'Dia do preço'}: ${summary.effectiveDate.slice(0, 10)}`
                : ''}
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary-600" />
            <h2 className="font-semibold text-gray-800">{isEn ? 'Average price by region' : 'Preço médio por região'}</h2>
            <span className="text-xs text-gray-400">{unitLabel}</span>
          </div>
          {loading ? (
            <p className="rounded border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
              {isEn ? 'Loading…' : 'A carregar…'}
            </p>
          ) : !hasData ? (
            <p className="rounded border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
              {isEn ? 'No pig prices in this period.' : 'Não há preços de suínos neste período.'}
            </p>
          ) : (
            <div className="space-y-2">
              {ranked.map(row => (
                <div key={row.region} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 truncate text-sm text-gray-700">{row.region}</div>
                  <div className="h-3 flex-1 rounded bg-gray-100">
                    <div
                      className="h-3 rounded bg-primary-500"
                      style={{ width: `${((row.avg ?? 0) / maxAvg) * 100}%` }}
                    />
                  </div>
                  <div className="w-28 shrink-0 text-right text-sm font-medium text-gray-700">{formatAOA(row.avg)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {hasData && (
          <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-800">{isEn ? 'Detail by region' : 'Detalhe por região'}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="py-2.5 pr-4">{isEn ? 'Region' : 'Região'}</th>
                    <th className="py-2.5 pr-4">N</th>
                    <th className="py-2.5 pr-4">{isEn ? 'Average' : 'Média'}</th>
                    <th className="py-2.5 pr-4">{isEn ? 'Min' : 'Mín'}</th>
                    <th className="py-2.5">{isEn ? 'Max' : 'Máx'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ranked.map(row => (
                    <tr key={row.region} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4 font-medium">{row.region}</td>
                      <td className="py-2.5 pr-4">{row.count}</td>
                      <td className="py-2.5 pr-4 font-semibold">{formatAOA(row.avg)}</td>
                      <td className="py-2.5 pr-4">{formatAOA(row.min)}</td>
                      <td className="py-2.5">{formatAOA(row.max)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
