'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar,
  User,
  CheckCircle,
  Circle,
  Archive,
  Reply,
  Trash
} from 'lucide-react'
import DataTable, { Column } from './ui/DataTable'
import Modal from './ui/Modal'
import ConfirmDialog from './ui/ConfirmDialog'
import { Contact } from '@/types'
import toast from 'react-hot-toast'

const ContactsManager = () => {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const fetchContacts = async (page = 1, search = '', status = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(status && { status })
      })

      const response = await fetch(`/api/admin/contacts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setContacts(data.data)
        setPagination(data.pagination)
      } else {
        toast.error('Erro ao carregar contatos')
      }
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
      toast.error('Erro ao carregar contatos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    fetchContacts(page, '', statusFilter)
  }

  const handleSearch = (search: string) => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchContacts(1, search, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchContacts(1, '', status)
  }

  const handleView = async (contact: Contact) => {
    setSelectedContact(contact)
    setShowViewModal(true)

    // Marcar como lido se ainda não foi
    if (contact.status === 'new') {
      await updateContactStatus(contact._id, 'read')
    }
  }

  const handleDelete = (contact: Contact) => {
    setSelectedContact(contact)
    setShowDeleteDialog(true)
  }

  const updateContactStatus = async (contactId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setContacts(prev =>
          prev.map(contact =>
            contact._id === contactId ? { ...contact, status } : contact
          )
        )
        toast.success('Status atualizado')
      } else {
        toast.error('Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const confirmDelete = async () => {
    if (!selectedContact) return

    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/admin/contacts/${selectedContact._id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Contato removido com sucesso')
        setShowDeleteDialog(false)
        setSelectedContact(null)
        fetchContacts(pagination.page, '', statusFilter)
      } else {
        toast.error('Erro ao remover contato')
      }
    } catch (error) {
      console.error('Erro ao deletar contato:', error)
      toast.error('Erro ao remover contato')
    } finally {
      setDeleteLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'Novo', color: 'bg-blue-100 text-blue-800', icon: Circle },
      read: { label: 'Lido', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      replied: { label: 'Respondido', color: 'bg-green-100 text-green-800', icon: Reply },
      archived: { label: 'Arquivado', color: 'bg-yellow-100 text-yellow-800', icon: Archive }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new
    const IconComponent = config.icon

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        <IconComponent size={12} />
        <span>{config.label}</span>
      </span>
    )
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return 'Há poucos minutos'
    if (diffInMinutes < 1440) return `Há ${Math.floor(diffInMinutes / 60)} horas`
    if (diffInMinutes < 10080) return `Há ${Math.floor(diffInMinutes / 1440)} dias`
    
    return new Date(date).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const columns: Column[] = [
    {
      key: 'name',
      title: 'Contato',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 flex items-center space-x-1">
              <Mail size={12} />
              <span>{row.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      title: 'Assunto',
      sortable: true,
      render: (value, row) => (
        <button
          type="button"
          onClick={() => handleView(row as Contact)}
          className="max-w-xs text-left hover:underline"
          title="Abrir mensagem"
        >
          <div className="font-medium text-gray-900 truncate">{value}</div>
        </button>
      )
    },
    {
      key: 'phone',
      title: 'Telefone',
      render: (value) => value ? (
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Phone size={14} />
          <span>{value}</span>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">-</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'createdAt',
      title: 'Recebido em',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-600">
          <div>{formatDate(value)}</div>
          <div className="text-xs text-gray-400">
            {new Date(value).toLocaleDateString('pt-AO')}
          </div>
        </div>
      )
    }
  ]

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'new', label: 'Novos' },
    { value: 'read', label: 'Lidos' },
    { value: 'replied', label: 'Respondidos' },
    { value: 'archived', label: 'Arquivados' }
  ]

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {pagination.total} contato{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={contacts}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onView={handleView}
        onDelete={handleDelete}
        searchPlaceholder="Buscar por nome, email ou assunto..."
        emptyMessage="Nenhum contato encontrado"
      />

      {/* View Modal */}
      {selectedContact && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Detalhes do Contato"
          size="lg"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedContact.name}
                </h3>
                <p className="text-gray-600 mt-1">{selectedContact.email}</p>
                {selectedContact.phone && (
                  <p className="text-gray-600 flex items-center space-x-1 mt-1">
                    <Phone size={14} />
                    <span>{selectedContact.phone}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                {getStatusBadge(selectedContact.status)}
                <div className="text-xs text-gray-500 text-right">
                  {new Date(selectedContact.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Assunto</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {selectedContact.subject}
              </p>
            </div>

            {/* Message */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Mensagem</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Alterar status:</span>
                <select
                  value={selectedContact.status}
                  onChange={(e) => updateContactStatus(selectedContact._id, e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="new">Novo</option>
                  <option value="read">Lido</option>
                  <option value="replied">Respondido</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Reply size={16} />
                  <span>Responder</span>
                </a>
                
                {selectedContact.phone && (
                  <a
                    href={`https://wa.me/244${selectedContact.phone.replace(/\D/g, '')}?text=Olá ${selectedContact.name}, vi sua mensagem sobre \"${selectedContact.subject}\"`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Phone size={16} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Remover Contato"
        message={`Tem certeza que deseja remover o contato de "${selectedContact?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        loading={deleteLoading}
        type="danger"
      />
    </div>
  )
}

export default ContactsManager
