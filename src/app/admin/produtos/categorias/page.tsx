import { Metadata } from 'next'

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
        <p className="text-gray-700 mb-3">Categorias de exemplo (raças) detectadas automaticamente a partir dos produtos:</p>
        <ul className="list-disc pl-6 text-gray-800 space-y-1">
          {['Landrace','Large White','Duroc','Hampshire','Pietrain','Yorkshire','Chester White','Spotted','Tamworth','Gloucester Old Spots','Mangalitsa','Ossabaw Island Hog','Mulefoot','Caipira','Piau','Moura','Canastra','Cruzado','Outro'].map(c => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="text-sm text-gray-500 mt-4">Edição avançada de categorias em desenvolvimento.</p>
      </div>
    </div>
  )
}