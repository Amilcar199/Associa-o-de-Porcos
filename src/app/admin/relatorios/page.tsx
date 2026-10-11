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
        <p className="text-gray-600 mt-1">Utilizadores, produtores, compradores, produtos, pedidos, respostas, contactos e planos. A receita entra quando o pagamento estiver ligado.</p>
      </div>

      <ReportsClient />
    </div>
  )
}