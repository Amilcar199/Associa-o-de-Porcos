'use client'

import React from 'react'
import { Search, UserPlus, Mail, Shield, Edit, PowerOff, Power, Trash2 } from 'lucide-react'
// Icons removed to avoid lucide-react export issues
import UserEditModal from '@/components/UserEditModal'
import UserCreateModal from '@/components/UserCreateModal'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/components/Toast'

type AdminUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'member' | 'visitor'
  active: boolean
  company?: string
  bio?: string
  location?: string
  phone?: string
  website?: string
  socialMedia?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
}

export default function AdminUsersPage() {
  const [query, setQuery] = React.useState('')
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [loading, setLoading] = React.useState(false)
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const [userToDelete, setUserToDelete] = React.useState<{ id: string; name: string } | null>(null)
  const { showSuccess, showError } = useToast()

  React.useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const j = await res.json()
        const list = j.data || []
        setUsers(list.map((u: any) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          active: u.isActive,
          company: u.company,
          bio: u.bio,
          location: u.location,
          phone: u.phone,
          website: u.website,
          socialMedia: u.socialMedia
        })))
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return users
    return users.filter(u => 
      `${u.name} ${u.email} ${u.role} ${u.company || ''}`.toLowerCase().includes(q)
    )
  }, [query, users])

  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId)
    setEditModalOpen(true)
  }

  const handleUserUpdated = () => {
    loadUsers() // Recarrega a lista após atualização
  }

  const handleUserCreated = () => {
    loadUsers() // Recarrega a lista após criação
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      })
      
      if (res.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, active: newStatus } : u
        ))
      } else {
        const error = await res.json()
        showError(`Erro ao ${newStatus ? 'ativar' : 'desativar'} usuário: ${error.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
      showError('Erro ao alterar status do usuário')
    }
  }

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName })
    setDeleteModalOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id))
        showSuccess('Usuário excluído com sucesso')
      } else {
        const error = await res.json()
        showError(`Erro ao excluir usuário: ${error.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      showError('Erro ao excluir usuário')
    }
  }

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      'admin': { label: 'Administrador', color: 'bg-red-100 text-red-800', icon: '👑' },
      'member': { label: 'Membro', color: 'bg-blue-100 text-blue-800', icon: '👤' },
      'visitor': { label: 'Visitante', color: 'bg-gray-100 text-gray-800', icon: '👁️' }
    }
    
    const roleInfo = roleMap[role as keyof typeof roleMap] || roleMap.visitor
    return roleInfo
  }

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
          <button 
            onClick={() => setCreateModalOpen(true)} 
            className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm"
          >
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
              <th className="text-left font-medium px-4 py-3">Papel/Role</th>
              <th className="text-left font-medium px-4 py-3">Empresa</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const roleInfo = getRoleDisplay(u.role)
              return (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{u.name}</div>
                      {u.location && (
                        <div className="text-xs text-gray-500">{u.location}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> 
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{roleInfo.icon}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {u.company ? (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        {u.company}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Não informado</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button 
                        onClick={() => handleEditUser(u.id)}
                        className="inline-flex items-center gap-1 text-primary-700 hover:text-primary-800 hover:bg-primary-50 px-2 py-1 rounded transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        Editar
                      </button>
                      <span className="text-gray-300">|</span>
                      <button 
                        onClick={() => handleToggleUserStatus(u.id, u.active)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                          u.active 
                            ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {u.active ? (
                          <>
                            <PowerOff className="w-3 h-3" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Power className="w-3 h-3" />
                            Ativar
                          </>
                        )}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  {loading ? 'Carregando...' : 'Nenhum usuário encontrado'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição */}
      <UserEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedUserId(null)
        }}
        userId={selectedUserId}
        onUserUpdated={handleUserUpdated}
      />

      {/* Modal de Criação */}
      <UserCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setUserToDelete(null)
        }}
        onConfirm={confirmDeleteUser}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o usuário "${userToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}