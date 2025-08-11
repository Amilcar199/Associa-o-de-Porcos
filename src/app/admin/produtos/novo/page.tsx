"use client"

import { useState } from 'react'
import { Metadata } from 'next'
import { Tag, Weight, Calendar, DollarSign, Image as ImageIcon, Save } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Adicionar Produto - Painel Administrativo',
  description: 'Cadastrar novo produto'
}

export default function AdminNewProductPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 800)
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Adicionar Produto</h1>
        <p className="text-gray-600 mt-1">Preencha os dados do novo produto</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nome</label>
            <div className="relative">
              <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ex.: Suíno Reprodutor Duroc" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Raça</label>
            <input className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ex.: Duroc" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Peso (kg)</label>
            <div className="relative">
              <Weight className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input type="number" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="80" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Idade (meses)</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input type="number" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="6" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Preço (AOA)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input type="number" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="120000" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Imagem (URL)</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Código Interno</label>
            <input className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ex.: PRD-001" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button disabled={loading} className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60">
            <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <span className="text-sm text-gray-500">Apenas interface (API não conectada)</span>
        </div>
      </form>
    </div>
  )
}