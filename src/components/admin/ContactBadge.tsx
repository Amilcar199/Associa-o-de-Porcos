'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, AlertCircle, CheckCircle, Archive } from 'lucide-react'

interface ContactStats {
  _id: string
  count: number
}

interface ContactBadgeProps {
  className?: string
}

export default function ContactBadge({ className = '' }: ContactBadgeProps) {
  const [contactStats, setContactStats] = useState<ContactStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContactStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          const contacts = data.data?.contacts || []
          setContactStats(contacts)
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas de contatos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContactStats()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchContactStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-full w-6 h-6 ${className}`} />
    )
  }

  // Calcular totais por status
  const newCount = contactStats.find(s => s._id === 'new')?.count || 0
  const readCount = contactStats.find(s => s._id === 'read')?.count || 0
  const repliedCount = contactStats.find(s => s._id === 'replied')?.count || 0
  const archivedCount = contactStats.find(s => s._id === 'archived')?.count || 0
  
  // Total de contatos ativos (não arquivados)
  const activeCount = newCount + readCount + repliedCount
  
  // Determinar cor e ícone baseado no status
  const getBadgeStyle = () => {
    if (newCount > 0) {
      // Contatos novos - vermelho (urgente)
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        icon: AlertCircle,
        priority: 'high'
      }
    } else if (readCount > 0) {
      // Contatos lidos mas não respondidos - amarelo (atenção)
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
        icon: MessageSquare,
        priority: 'medium'
      }
    } else if (repliedCount > 0) {
      // Contatos respondidos - verde (resolvido)
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        icon: CheckCircle,
        priority: 'low'
      }
    } else if (archivedCount > 0) {
      // Apenas contatos arquivados - cinza (inativo)
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-200',
        icon: Archive,
        priority: 'none'
      }
    } else {
      // Sem contatos - transparente
      return {
        bgColor: 'bg-transparent',
        textColor: 'text-transparent',
        borderColor: 'border-transparent',
        icon: MessageSquare,
        priority: 'none'
      }
    }
  }

  const badgeStyle = getBadgeStyle()
  const IconComponent = badgeStyle.icon

  // Se não há contatos ativos, não mostrar badge
  if (activeCount === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* Badge principal */}
      <span className={`
        inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border
        ${badgeStyle.bgColor} ${badgeStyle.textColor} ${badgeStyle.borderColor}
        transition-all duration-200 hover:scale-105
      `}>
        <IconComponent size={12} />
        {activeCount}
      </span>

      {/* Indicador de prioridade */}
      {badgeStyle.priority === 'high' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
      
      {/* Tooltip com detalhes */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        <div className="flex flex-col gap-1">
          {newCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle size={12} className="text-red-400" />
              <span>{newCount} novo{newCount > 1 ? 's' : ''}</span>
            </div>
          )}
          {readCount > 0 && (
            <div className="flex items-center gap-2">
              <MessageSquare size={12} className="text-yellow-400" />
              <span>{readCount} lido{readCount > 1 ? 's' : ''}</span>
            </div>
          )}
          {repliedCount > 0 && (
            <div className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-400" />
              <span>{repliedCount} respondido{repliedCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  )
}