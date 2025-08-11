import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nova Notícia - Painel Administrativo',
  description: 'Criar nova notícia'
}

export default function AdminNewNewsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Nova Notícia</h1>
        <p className="text-gray-600 mt-1">Redija e publique uma notícia</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-600">Editor em desenvolvimento.</p>
      </div>
    </div>
  )
}