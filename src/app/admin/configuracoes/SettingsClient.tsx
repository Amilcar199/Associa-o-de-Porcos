'use client'

import { useEffect, useState } from 'react'

export default function SettingsClient() {
  const [currency, setCurrency] = useState('AOA')
  const [locale, setLocale] = useState('pt-AO')
  const [contactEmail, setContactEmail] = useState('contato@associacaoporcos.ao')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const load = async () => {
      try {
        const res = await fetch('/api/admin/config')
        if (res.ok) {
          const j = await res.json()
          const c = j?.data || {}
          if (c.currency) setCurrency(c.currency)
          if (c.locale) setLocale(c.locale)
          if (c.contactEmail) setContactEmail(c.contactEmail)
          if (c.logoUrl) setLogoUrl(c.logoUrl)
        }
      } catch {}
    }
    load()
  },[])

  const save = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/config', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ currency, locale, contactEmail, logoUrl }) })
      if (!res.ok) {
        try { const j = await res.json(); alert(j?.error || 'Falha ao salvar configurações') } catch { alert('Falha ao salvar configurações') }
        return
      }
      alert('Configurações salvas com sucesso')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-sm text-gray-700 mb-1">Logo (URL)</label>
        <input value={logoUrl} onChange={e=>setLogoUrl(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="/api/images/xxxxx" />
        <p className="text-xs text-gray-500 mt-1">Dica: na aba Mídia, clique em “Definir como logo” para preencher automaticamente.</p>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Moeda padrão</label>
        <input value={currency} onChange={e=>setCurrency(e.target.value)} className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Locale</label>
        <input value={locale} onChange={e=>setLocale(e.target.value)} className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Email de contato</label>
        <input value={contactEmail} onChange={e=>setContactEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
      </div>
      <div className="pt-2">
        <button onClick={save} disabled={loading} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded disabled:opacity-60">{loading? 'Salvando...' : 'Salvar'}</button>
      </div>
    </div>
  )
}