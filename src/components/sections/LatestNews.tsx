'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Calendar,
  Eye,
  Clock
} from 'lucide-react'
import NewsModal from '@/components/modals/NewsModal'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface LatestNewsItem {
  _id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: string
  author?: { name?: string; avatar?: string }
  category: 'news' | 'events' | 'tips' | 'market'
  publishedAt: string
  views?: number
  tags?: string[]
}

const LatestNews = () => {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const [news, setNews] = useState<LatestNewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedNews, setSelectedNews] = useState<LatestNewsItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchLatestNews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/news/latest?limit=4', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao buscar notícias')
      const json = await res.json()
      setNews(json.data || [])
    } catch (error) {
      console.error('Erro ao buscar notícias:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLatestNews()
  }, [])

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'news':
        return { label: isEn ? 'News' : 'Notícias', color: 'bg-blue-100 text-blue-800' }
      case 'market':
        return { label: isEn ? 'Market' : 'Mercado', color: 'bg-green-100 text-green-800' }
      case 'tips':
        return { label: isEn ? 'Tips' : 'Dicas', color: 'bg-yellow-100 text-yellow-800' }
      case 'events':
        return { label: isEn ? 'Events' : 'Eventos', color: 'bg-purple-100 text-purple-800' }
      default:
        return { label: isEn ? 'General' : 'Geral', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO)
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'pt-AO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const calculateReadTime = (excerpt: string) => {
    const words = (excerpt || '').split(' ').length
    const minutes = Math.ceil(words / 200)
    return isEn ? `${minutes} min read` : `${minutes} min de leitura`
  }

  const openNewsModal = (newsItem: LatestNewsItem) => {
    setSelectedNews(newsItem)
    setModalOpen(true)
  }

  const closeNewsModal = () => {
    setModalOpen(false)
    setSelectedNews(null)
  }

  const goToPreviousNews = () => {
    if (!selectedNews) return
    const currentIndex = news.findIndex(n => n._id === selectedNews._id)
    if (currentIndex > 0) {
      setSelectedNews(news[currentIndex - 1])
    }
  }

  const goToNextNews = () => {
    if (!selectedNews) return
    const currentIndex = news.findIndex(n => n._id === selectedNews._id)
    if (currentIndex < news.length - 1) {
      setSelectedNews(news[currentIndex + 1])
    }
  }

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            {isEn ? 'Latest News' : 'Últimas Notícias'}
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-6">
            {isEn ? 'Stay On Top of' : 'Fique Por Dentro das'}
            <span className="text-gradient"> {isEn ? 'Updates' : 'Novidades'}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {isEn
              ? 'Follow the latest trends, innovations, and key information from the Angolan and global pig market.'
              : 'Acompanhe as últimas tendências, inovações e informações importantes do mercado suinícola angolano e mundial.'}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <div className="card-body space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {news[0] && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="lg:row-span-2"
              >
                <div 
                  onClick={() => openNewsModal(news[0])}
                  className="group block cursor-pointer"
                >
                  <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                    <div className="relative h-64 lg:h-80 overflow-hidden">
                      <Image
                        src={news[0]?.featuredImage || ''}
                        alt={news[0]?.title || ''}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryInfo(news[0].category).color}`}>
                          {getCategoryInfo(news[0].category).label}
                        </span>
                      </div>
                    </div>

                    <div className="card-body">
                      <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight">
                        {news[0]?.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {news[0]?.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        {news[0]?.author?.name && (
                          <span>{news[0].author.name}</span>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{formatDate(news[0].publishedAt)}</span>
                        </div>
                        {news[0]?.views != null && (
                          <div className="flex items-center space-x-1">
                            <Eye size={14} />
                            <span>{news[0]?.views} {isEn ? 'views' : 'visualizações'}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(news[0]?.tags || []).slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-6">
              {news.slice(1, 4).map((article, index) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div 
                    onClick={() => openNewsModal(article)}
                    className="group block cursor-pointer"
                  >
                    <div className="card overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex">
                        <div className="relative w-32 h-24 lg:w-40 lg:h-28 flex-shrink-0 overflow-hidden">
                          <Image
                            src={article.featuredImage}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryInfo(article.category).color}`}>
                              {getCategoryInfo(article.category).label}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors leading-tight line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar size={12} />
                              <span>{formatDate(article.publishedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{calculateReadTime(article.excerpt)}</span>
                            </div>
                          </div>
                        </div>
                                              </div>
                      </div>
                    </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-600 mb-6">
            {isEn ? 'Explore our full archive of news and expert articles' : 'Explore nosso arquivo completo de notícias e artigos especializados'}
          </p>
          <Link
            href="/noticias"
            className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {isEn ? 'See All News' : 'Ver Todas as Notícias'}
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </motion.div>
      </div>

      {/* Modal de Notícia */}
      <NewsModal
        isOpen={modalOpen}
        onClose={closeNewsModal}
        news={selectedNews}
        onPrevious={goToPreviousNews}
        onNext={goToNextNews}
        hasPrevious={selectedNews ? news.findIndex(n => n._id === selectedNews._id) > 0 : false}
        hasNext={selectedNews ? news.findIndex(n => n._id === selectedNews._id) < news.length - 1 : false}
      />
    </section>
  )
}

export default LatestNews
