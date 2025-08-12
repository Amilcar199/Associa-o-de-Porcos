import { Metadata } from 'next'
import NewMemberContentClient from './NewMemberContentClient'

export const metadata: Metadata = {
  title: 'Novo Conteúdo de Membros - Painel Administrativo',
  description: 'Criar novo conteúdo exclusivo para membros da associação'
}

export default function NewMemberContentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Novo Conteúdo de Membros
        </h1>
        <p className="text-gray-600 mt-1">
          Crie conteúdo exclusivo para membros da associação
        </p>
      </div>

      {/* Form */}
      <NewMemberContentClient />
    </div>
  )
}