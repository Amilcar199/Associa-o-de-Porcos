"use client"

import React, { useState } from 'react'
import { Tag, Weight, Calendar, DollarSign, Image as ImageIcon, Save } from 'lucide-react'

export default function NewProductClient() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    breed: '',
    age: 0,
    weight: 0,
    price: undefined as number | undefined,
    images: [''],
    features: [] as string[],
    healthStatus: 'good' as 'excellent' | 'good' | 'fair',
    vaccinated: false,
    location: '',
    tags: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // seller será inferido no backend a partir da sessão ou validado
        }),
      })
      if (!res.ok) throw new Error('Falha ao salvar')
      setForm({
        name: '', description: '', breed: '', age: 0, weight: 0, price: undefined,
        images: [''], features: [], healthStatus: 'good', vaccinated: false, location: '', tags: []
      })
      alert('Produto criado com sucesso')
    } catch (err) {
      alert('Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
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
              <input value={form.name} onChange={(e)=>setForm(p=>({...p,name:e.target.value}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ex.: Suíno Reprodutor Duroc" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Raça</label>
            <input value={form.breed} onChange={(e)=>setForm(p=>({...p,breed:e.target.value}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ex.: Duroc" required />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Peso (kg)</label>
            <div className="relative">
              <Weight className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input type="number" value={form.weight} onChange={(e)=>setForm(p=>({...p,weight:parseFloat(e.target.value)}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="80" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Idade (meses)</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input type="number" value={form.age} onChange={(e)=>setForm(p=>({...p,age:parseInt(e.target.value)}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="6" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Preço (AOA)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input type="number" value={form.price ?? ''} onChange={(e)=>setForm(p=>({...p,price:e.target.value===''?undefined:parseFloat(e.target.value)}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="120000" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Imagem (URL)</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input value={form.images[0] || ''} onChange={(e)=>setForm(p=>({...p,images:[e.target.value]}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://..." />
            </div>
            <div className="mt-2">
              <label className="block text-sm text-gray-700 mb-1">ou Upload local</label>
              <input type="file" accept="image/*" onChange={async (e)=>{
                const file=e.target.files?.[0];
                if(!file) return;
                const fd=new FormData();
                fd.append('file',file);
                const res=await fetch('/api/images/upload',{method:'POST',body:fd});
                if(res.ok){
                  const json=await res.json();
                  setForm(p=>({...p,images:[json.data.url]}));
                } else {
                  alert('Falha no upload da imagem');
                }
              }} className="w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Localização</label>
            <input value={form.location} onChange={(e)=>setForm(p=>({...p,location:e.target.value}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ex.: Luanda, Angola" required />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60">
            <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}