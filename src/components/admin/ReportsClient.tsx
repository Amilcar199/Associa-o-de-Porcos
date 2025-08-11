"use client"

import { useEffect, useState } from 'react'
import DashboardCharts from '@/components/admin/DashboardCharts'

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

  const exportCsv = (kind: 'products' | 'news' | 'contacts' | 'users') => {
    if (!stats) return
    let rows: any[] = []
    if (kind === 'products') rows = stats.charts?.productsByBreed?.map((x: any)=>({ breed: x.name, count: x.value })) || []
    if (kind === 'news') rows = stats.charts?.newsByCategory?.map((x: any)=>({ category: x.name, count: x.value })) || []
    if (kind === 'contacts') rows = (stats.contacts || []).map((x: any)=>({ status: x._id, count: x.count }))
    if (kind === 'users') rows = [{ total: stats.overview?.totalUsers, active: stats.overview?.activeUsers }]
    const csv = toCsv(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${kind}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Exportar Dados</h3>
        <p className="text-sm text-gray-600 mb-4">Exporte métricas em CSV para análises externas.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>exportCsv('products')} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">Produtos por Raça</button>
          <button onClick={()=>exportCsv('news')} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">Notícias por Categoria</button>
          <button onClick={()=>exportCsv('contacts')} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">Contatos por Status</button>
          <button onClick={()=>exportCsv('users')} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">Usuários</button>
        </div>
      </div>

      {/* Reusar gráficos existentes */}
      <DashboardCharts />
    </div>
  )
}