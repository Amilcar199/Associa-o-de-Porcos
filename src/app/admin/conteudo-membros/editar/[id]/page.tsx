import { Metadata } from 'next'
import EditMemberContentClient from './EditMemberContentClient'

export const metadata: Metadata = {
  title: 'Editar Conteúdo de Membros - Painel Administrativo',
  description: 'Editar conteúdo exclusivo para membros da associação'
}

interface PageProps {
  params: { id: string }
}

export default function EditMemberContentPage({ params }: PageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Editar Conteúdo de Membros
        </h1>
        <p className="text-gray-600 mt-1">
          Editar conteúdo exclusivo para membros da associação
        </p>
      </div>

      {/* Form */}
      <EditMemberContentClient contentId={params.id} />
    </div>
  )
}