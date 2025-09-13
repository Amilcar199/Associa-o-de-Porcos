"use client"

import React, { useState } from 'react'
import { Save, Image as ImageIcon, FileText, Type, Tag } from 'lucide-react'
import MediaUploader from '@/components/admin/ui/MediaUploader'

const categories = [
  { value: 'news', label: 'Notícias' },
  { value: 'events', label: 'Eventos' },
  { value: 'tips', label: 'Dicas' },
  { value: 'market', label: 'Mercado' }
]

export default function NewNewsClient(){
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    imageUrl: '' as string,
    published: false,
    images: [] as string[],
    videos: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!form.imageUrl) {
        alert('Adicione uma imagem de destaque (URL ou upload).')
        return
      }
      const payload = {
        title: form.title,
        category: form.category,
        excerpt: form.excerpt,
        content: form.content,
        featuredImage: form.imageUrl,
        images: (form.images && form.images.length>0) ? form.images : [form.imageUrl],
        videos: (form.videos||[]).map(s=>s.trim()).filter(Boolean),
        published: form.published
      }
      const res = await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        try { const j = await res.json(); alert(j?.error || 'Falha ao salvar') } catch { alert('Falha ao salvar') }
        return
      }
      setForm({ title: '', category: '', excerpt: '', content: '', imageUrl: '', published: false, images: [], videos: [] })
      alert('Notícia criada com sucesso')
    } catch {
      alert('Erro ao salvar notícia')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Título</label>
          <div className="relative">
            <Type className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input value={form.title} onChange={(e)=>setForm(p=>({...p,title:e.target.value}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Categoria</label>
          <select value={form.category} onChange={(e)=>setForm(p=>({...p,category:e.target.value}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required>
            <option value="">Selecione...</option>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Resumo</label>
        <textarea value={form.excerpt} onChange={(e)=>setForm(p=>({...p,excerpt:e.target.value}))} rows={3} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Conteúdo</label>
        <textarea value={form.content} onChange={(e)=>setForm(p=>({...p,content:e.target.value}))} rows={8} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Imagem de Destaque (URL)</label>
          <div className="relative">
            <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input value={form.imageUrl} onChange={(e)=>setForm(p=>({...p,imageUrl:e.target.value}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://..." />
          </div>
          <div className="mt-2">
            <label className="block text-sm text-gray-700 mb-1">ou Upload local</label>
            <input type="file" accept="image/*" onChange={async (e)=>{
              const file=e.target.files?.[0]
              if(!file) return
              const fd=new FormData(); fd.append('file',file)
              const res=await fetch('/api/images/upload',{method:'POST',body:fd})
              if(res.ok){ const json=await res.json(); setForm(p=>({...p,imageUrl:json.data.url, images: Array.from(new Set([...(p.images||[]), json.data.url]))})) } else { alert('Falha no upload da imagem') }
            }} className="w-full" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Status</label>
          <select value={String(form.published)} onChange={(e)=>setForm(p=>({...p,published:e.target.value==='true'}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="false">Rascunho</option>
            <option value="true">Publicado</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MediaUploader
          label="Imagens Adicionais"
          accept="image/*"
          maxSizeBytes={5*1024*1024}
          uploadEndpoint="/api/images/upload"
          values={form.images || []}
          onChange={(urls)=>setForm(p=>({...p, images: urls}))}
        />
        <MediaUploader
          label="Vídeos"
          accept="video/*"
          maxSizeBytes={100*1024*1024}
          uploadEndpoint="/api/videos/upload"
          values={form.videos || []}
          onChange={(urls)=>setForm(p=>({...p, videos: urls}))}
        />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={loading} className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60">
          <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}