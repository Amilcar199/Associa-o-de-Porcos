'use client'

import { useEffect, useState } from 'react'
import { Check, X, Mail } from 'lucide-react'

type RequestItem = {
  _id: string
  user: { _id: string; name: string; email: string; company?: string; bio?: string }
  createdAt: string
}

export default function AdminRequestsPage() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<RequestItem[]>([])

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/requests')
      if (res.ok) {
        const j = await res.json()
        setItems((j.data?.results || []) as RequestItem[])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const takeAction = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    if (res.ok) {
      setItems(prev => prev.filter(x => x._id !== id))
    } else {
      const j = await res.json().catch(() => ({}))
      alert(j.error || 'Erro ao processar solicitação')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitações de Associação</h1>
          <p className="text-gray-600">Aprove ou rejeite pedidos para virar Membro</p>
        </div>
        <button onClick={load} className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50">Recarregar</button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left font-medium px-4 py-3">Usuário</th>
              <th className="text-left font-medium px-4 py-3">Empresa</th>
              <th className="text-left font-medium px-4 py-3">Bio</th>
              <th className="text-left font-medium px-4 py-3">Data</th>
              <th className="text-right font-medium px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(req => (
              <tr key={req._id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <div className="text-gray-900 font-medium">{req.user?.name}</div>
                  <div className="text-gray-500 text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> {req.user?.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">{req.user?.company || '-'}</td>
                <td className="px-4 py-3 text-gray-700 max-w-md truncate" title={req.user?.bio || ''}>{req.user?.bio || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{new Date(req.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button onClick={() => takeAction(req._id, 'approve')} className="inline-flex items-center gap-1 text-green-600 hover:bg-green-50 px-2 py-1 rounded"><Check className="w-4 h-4" /> Aprovar</button>
                    <button onClick={() => takeAction(req._id, 'reject')} className="inline-flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded"><X className="w-4 h-4" /> Rejeitar</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">{loading ? 'Carregando...' : 'Nenhuma solicitação pendente'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

