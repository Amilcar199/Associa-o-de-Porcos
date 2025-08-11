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
  const [news, setNews] = useState<LatestNewsItem[]>([])
  const [loading, setLoading] = useState(false)

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
        return { label: 'Notícias', color: 'bg-blue-100 text-blue-800' }
      case 'market':
        return { label: 'Mercado', color: 'bg-green-100 text-green-800' }
      case 'tips':
        return { label: 'Dicas', color: 'bg-yellow-100 text-yellow-800' }
      case 'events':
        return { label: 'Eventos', color: 'bg-purple-100 text-purple-800' }
      default:
        return { label: 'Geral', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO)
    return new Intl.DateTimeFormat('pt-AO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const calculateReadTime = (excerpt: string) => {
    const words = (excerpt || '').split(' ').length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min de leitura`
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
            Últimas Notícias
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-6">
            Fique por Dentro das
            <span className="text-gradient"> Novidades</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Acompanhe as últimas tendências, inovações e informações importantes 
            do mercado suinícola angolano e mundial.
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
                <Link href={`/noticias/${news[0]?.slug}`} className="group block">
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
                            <span>{news[0]?.views} visualizações</span>
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
                </Link>
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
                  <Link href={`/noticias/${article.slug}`} className="group block">
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
                  </Link>
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
            Explore nosso arquivo completo de notícias e artigos especializados
          </p>
          <Link
            href="/noticias"
            className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Ver Todas as Notícias
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default LatestNews
