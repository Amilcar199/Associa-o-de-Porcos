import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardStats from '@/components/admin/DashboardStats'
import DashboardCharts from '@/components/admin/DashboardCharts'
import RecentActivity from '@/components/admin/RecentActivity'
import AdminSearch from '@/components/admin/AdminSearch'
import DashboardGreeting from '@/components/admin/DashboardGreeting'
import DashboardAttention from '@/components/admin/DashboardAttention'

export const metadata: Metadata = {
  title: 'Dashboard - Painel Administrativo',
  description: 'Dashboard principal do painel administrativo da Associação de Porcos',
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const firstName = session?.user?.name?.split(' ')[0]

  return (
    <div className="space-y-6">
      <DashboardGreeting firstName={firstName} />
      <AdminSearch />
      <DashboardAttention />
      <DashboardStats />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
