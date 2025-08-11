import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Usuários - Painel Administrativo',
  description: 'Gerenciamento de usuários'
}

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-600 mt-1">Gerencie permissões e perfis de usuários</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-600">Módulo em desenvolvimento.</p>
      </div>
    </div>
  )
}