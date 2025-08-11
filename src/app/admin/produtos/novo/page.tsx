import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Adicionar Produto - Painel Administrativo',
  description: 'Cadastrar novo produto'
}

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Adicionar Produto</h1>
        <p className="text-gray-600 mt-1">Preencha os dados do novo produto</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-600">Formulário em desenvolvimento.</p>
      </div>
    </div>
  )
}