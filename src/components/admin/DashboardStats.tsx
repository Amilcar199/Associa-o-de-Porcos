'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  ShoppingCart,
  Newspaper,
  MessageSquare,
  TrendingUp
} from 'lucide-react'
import { useAdminStats } from './useAdminStats'

const DashboardStats = () => {
  const { stats, loading } = useAdminStats()

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: stats?.overview.totalUsers || 0,
      change: stats?.overview.usersThisMonth || 0,
      changeText: 'novos este mês',
      icon: Users,
      color: 'blue',
      href: '/admin/usuarios'
    },
    {
      title: 'Produtos Ativos',
      value: stats?.overview.activeProducts || 0,
      change: stats?.overview.productsThisMonth || 0,
      changeText: 'novos este mês',
      icon: ShoppingCart,
      color: 'green',
      href: '/admin/produtos'
    },
    {
      title: 'Notícias Publicadas',
      value: stats?.overview.publishedNews || 0,
      change: stats?.overview.newsThisMonth || 0,
      changeText: 'novas este mês',
      icon: Newspaper,
      color: 'purple',
      href: '/admin/noticias'
    },
    {
      title: 'Contatos Recebidos',
      value: stats?.overview.totalContacts || 0,
      change: stats?.overview.newContactsThisMonth || 0,
      changeText: 'novos este mês',
      icon: MessageSquare,
      color: 'orange',
      href: '/admin/contatos'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' }
      case 'green':
        return { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600' }
      case 'purple':
        return { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' }
      case 'orange':
        return { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' }
      default:
        return { bg: 'bg-gray-500', light: 'bg-gray-50', text: 'text-gray-600' }
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
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
          >
            <Link
              href={card.href}
              className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-11 h-11 ${colors.light} rounded-xl flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString('pt-AO')}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-sm">
                <TrendingUp className={`w-4 h-4 mr-1 ${card.change > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`font-medium ${card.change > 0 ? 'text-green-600' : 'text-gray-500'}`}>{card.change}</span>
                <span className="text-gray-500 ml-1">{card.changeText}</span>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}

export default DashboardStats
