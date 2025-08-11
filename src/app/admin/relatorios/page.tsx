import { Metadata } from 'next'

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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-600">Relatórios em desenvolvimento.</p>
      </div>
    </div>
  )
}