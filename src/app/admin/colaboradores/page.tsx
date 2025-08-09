import { Metadata } from 'next'
import CollaboratorsManager from '@/components/admin/CollaboratorsManager'

export const metadata: Metadata = {
  title: 'Gerenciar Colaboradores - Painel Administrativo',
  description: 'Gerenciamento de colaboradores da Associação de Porcos',
}

export default function AdminCollaboratorsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Gerenciar Colaboradores
        </h1>
        <p className="text-gray-600 mt-1">
          Gerencie todos os colaboradores e parceiros da associação
        </p>
      </div>

      {/* Collaborators Manager */}
      <CollaboratorsManager />
    </div>
  )
}
