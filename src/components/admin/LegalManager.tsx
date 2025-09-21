'use client'

import { useEffect, useMemo, useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import MediaUploader from './ui/MediaUploader'
import { useLanguage } from '@/components/providers/LanguageProvider'

type SectionKey = 'constitution' | 'admin-body'

interface LegalItem { url: string; title?: string; description?: string }
interface LegalSection { key: SectionKey; title?: string; description?: string; items: LegalItem[] }

const DEFAULT_SECTIONS: LegalSection[] = [
  { key: 'constitution', title: '', description: '', items: [] },
  { key: 'admin-body', title: '', description: '', items: [] }
]

export default function LegalManager({ showUploader = true }: { showUploader?: boolean } = {}) {
  const { locale } = useLanguage()
  const isEn = String(locale || '').startsWith('en')
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
      if (res.ok){
        toast.success('Conteúdo salvo')
        // Recarregar para refletir estado persistido e resetar inputs
        try {
          const fresh = await fetch('/api/legal-content', { cache: 'no-store', credentials: 'include' })
          if (fresh.ok){
            const j = await fresh.json()
            const map: Record<string, LegalSection> = {}
            for (const s of (j?.data || [])) map[s.key] = { key: s.key, title: s.title || '', description: s.description || '', items: Array.isArray(s.items)? s.items : [] }
            setSections(DEFAULT_SECTIONS.map(d => map[d.key] || d))
          }
        } catch {}
      }
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
          {[{key:'constitution',label: isEn ? 'Constitution Documentation' : 'Documentação de constituição'},{key:'admin-body',label: isEn ? 'Administrative Body' : 'Corpo administrativo'}].map(tab => (
            <button key={tab.key} onClick={()=>setActive(tab.key as SectionKey)} className={`px-3 py-1 rounded ${active===tab.key ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>{tab.label}</button>
          ))}
        </div>
        <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"><Save size={16} />{isEn ? 'Save' : 'Salvar'}</button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">{isEn ? 'Title (optional)' : 'Título (opcional)'}</label>
            <input value={current.title || ''} onChange={(e)=>updateCurrent(s=>({ ...s, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder={isEn ? 'E.g.: Association Constitution' : 'Ex.: Constituição da Associação'} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{isEn ? 'Description (optional)' : 'Descrição (opcional)'}</label>
            <input value={current.description || ''} onChange={(e)=>updateCurrent(s=>({ ...s, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder={isEn ? 'Short description' : 'Breve descrição'} />
          </div>
        </div>

        <div>
          {showUploader && (
            <>
              <label className="block text-sm font-medium text-gray-900 mb-2">{isEn ? 'Images/Documents' : 'Imagens/Documentos'}</label>
              <MediaUploader
                label={isEn ? 'Uploads' : 'Uploads'}
                accept="image/*"
                maxSizeBytes={5*1024*1024}
                uploadEndpoint="/api/images/upload"
                values={(current.items||[]).map(i=>i.url)}
                onChange={(urls)=>{
                  // Acrescentar ao invés de substituir
                  updateCurrent(s=>{
                    const existing = Array.isArray(s.items) ? s.items : []
                    const existingUrls = new Set(existing.map(i=>i.url))
                    const additions = urls
                      .filter(u => !existingUrls.has(u))
                      .map(u => ({ url: u, title: '', description: '' }))
                    return { ...s, items: [...existing, ...additions] }
                  })
                }}
              />
            </>
          )}
          {(current.items||[]).length>0 && (
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {current.items.map((item, idx)=> (
                <div key={item.url} className="border rounded-lg p-3 flex gap-3">
                  <img src={item.url} alt={item.title || `item-${idx+1}`} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1 space-y-2">
                    <input value={item.title || ''} onChange={(e)=>updateCurrent(s=>{ const next=[...s.items]; next[idx]={...next[idx], title: e.target.value}; return { ...s, items: next } })} className="w-full px-3 py-2 border rounded" placeholder={isEn ? 'Title (optional)' : 'Título (opcional)'} />
                    <input value={item.description || ''} onChange={(e)=>updateCurrent(s=>{ const next=[...s.items]; next[idx]={...next[idx], description: e.target.value}; return { ...s, items: next } })} className="w-full px-3 py-2 border rounded" placeholder={isEn ? 'Description (optional)' : 'Descrição (opcional)'} />
                  </div>
                  <button
                    onClick={async()=>{
                      const toRemove = current.items[idx]
                      try {
                        // Se a URL for do GridFS, chamar DELETE direto nele; caso contrário, tentar nas rotas públicas
                        if (/^\/api\/images\//.test(toRemove.url)) {
                          await fetch(toRemove.url, { method: 'DELETE', credentials: 'include' })
                        } else if (/^\/api\/public-assets\/constitution\/image\?/.test(toRemove.url)) {
                          const u = new URL(toRemove.url, window.location.origin)
                          const name = u.searchParams.get('name') || ''
                          if (name) await fetch(`/api/public-assets/constitution/image?name=${encodeURIComponent(name)}`, { method: 'DELETE', credentials: 'include' })
                        } else if (/^\//.test(toRemove.url)) {
                          const rel = toRemove.url.replace(/^\/+/, '')
                          await fetch(`/api/public-images?path=${encodeURIComponent(rel)}`, { method: 'DELETE', credentials: 'include' })
                        }
                      } catch {}
                      updateCurrent(s=>({ ...s, items: s.items.filter((_,i)=>i!==idx) }))
                    }}
                    className="self-start bg-red-600 text-white rounded p-2 hover:bg-red-700"
                  ><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}

          {(current.items||[]).length>0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{isEn ? 'Items list' : 'Lista de itens'}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-left">{isEn ? 'Preview' : 'Prévia'}</th>
                      <th className="px-3 py-2 text-left">URL</th>
                      <th className="px-3 py-2 text-left">{isEn ? 'Title' : 'Título'}</th>
                      <th className="px-3 py-2 text-left">{isEn ? 'Description' : 'Descrição'}</th>
                      <th className="px-3 py-2 text-right">{isEn ? 'Actions' : 'Ações'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {current.items.map((item, idx)=> (
                      <tr key={`row-${item.url}`} className="border-t">
                        <td className="px-3 py-2">
                          <img src={item.url} alt={item.title || `item-${idx+1}`} className="w-12 h-12 rounded object-cover" />
                        </td>
                        <td className="px-3 py-2 text-gray-600 truncate max-w-[260px]" title={item.url}>{item.url}</td>
                        <td className="px-3 py-2">
                          <input value={item.title || ''} onChange={(e)=>updateCurrent(s=>{ const next=[...s.items]; next[idx]={...next[idx], title: e.target.value}; return { ...s, items: next } })} className="w-full px-2 py-1 border rounded" />
                        </td>
                        <td className="px-3 py-2">
                          <input value={item.description || ''} onChange={(e)=>updateCurrent(s=>{ const next=[...s.items]; next[idx]={...next[idx], description: e.target.value}; return { ...s, items: next } })} className="w-full px-2 py-1 border rounded" />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={async()=>{
                              const toRemove = current.items[idx]
                              try {
                                if (/^\/api\/images\//.test(toRemove.url)) {
                                  await fetch(toRemove.url, { method: 'DELETE', credentials: 'include' })
                                } else if (/^\/api\/public-assets\/constitution\/image\?/.test(toRemove.url)) {
                                  const u = new URL(toRemove.url, window.location.origin)
                                  const name = u.searchParams.get('name') || ''
                                  if (name) await fetch(`/api/public-assets/constitution/image?name=${encodeURIComponent(name)}`, { method: 'DELETE', credentials: 'include' })
                                } else if (/^\//.test(toRemove.url)) {
                                  const rel = toRemove.url.replace(/^\/+/, '')
                                  await fetch(`/api/public-images?path=${encodeURIComponent(rel)}`, { method: 'DELETE', credentials: 'include' })
                                }
                              } catch {}
                              updateCurrent(s=>({ ...s, items: s.items.filter((_,i)=>i!==idx) }))
                            }}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                          >
                            <Trash2 size={16} /> {isEn ? 'Delete' : 'Eliminar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

