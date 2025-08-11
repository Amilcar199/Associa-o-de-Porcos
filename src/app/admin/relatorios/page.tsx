import { Metadata } from 'next'
import ReportsClient from '@/components/admin/ReportsClient'

export const metadata: Metadata = {
  title: 'Relatórios - Painel Administrativo',
  description: 'Relatórios e métricas'
}

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-1">Acompanhe métricas e exporte dados</p>
      </div>

      <ReportsClient />
    </div>
  )
}