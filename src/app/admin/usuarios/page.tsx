'use client'

import { useMemo, useState, useEffect } from 'react'
import { Search, UserPlus, Shield, Mail } from 'lucide-react'

type AdminUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  active: boolean
}

const initialUsers: AdminUser[] = [
  { id: '1', name: 'Admin Demo', email: 'admin@demo.local', role: 'admin', active: true },
  { id: '2', name: 'Membro Exemplo', email: 'membro@example.com', role: 'member', active: true },
  { id: '3', name: 'Usuário Inativo', email: 'inativo@example.com', role: 'member', active: false }
]

export default function AdminUsersPage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        // Caso não exista endpoint dedicado, podemos usar stats ou criar posteriormente /api/admin/users
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const j = await res.json()
          // Não há lista direta de usuários, usar placeholder inicial
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return users
    return users.filter(u => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q))
  }, [query, users])

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-1">Gerencie permissões e perfis de usuários</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Buscar usuário..."
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button onClick={()=>{ window.location.href='/registro' }} className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm">
            <UserPlus className="w-4 h-4 mr-2" /> Novo usuário
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left font-medium px-4 py-3">Nome</th>
              <th className="text-left font-medium px-4 py-3">Email</th>
              <th className="text-left font-medium px-4 py-3">Papel</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-700 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {u.email}</td>
                <td className="px-4 py-3 text-gray-700 flex items-center gap-2"><Shield className="w-4 h-4 text-gray-400" /> {u.role === 'admin' ? 'Administrador' : 'Membro'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button onClick={()=>alert('Funcionalidade de edição em desenvolvimento.')} className="text-primary-700 hover:text-primary-800">Editar</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={()=>alert('Funcionalidade de desativação em desenvolvimento.')} className="text-red-600 hover:text-red-700">Desativar</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">{loading ? 'Carregando...' : 'Nenhum usuário encontrado'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}