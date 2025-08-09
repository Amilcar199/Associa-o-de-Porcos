'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  User,
  ShoppingCart,
  Newspaper,
  MessageSquare,
  Plus,
  Edit,
  Trash,
  Eye
} from 'lucide-react'

interface ActivityItem {
  type: 'user' | 'product' | 'news' | 'contact'
  action: string
  date: Date
  user?: string
  details: string
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.data.recentActivity)
      }
    } catch (error) {
      console.error('Erro ao buscar atividade recente:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const getActivityIcon = (type: string, action: string) => {
    if (action.includes('cadastrado') || action.includes('criado')) {
      return <Plus className="w-4 h-4 text-green-500" />
    }
    if (action.includes('atualizado') || action.includes('editado')) {
      return <Edit className="w-4 h-4 text-blue-500" />
    }
    if (action.includes('removido') || action.includes('deletado')) {
      return <Trash className="w-4 h-4 text-red-500" />
    }

    switch (type) {
      case 'user':
        return <User className="w-4 h-4 text-blue-500" />
      case 'product':
        return <ShoppingCart className="w-4 h-4 text-green-500" />
      case 'news':
        return <Newspaper className="w-4 h-4 text-purple-500" />
      case 'contact':
        return <MessageSquare className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'border-blue-200 bg-blue-50'
      case 'product':
        return 'border-green-200 bg-green-50'
      case 'news':
        return 'border-purple-200 bg-purple-50'
      case 'contact':
        return 'border-orange-200 bg-orange-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'agora'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary-600" />
          Atividade Recente
        </h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ver tudo
        </button>
      </div>

      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => (
            <li key={index}>
              <div className="relative pb-8">
                {index !== activities.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type, activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {activity.user || 'Sistema'}
                        </span>
                        <span className="text-gray-500 ml-1">
                          {activity.action.toLowerCase()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 truncate">
                        {activity.details}
                      </p>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {formatTimeAgo(activity.date)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            Nenhuma atividade recente
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default RecentActivity
