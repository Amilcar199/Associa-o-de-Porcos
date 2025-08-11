import { Metadata } from 'next'
'use client'
import { useState } from 'react'

export const metadata: Metadata = {
  title: 'Configurações - Painel Administrativo',
  description: 'Preferências e configurações'
}

export default function AdminSettingsPage() {
  const [currency, setCurrency] = useState('AOA')
  const [locale, setLocale] = useState('pt-AO')
  const [contactEmail, setContactEmail] = useState('contato@associacaoporcos.ao')

  const save = () => {
    alert('Configurações salvas (placeholders). Integração de persistência pendente.')
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Ajuste preferências da plataforma</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
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
          <button onClick={save} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">Salvar</button>
        </div>
      </div>
    </div>
  )
}