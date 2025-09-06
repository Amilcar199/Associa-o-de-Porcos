'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function SettingsClient() {
  const [currency, setCurrency] = useState('AOA')
  const [locale, setLocale] = useState('pt-AO')
  const [contactEmail, setContactEmail] = useState('contato@associacaoporcos.ao')
  const [saving, setSaving] = useState(false)
  const [contactPhone, setContactPhone] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')

  useEffect(()=>{
    const load = async () => {
      try {
        const res = await fetch('/api/admin/config', { cache: 'no-store' })
        if (res.ok) {
          const j = await res.json()
          const c = j?.data || {}
          if (c.currency) setCurrency(c.currency)
          if (c.locale) setLocale(c.locale)
          if (c.contactEmail) setContactEmail(c.contactEmail)
          if (c.contactPhone) setContactPhone(c.contactPhone)
          if (c.whatsappNumber) setWhatsappNumber(c.whatsappNumber)
          if (c.facebookUrl) setFacebookUrl(c.facebookUrl)
          if (c.instagramUrl) setInstagramUrl(c.instagramUrl)
          if (c.linkedinUrl) setLinkedinUrl(c.linkedinUrl)
          if (c.youtubeUrl) setYoutubeUrl(c.youtubeUrl)
          if (c.twitterUrl) setTwitterUrl(c.twitterUrl)
          if (c.tiktokUrl) setTiktokUrl(c.tiktokUrl)
        }
      } catch {}
    }
    load()
  },[])

  // Sincroniza moeda ao alterar locale
  useEffect(()=>{
    const lower = (locale || '').toLowerCase()
    if (lower.startsWith('en')) setCurrency('USD')
    else if (lower.startsWith('pt')) setCurrency('AOA')
  }, [locale])

  const save = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/config', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ currency, locale, contactEmail, contactPhone, whatsappNumber, facebookUrl, instagramUrl, linkedinUrl, youtubeUrl, twitterUrl, tiktokUrl }) })
      if (!res.ok) {
        try { const j = await res.json(); toast.error(j?.error || 'Falha ao salvar configurações') } catch { toast.error('Falha ao salvar configurações') }
        return
      }
      toast.success('Configurações salvas com sucesso')
    } catch {
      toast.error('Erro de rede ao salvar')
    } finally { setSaving(false) }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Preferências gerais</h2>
          <p className="text-sm text-gray-500">Defina padrões de idioma, moeda e contato</p>
        </div>
        <Link href="/admin/imagens?tab=logos" className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
          Gerenciar Logos
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Moeda padrão</label>
          <input value={currency} onChange={e=>setCurrency(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="AOA" />
          <p className="text-xs text-gray-500 mt-1">Ex.: AOA, USD, EUR</p>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Locale</label>
          <input value={locale} onChange={e=>setLocale(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="pt-AO" />
          <p className="text-xs text-gray-500 mt-1">Ex.: pt-AO, en-US</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-1">Email de contato</label>
          <input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="contato@exemplo.com" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Telefone</label>
          <input value={contactPhone} onChange={e=>setContactPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="+244 9xx xxx xxx" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">WhatsApp (apenas números com DDI)</label>
          <input value={whatsappNumber} onChange={e=>setWhatsappNumber(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="2449xxxxxxxx" />
          <p className="text-xs text-gray-500 mt-1">Ex.: 244928476427</p>
        </div>
        <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Facebook URL</label>
            <input type="url" value={facebookUrl} onChange={e=>setFacebookUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://facebook.com/sua-pagina" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Instagram URL</label>
            <input type="url" value={instagramUrl} onChange={e=>setInstagramUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://instagram.com/sua-pagina" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">LinkedIn URL</label>
            <input type="url" value={linkedinUrl} onChange={e=>setLinkedinUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://linkedin.com/company/sua-pagina" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">YouTube URL</label>
            <input type="url" value={youtubeUrl} onChange={e=>setYoutubeUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://youtube.com/@seu-canal" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Twitter/X URL</label>
            <input type="url" value={twitterUrl} onChange={e=>setTwitterUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://twitter.com/sua-conta" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">TikTok URL</label>
            <input type="url" value={tiktokUrl} onChange={e=>setTiktokUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://tiktok.com/@sua-conta" />
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-60">
          {saving? 'Salvando...' : 'Salvar alterações'}
        </button>
        <span className="text-xs text-gray-500">As logos são gerenciadas em Mídia &rarr; Logos</span>
      </div>
    </div>
  )
}