import { Metadata } from 'next'
import { Suspense } from 'react'
import DashboardStats from '@/components/admin/DashboardStats'
import DashboardCharts from '@/components/admin/DashboardCharts'
import RecentActivity from '@/components/admin/RecentActivity'
import AdminSearch from '@/components/admin/AdminSearch'

export const metadata: Metadata = {
  title: 'Dashboard - Painel Administrativo',
  description: 'Dashboard principal do painel administrativo da Associação de Porcos',
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Visão geral do sistema e atividades recentes
        </p>
      </div>

      {/* Search Modal trigger via ?search= */}
      <Suspense fallback={<div>Carregando...</div>}>
        <AdminSearch />
      </Suspense>

      {/* Stats Cards */}
      <Suspense fallback={<div>Carregando estatísticas...</div>}>
        <DashboardStats />
      </Suspense>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts - 2/3 da largura */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div>Carregando gráficos...</div>}>
            <DashboardCharts />
          </Suspense>
        </div>

        {/* Recent Activity - 1/3 da largura */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div>Carregando atividades...</div>}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
