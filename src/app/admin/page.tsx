import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardStats from '@/components/admin/DashboardStats'
import DashboardCharts from '@/components/admin/DashboardCharts'
import RecentActivity from '@/components/admin/RecentActivity'
import AdminSearch from '@/components/admin/AdminSearch'

export const metadata: Metadata = {
  title: 'Dashboard - Painel Administrativo',
  description: 'Dashboard principal do painel administrativo da Associação de Porcos',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const firstName = session?.user?.name?.split(' ')[0]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-8 lg:px-8 lg:py-10 text-white shadow-sm">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold">
            {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="text-primary-100 mt-1">
            Aqui está a visão geral do sistema e as atividades mais recentes.
          </p>
        </div>
      </div>

      {/* Search Modal trigger via ?search= */}
      <AdminSearch />

      {/* Stats Cards */}
      <DashboardStats />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts - 2/3 da largura */}
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>

        {/* Recent Activity - 1/3 da largura */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
