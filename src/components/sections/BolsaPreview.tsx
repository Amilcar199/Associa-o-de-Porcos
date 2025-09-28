'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/components/providers/LanguageProvider'

type Unit = 'kg' | 'head'

interface SummaryRes { success: boolean, data: { unit: Unit, current: { avg: number | null, count: number }, variation: { daily: number | null, weekly: number | null, monthly: number | null }, officialRef?: number | null, usedFallback?: boolean, effectiveDate?: string } }
interface OverallRes { success: boolean, data: { unit?: Unit, avg: number | null, count: number } }

function formatAOA(v: number | null) {
  if (v == null || Number.isNaN(v)) return '—'
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(v)
}
function formatPct(v: number | null) {
  if (v == null || Number.isNaN(v)) return '—'
  return `${v.toFixed(2)}%`
}
function fmtDateISO(s?: string) { return s ? s.slice(0,10) : '—' }

export default function BolsaPreview() {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')
  const [saleForm, setSaleForm] = useState('carcaça' as 'carcaça' | 'vivo')
  const unit: Unit = saleForm === 'vivo' ? 'head' : 'kg'
  const [loading, setLoading] = useState({ summary: false, overall: false })
  const [error, setError] = useState({ summary: '', overall: '' })
  const [summary, setSummary] = useState(null as SummaryRes["data"] | null)
  const [overall, setOverall] = useState(null as OverallRes["data"] | null)

  const params = useMemo(() => {
    const p = new URLSearchParams()
    p.set('unit', unit)
    p.set('saleForm', saleForm)
    return p
  }, [unit, saleForm])

  useEffect(() => { (async () => {
    setLoading(l => ({ ...l, summary: true })); setError(e => ({ ...e, summary: '' }))
    try {
      const s: SummaryRes = await (await fetch(`/api/market/summary?${params.toString()}`, { cache: 'no-store' })).json()
      setSummary(s?.data || null)
    } catch {
      setError(e => ({ ...e, summary: isEn ? 'Failed to load' : 'Falha ao carregar' }))
    } finally { setLoading(l => ({ ...l, summary: false })) }

    setLoading(l => ({ ...l, overall: true })); setError(e => ({ ...e, overall: '' }))
    try {
      const o: OverallRes = await (await fetch(`/api/market/overall?${params.toString()}`, { cache: 'no-store' })).json()
      setOverall(o?.data || null)
    } catch {
      setError(e => ({ ...e, overall: isEn ? 'Failed to load' : 'Falha ao carregar' }))
    } finally { setLoading(l => ({ ...l, overall: false })) }
  })() }, [params, isEn])

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{isEn ? 'Market Preview' : 'Prévia da Bolsa'}</h2>
            <p className="text-gray-600">{isEn ? 'Current average price with quick variations' : 'Preço médio atual com variações rápidas'}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">
              {isEn ? 'Sale form' : 'Forma'}
              <select value={saleForm} onChange={e=>setSaleForm(e.target.value as any)} className="ml-2 px-2 py-1 border rounded-md">
                <option value="carcaça">{isEn ? 'Carcass' : 'Carcaça'}</option>
                <option value="vivo">{isEn ? 'Live' : 'Vivo'}</option>
              </select>
            </label>
            <a href="/bolsa" className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm">{isEn ? 'Open full' : 'Abrir completo'}</a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
            <div className="text-xs text-emerald-700/80">{isEn ? 'Current average' : 'Média atual'} ({unit === 'kg' ? (isEn ? 'AOA/kg' : 'AOA/kg') : (isEn ? 'AOA/head' : 'AOA/cabeça')})</div>
            {loading.summary ? (
              <div className="mt-2 h-8 w-40 bg-emerald-100/60 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-extrabold mt-1 text-emerald-800 tracking-tight">{formatAOA(summary?.current?.avg ?? null)}</div>
            )}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-emerald-200/40" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs text-gray-500">{isEn ? 'Variations' : 'Variações'}</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-gray-500">{isEn ? 'Daily' : 'Diária'}</div>
                {loading.summary ? <div className="mt-1 h-5 w-10 bg-gray-100 rounded mx-auto" /> : (
                  <div className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-xs ${((summary?.variation?.daily ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{formatPct(summary?.variation?.daily ?? null)}</div>
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-gray-500">{isEn ? 'Weekly' : 'Semanal'}</div>
                {loading.summary ? <div className="mt-1 h-5 w-10 bg-gray-100 rounded mx-auto" /> : (
                  <div className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-xs ${((summary?.variation?.weekly ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{formatPct(summary?.variation?.weekly ?? null)}</div>
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-gray-500">{isEn ? 'Monthly' : 'Mensal'}</div>
                {loading.summary ? <div className="mt-1 h-5 w-10 bg-gray-100 rounded mx-auto" /> : (
                  <div className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-xs ${((summary?.variation?.monthly ?? 0) >= 0) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{formatPct(summary?.variation?.monthly ?? null)}</div>
                )}
              </div>
            </div>
            <div className="mt-3 text-[11px] text-gray-500 flex items-center justify-between">
              <span>{isEn ? 'Records' : 'Registos'}: {loading.summary ? '…' : (summary?.current?.count ?? 0)}</span>
              {!loading.summary && summary?.usedFallback && (
                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{isEn ? 'Best recent day' : 'Melhor dia recente'} ({fmtDateISO(summary?.effectiveDate)})</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs text-gray-500">{isEn ? 'Overall average (all data)' : 'Média geral (todos os dados)'}</div>
            {loading.overall ? (
              <div className="mt-2 h-8 w-36 bg-gray-100 rounded" />
            ) : (
              <div className="text-2xl font-bold mt-1 text-gray-900">{formatAOA(overall?.avg ?? null)}</div>
            )}
            <div className="text-[11px] text-gray-500 mt-1">{isEn ? 'Base' : 'Base'}: {loading.overall ? '…' : (overall?.count ?? 0)} {isEn ? 'records' : 'registos'}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

