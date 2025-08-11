import { Metadata } from 'next'
'use client'
import { useEffect, useState } from 'react'

export const metadata: Metadata = {
  title: 'Categorias de Produtos - Painel Administrativo',
  description: 'Gerenciar categorias de produtos'
}

function DynamicBreeds(){
  const [breeds, setBreeds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    const load=async()=>{
      try{
        const res = await fetch('/api/products?limit=1&sort=createdAt&order=desc')
        // Pegar raças via agregação simples: vamos buscar várias páginas rapidamente
        const res2 = await fetch('/api/products?limit=1000')
        const list: any[] = res2.ok ? (await res2.json()).data || [] : []
        const set = Array.from(new Set(list.map((p:any)=>p.breed).filter(Boolean)))
        setBreeds(set)
      } finally { setLoading(false) }
    }
    load()
  },[])
  if (loading) return <div>Carregando raças...</div>
  if (breeds.length===0) return <div className="text-gray-500">Nenhuma raça encontrada.</div>
  return (
    <ul className="list-disc pl-6 text-gray-800 space-y-1">
      {breeds.map(b=> <li key={b}>{b}</li>)}
    </ul>
  )
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