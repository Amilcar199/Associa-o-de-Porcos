'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash,
  Eye
} from 'lucide-react'

export interface Column {
  key: string
  title: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  width?: string
}

export interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  onPageChange?: (page: number) => void
  onSearch?: (search: string) => void
  onSort?: (key: string, order: 'asc' | 'desc') => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onView?: (row: any) => void
  searchPlaceholder?: string
  emptyMessage?: string
}

const DataTable = ({
  columns,
  data,
  loading = false,
  pagination,
  onPageChange,
  onSearch,
  onSort,
  onEdit,
  onDelete,
  onView,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum registro encontrado'
}: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onSearch?.(value)
  }

  const handleSort = (key: string) => {
    const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortOrder(newOrder)
    onSort?.(key, newOrder)
  }

  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null

    const pages = []
    const { page, pages: totalPages } = pagination

    // Primeira página
    if (page > 3) {
      pages.push(1)
      if (page > 4) pages.push('...')
    }

    // Páginas ao redor da atual
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      pages.push(i)
    }

    // Última página
    if (page < totalPages - 2) {
      if (page < totalPages - 3) pages.push('...')
      pages.push(totalPages)
    }

    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          Mostrando {Math.min((page - 1) * pagination.limit + 1, pagination.total)} a{' '}
          {Math.min(page * pagination.limit, pagination.total)} de {pagination.total} resultados
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page === 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          
          {pages.map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' && onPageChange?.(pageNum)}
              disabled={pageNum === '...'}
              className={`px-3 py-1 text-sm rounded-md ${
                pageNum === page
                  ? 'bg-primary-600 text-white'
                  : pageNum === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page === totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header com busca */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.width || ''
                  }`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>{column.title}</span>
                      {sortKey === column.key && (
                        <span className="text-primary-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              [...Array(5)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 w-8 bg-gray-200 rounded ml-auto"></div>
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Estado vazio
              <tr>
                <td
                  colSpan={columns.length + ((onEdit || onDelete || onView) ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Dados
              data.map((row, index) => (
                <motion.tr
                  key={row._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === row._id ? null : row._id)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {openDropdown === row._id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                            {onView && (
                              <button
                                onClick={() => {
                                  onView(row)
                                  setOpenDropdown(null)
                                }}
                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye size={14} />
                                <span>Ver</span>
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => {
                                  onEdit(row)
                                  setOpenDropdown(null)
                                }}
                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit size={14} />
                                <span>Editar</span>
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => {
                                  onDelete(row)
                                  setOpenDropdown(null)
                                }}
                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash size={14} />
                                <span>Excluir</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {renderPagination()}
    </div>
  )
}

export default DataTable
