'use client'

import { useEffect, useMemo, useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import MediaUploader from './ui/MediaUploader'

type SectionKey = 'constitution' | 'admin-body'

interface LegalItem { url: string; title?: string; description?: string }
interface LegalSection { key: SectionKey; title?: string; description?: string; items: LegalItem[] }

const DEFAULT_SECTIONS: LegalSection[] = [
  { key: 'constitution', title: '', description: '', items: [] },
  { key: 'admin-body', title: '', description: '', items: [] }
]

export default function LegalManager() {
  const [sections, setSections] = useState<LegalSection[]>(DEFAULT_SECTIONS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [active, setActive] = useState<SectionKey>('constitution')

  useEffect(()=>{
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/legal-content', { cache: 'no-store', credentials: 'include' })
        if (res.ok){
          const j = await res.json()
          const map: Record<string, LegalSection> = {}
          for (const s of (j?.data || [])) map[s.key] = { key: s.key, title: s.title || '', description: s.description || '', items: Array.isArray(s.items)? s.items : [] }
          setSections(DEFAULT_SECTIONS.map(d => map[d.key] || d))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const current = useMemo(()=> sections.find(s=>s.key===active)!, [sections, active])

  const updateCurrent = (updater: (s: LegalSection)=>LegalSection) => {
    setSections(prev => prev.map(s => s.key === active ? updater({ ...s }) : s))
  }

  const saveAll = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/legal-content', { method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ sections }), credentials:'include' })
      if (res.ok){ toast.success('Conteúdo salvo'); }
      else { toast.error('Falha ao salvar') }
    } catch (e) {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {[{key:'constitution',label:'Documentação de constituição'},{key:'admin-body',label:'Corpo administrativo'}].map(tab => (
            <button key={tab.key} onClick={()=>setActive(tab.key as SectionKey)} className={`px-3 py-1 rounded ${active===tab.key ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>{tab.label}</button>
          ))}
        </div>
        <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"><Save size={16} />Salvar</button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Título (opcional)</label>
            <input value={current.title || ''} onChange={(e)=>updateCurrent(s=>({ ...s, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex.: Constituição da Associação" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Descrição (opcional)</label>
            <input value={current.description || ''} onChange={(e)=>updateCurrent(s=>({ ...s, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="Breve descrição" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Imagens/Documentos</label>
          <MediaUploader
            label="Uploads"
            accept="image/*"
            maxSizeBytes={5*1024*1024}
            uploadEndpoint="/api/images/upload"
            values={(current.items||[]).map(i=>i.url)}
            onChange={(urls)=>{
              updateCurrent(s=>({ ...s, items: urls.map((u, idx)=> ({ url: u, title: s.items?.[idx]?.title || '', description: s.items?.[idx]?.description || '' })) }))
            }}
          />
          {(current.items||[]).length>0 && (
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {current.items.map((item, idx)=> (
                <div key={item.url} className="border rounded-lg p-3 flex gap-3">
                  <img src={item.url} alt={item.title || `item-${idx+1}`} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1 space-y-2">
                    <input value={item.title || ''} onChange={(e)=>updateCurrent(s=>{ const next=[...s.items]; next[idx]={...next[idx], title: e.target.value}; return { ...s, items: next } })} className="w-full px-3 py-2 border rounded" placeholder="Título (opcional)" />
                    <input value={item.description || ''} onChange={(e)=>updateCurrent(s=>{ const next=[...s.items]; next[idx]={...next[idx], description: e.target.value}; return { ...s, items: next } })} className="w-full px-3 py-2 border rounded" placeholder="Descrição (opcional)" />
                  </div>
                  <button onClick={()=>updateCurrent(s=>({ ...s, items: s.items.filter((_,i)=>i!==idx) }))} className="self-start bg-red-600 text-white rounded p-2 hover:bg-red-700"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

