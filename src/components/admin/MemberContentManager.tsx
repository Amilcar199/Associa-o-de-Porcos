'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Star,
  FileText,
  Video,
  BookOpen,
  Calendar,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'

interface MemberContent {
  _id: string
  title: string
  description: string
  type: 'document' | 'video' | 'article' | 'event'
  category: string
  url?: string
  thumbnail?: string
  isFeatured: boolean
  isActive: boolean
  views: number
  downloads: number
  author: { name: string; email: string }
  createdAt: string
}

export default function MemberContentManager() {
  const [content, setContent] = useState<MemberContent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })
  const [contentToDelete, setContentToDelete] = useState<MemberContent | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchContent()
  }, [pagination.page, searchTerm, filterType, filterCategory, filterStatus])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '10'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterType) params.append('type', filterType)
      if (filterCategory) params.append('category', filterCategory)
      if (filterStatus) params.append('status', filterStatus)

      const response = await fetch(`/api/admin/member-content?${params}`)
      if (response.ok) {
        const data = await response.json()
        setContent(data.data.content || [])
        setPagination(prev => ({
          ...prev,
          totalPages: data.data.pagination.totalPages,
          hasNext: data.data.pagination.hasNext,
          hasPrev: data.data.pagination.hasPrev
        }))
      } else {
        showError('Erro ao carregar conteúdo')
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error)
      showError('Erro ao carregar conteúdo')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!contentToDelete) return

    try {
      const response = await fetch(`/api/admin/member-content/${contentToDelete._id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setContent(prev => prev.filter(c => c._id !== contentToDelete._id))
        showSuccess('Conteúdo excluído com sucesso')
      } else {
        showError('Erro ao excluir conteúdo')
      }
    } catch (error) {
      console.error('Erro ao excluir conteúdo:', error)
      showError('Erro ao excluir conteúdo')
    } finally {
      setContentToDelete(null)
      setDeleteModalOpen(false)
    }
  }

  const toggleFeatured = async (contentId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/member-content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentStatus })
      })

      if (response.ok) {
        setContent(prev => prev.map(c => 
          c._id === contentId ? { ...c, isFeatured: !currentStatus } : c
        ))
        showSuccess(`Conteúdo ${!currentStatus ? 'destacado' : 'removido dos destaques'} com sucesso`)
      } else {
        showError('Erro ao atualizar destaque')
      }
    } catch (error) {
      console.error('Erro ao atualizar destaque:', error)
      showError('Erro ao atualizar destaque')
    }
  }

  const toggleStatus = async (contentId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/member-content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        setContent(prev => prev.map(c => 
          c._id === contentId ? { ...c, isActive: !currentStatus } : c
        ))
        showSuccess(`Conteúdo ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`)
      } else {
        showError('Erro ao alterar status')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      showError('Erro ao alterar status')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'article': return <BookOpen className="w-4 h-4" />
      case 'event': return <Calendar className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-purple-100 text-purple-800'
      case 'article': return 'bg-green-100 text-green-800'
      case 'event': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'document': return 'Documento'
      case 'video': return 'Vídeo'
      case 'article': return 'Artigo'
      case 'event': return 'Evento'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Conteúdo de Membros</h2>
          <p className="text-gray-600">Gerencie o conteúdo exclusivo disponível para membros</p>
        </div>
        
        <Link
          href="/admin/conteudo-membros/novo"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Novo Conteúdo</span>
        </Link>
      </div>

      {/* Filtros e busca */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por título, descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos os tipos</option>
              <option value="document">Documento</option>
              <option value="video">Vídeo</option>
              <option value="article">Artigo</option>
              <option value="event">Evento</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              <option value="Técnico">Técnico</option>
              <option value="Educacional">Educacional</option>
              <option value="Mercado">Mercado</option>
              <option value="Saúde">Saúde</option>
              <option value="Genética">Genética</option>
              <option value="Nutrição">Nutrição</option>
              <option value="Sanidade">Sanidade</option>
              <option value="Reprodução">Reprodução</option>
              <option value="Comercial">Comercial</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de conteúdo */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando conteúdo...</p>
        </div>
      ) : content.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum conteúdo encontrado</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType || filterCategory || filterStatus 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando o primeiro conteúdo exclusivo para membros'
            }
          </p>
          {!searchTerm && !filterType && !filterCategory && !filterStatus && (
            <Link href="/admin/conteudo-membros/novo" className="btn-primary">
              Criar Primeiro Conteúdo
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conteúdo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estatísticas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {content.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {item.thumbnail ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={item.thumbnail}
                              alt={item.title}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              {getTypeIcon(item.type)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {item.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Por {item.author.name} • {new Date(item.createdAt).toLocaleDateString('pt-AO')}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                        <span className="ml-1">{getTypeText(item.type)}</span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>{item.views}</span>
                        </div>
                        {item.type === 'document' && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span>{item.downloads}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        {item.isFeatured && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFeatured(item._id, item.isFeatured)}
                          className={`p-1 rounded transition-colors ${
                            item.isFeatured 
                              ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                              : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                          }`}
                          title={item.isFeatured ? 'Remover dos destaques' : 'Adicionar aos destaques'}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => toggleStatus(item._id, item.isActive)}
                          className={`p-1 rounded transition-colors ${
                            item.isActive 
                              ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                          title={item.isActive ? 'Desativar' : 'Ativar'}
                        >
                          {item.isActive ? (
                            <div className="w-4 h-4 bg-red-600 rounded-full" />
                          ) : (
                            <div className="w-4 h-4 bg-green-600 rounded-full" />
                          )}
                        </button>
                        
                        <Link
                          href={`/admin/conteudo-membros/editar/${item._id}`}
                          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        <button
                          onClick={() => {
                            setContentToDelete(item)
                            setDeleteModalOpen(true)
                          }}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Página <span className="font-medium">{pagination.page}</span> de{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setContentToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o conteúdo "${contentToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}