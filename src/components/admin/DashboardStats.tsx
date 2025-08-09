'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  ShoppingCart,
  Newspaper,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Eye,
  Calendar
} from 'lucide-react'

interface StatsData {
  overview: {
    totalUsers: number
    totalProducts: number
    totalNews: number
    totalContacts: number
    newContactsThisMonth: number
    usersThisMonth: number
    productsThisMonth: number
    newsThisMonth: number
    activeProducts: number
    publishedNews: number
  }
}

const DashboardStats = () => {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: stats?.overview.totalUsers || 0,
      change: stats?.overview.usersThisMonth || 0,
      changeText: 'novos este mês',
      icon: Users,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Produtos Ativos',
      value: stats?.overview.activeProducts || 0,
      change: stats?.overview.productsThisMonth || 0,
      changeText: 'novos este mês',
      icon: ShoppingCart,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Notícias Publicadas',
      value: stats?.overview.publishedNews || 0,
      change: stats?.overview.newsThisMonth || 0,
      changeText: 'novas este mês',
      icon: Newspaper,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'Contatos Recebidos',
      value: stats?.overview.totalContacts || 0,
      change: stats?.overview.newContactsThisMonth || 0,
      changeText: 'novos este mês',
      icon: MessageSquare,
      color: 'orange',
      trend: 'up'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500',
          light: 'bg-blue-50',
          text: 'text-blue-600'
        }
      case 'green':
        return {
          bg: 'bg-green-500',
          light: 'bg-green-50',
          text: 'text-green-600'
        }
      case 'purple':
        return {
          bg: 'bg-purple-500',
          light: 'bg-purple-50',
          text: 'text-purple-600'
        }
      case 'orange':
        return {
          bg: 'bg-orange-500',
          light: 'bg-orange-50',
          text: 'text-orange-600'
        }
      default:
        return {
          bg: 'bg-gray-500',
          light: 'bg-gray-50',
          text: 'text-gray-600'
        }
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card, index) => {
        const colors = getColorClasses(card.color)
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${colors.bg} rounded flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.title}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {card.value.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center text-sm">
                {card.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`font-medium ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change}
                </span>
                <span className="text-gray-500 ml-1">
                  {card.changeText}
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default DashboardStats
