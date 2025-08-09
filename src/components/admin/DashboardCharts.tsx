'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, PieChart, TrendingUp } from 'lucide-react'

interface ChartData {
  productsByBreed: Array<{ name: string; value: number }>
  newsByCategory: Array<{ name: string; value: number }>
  topNews: Array<{ title: string; views: number; publishedAt: Date }>
}

const DashboardCharts = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchChartData = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setChartData(data.data.charts)
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos gráficos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const getBreedColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-gray-500'
    ]
    return colors[index % colors.length]
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Notícias': return 'bg-blue-500'
      case 'Eventos': return 'bg-green-500'
      case 'Dicas': return 'bg-yellow-500'
      case 'Mercado': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Produtos por Raça */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
            Produtos por Raça
          </h3>
        </div>

        <div className="space-y-4">
          {chartData?.productsByBreed.map((item, index) => {
            const maxValue = Math.max(...(chartData?.productsByBreed.map(p => p.value) || [1]))
            const percentage = (item.value / maxValue) * 100

            return (
              <div key={item.name} className="flex items-center">
                <div className="w-20 text-sm text-gray-600 flex-shrink-0">
                  {item.name}
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-3 rounded-full ${getBreedColor(index)}`}
                    />
                  </div>
                </div>
                <div className="w-8 text-sm font-medium text-gray-900 text-right">
                  {item.value}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Notícias por Categoria */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-primary-600" />
            Notícias por Categoria
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {chartData?.newsByCategory.map((item, index) => (
            <div key={item.name} className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${getCategoryColor(item.name)}`} />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">
                  {item.value} artigos
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Notícias */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
            Notícias Mais Visualizadas
          </h3>
        </div>

        <div className="space-y-4">
          {chartData?.topNews.map((news, index) => (
            <div key={index} className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {news.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(news.publishedAt).toLocaleDateString('pt-AO')}
                </p>
              </div>
              <div className="ml-4 text-right">
                <div className="text-sm font-semibold text-primary-600">
                  {news.views.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  visualizações
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardCharts
