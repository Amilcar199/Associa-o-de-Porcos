'use client'

import { useAdminStats, reportValue } from './useAdminStats'
import { BarChart, DonutChart, type ChartSlice } from './StatVisuals'

const ROLE_COLORS = ['#16a34a', '#2563eb', '#f59e0b']
const PLAN_COLORS = ['#64748b', '#16a34a']
const FARM_COLORS = ['#16a34a', '#f59e0b', '#ef4444']
const CONTACT_COLORS: Record<string, string> = {
  Novos: '#ef4444',
  Lidos: '#f59e0b',
  Respondidos: '#16a34a',
  Arquivados: '#64748b',
}

function slicesFrom(stats: ReturnType<typeof useAdminStats>['stats'], title: string, labels: string[], colors: string[]): ChartSlice[] {
  return labels.map((label, index) => ({
    label,
    value: reportValue(stats, title, label),
    color: colors[index % colors.length],
  }))
}

export default function DashboardComposition() {
  const { stats, loading } = useAdminStats()

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-44 animate-pulse rounded-2xl border border-gray-100 bg-white" />
        ))}
      </div>
    )
  }

  const roles = slicesFrom(stats, 'Utilizadores', ['Administradores', 'Membros', 'Visitantes'], ROLE_COLORS)
  const plans = slicesFrom(stats, 'Planos', ['Gratuito', 'Pro'], PLAN_COLORS)
  const farms = slicesFrom(stats, 'Produtores', ['Fazendas aprovadas', 'Fazendas pendentes', 'Fazendas recusadas'], FARM_COLORS)
  const contacts = (stats?.reports.find((group) => group.title === 'Contactos')?.items || [])
    .filter((item) => item.label !== 'Total')
    .map((item) => ({
      label: item.label,
      value: item.value,
      color: CONTACT_COLORS[item.label] || '#64748b',
    }))

  const cards = [
    { title: 'Utilizadores por papel', chart: <DonutChart slices={roles} emptyLabel="Nenhum utilizador activo" /> },
    { title: 'Planos', chart: <DonutChart slices={plans} emptyLabel="Nenhum plano atribuído" /> },
    { title: 'Fazendas no mapa', chart: <BarChart slices={farms} emptyLabel="Nenhuma fazenda registada" /> },
    { title: 'Contactos por estado', chart: <BarChart slices={contacts} emptyLabel="Nenhum contacto recebido" /> },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {cards.map((card) => (
        <section key={card.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-900">{card.title}</h3>
          {card.chart}
        </section>
      ))}
    </div>
  )
}
