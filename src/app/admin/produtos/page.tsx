import { Metadata } from 'next'
import ProductsManager from '@/components/admin/ProductsManager'

export const metadata: Metadata = {
  title: 'Gerenciar Produtos - Painel Administrativo',
  description: 'Gerenciamento de produtos da Associação de Porcos',
}

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Gerenciar Produtos
        </h1>
        <p className="text-gray-600 mt-1">
          Gerencie todos os produtos (suínos) da plataforma
        </p>
      </div>

      {/* Products Manager */}
      <ProductsManager />
    </div>
  )
}
