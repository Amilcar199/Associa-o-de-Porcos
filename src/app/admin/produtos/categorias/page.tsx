import { Metadata } from 'next'
import DynamicBreeds from '@/components/admin/DynamicBreeds'

export const metadata: Metadata = {
  title: 'Categorias de Produtos - Painel Administrativo',
  description: 'Gerenciar categorias de produtos'
}

export default function AdminProductCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Categorias de Produtos</h1>
        <p className="text-gray-600 mt-1">Crie e organize categorias</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-700 mb-3">Raças detectadas no banco de dados (dinâmico):</p>
        <DynamicBreeds />
        <p className="text-sm text-gray-500 mt-4">Edição avançada de categorias em desenvolvimento.</p>
      </div>
    </div>
  )
}