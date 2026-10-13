"use client"

import { useEffect, useState } from 'react'
import DashboardCharts from '@/components/admin/DashboardCharts'
import { BarChart } from '@/components/admin/StatVisuals'

function toCsv(rows: any[], headers?: string[]) {
  if (!rows || rows.length === 0) return ''
  const keys = headers || Object.keys(rows[0])
  const escape = (v: any) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
  const header = keys.map(escape).join(',')
  const body = rows.map(r => keys.map(k => escape(r[k])).join(',')).join('\n')
  return header + '\n' + body
}

export default function ReportsClient() {
  const [stats, setStats] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const j = await res.json()
          setStats(j.data)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const exportCsv = (kind: 'products' | 'news' | 'contacts' | 'users' | 'resumo') => {
    if (!stats) return
    let rows: any[] = []
    if (kind === 'products') rows = stats.charts?.productsByBreed?.map((x: any)=>({ breed: x.name, count: x.value })) || []
    if (kind === 'news') rows = stats.charts?.newsByCategory?.map((x: any)=>({ category: x.name, count: x.value })) || []
    if (kind === 'contacts') rows = (stats.contacts || []).map((x: any)=>({ status: x._id, count: x.count }))
    // A API conta apenas utilizadores com isActive: true, por isso não há coluna separada de inactivos.
    if (kind === 'users') rows = [{ activos: stats.overview?.totalUsers ?? 0, novos_este_mes: stats.overview?.usersThisMonth ?? 0 }]
    if (kind === 'resumo') {
      rows = (stats.reports || []).flatMap((group: { title: string; items: { label: string; value: number }[] }) =>
        group.items.map((item) => ({ grupo: group.title, indicador: item.label, valor: item.value }))
      )
    }
    const csv = toCsv(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${kind}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const palette = ['#16a34a', '#2563eb', '#f59e0b', '#ef4444', '#7c3aed', '#64748b']

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Exportar Dados</h3>
        <p className="text-sm text-gray-600 mb-4">Exporte métricas em CSV para análises externas.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>exportCsv('products')} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">Produtos por Raça</button>
          <button onClick={()=>exportCsv('news')} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">Notícias por Categoria</button>
          <button onClick={()=>exportCsv('contacts')} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">Contatos por Status</button>
          <button onClick={()=>exportCsv('resumo')} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">Resumo</button>
          <button onClick={()=>exportCsv('users')} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">Usuários</button>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">A carregar relatórios…</p>}
      {stats?.reports && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.reports.map((group: { title: string; items: { label: string; value: number }[] }) => {
            const parts = group.items.filter((item) => item.label !== 'Total' && item.label !== 'Activos')
            const source = parts.length >= 2 ? parts : group.items
            const slices = source.map((item, index) => ({
              label: item.label,
              value: item.value,
              color: palette[index % palette.length],
            }))
            return (
            <section key={group.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{group.title}</h3>
              {slices.length >= 2 && (
                <div className="mb-4">
                  <BarChart slices={slices} />
                </div>
              )}
              <dl className="grid grid-cols-2 gap-3">
                {group.items.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs text-gray-500">{item.label}</dt>
                    <dd className="text-xl font-semibold text-gray-900">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            )
          })}
        </div>
      )}

      {/* Reusar gráficos existentes */}
      <DashboardCharts />
    </div>
  )
}