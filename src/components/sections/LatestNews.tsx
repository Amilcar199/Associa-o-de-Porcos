'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Calendar,
  User,
  Eye,
  Tag,
  Clock
} from 'lucide-react'

// Mock data - será substituído pela API real
const mockNews = [
  {
    id: '1',
    title: 'Nova Tecnologia Revoluciona a Criação de Suínos em Angola',
    slug: 'nova-tecnologia-criacao-suinos',
    excerpt: 'Sistema de monitoramento inteligente promete aumentar a produtividade e o bem-estar animal nas granjas angolanas.',
    content: '',
    featuredImage: '/news/tech-news.jpg',
    author: {
      name: 'Dr. João Silva',
      avatar: '/authors/joao-silva.jpg'
    },
    category: 'news',
    publishedAt: new Date('2024-01-15'),
    views: 1250,
    tags: ['tecnologia', 'inovação', 'bem-estar animal']
  },
  {
    id: '2',
    title: 'Mercado de Suínos Apresenta Crescimento de 15% no Último Trimestre',
    slug: 'mercado-suinos-crescimento-trimestre',
    excerpt: 'Dados do setor mostram otimismo para o agronegócio suinícola angolano com aumento significativo na demanda.',
    content: '',
    featuredImage: '/news/market-growth.jpg',
    author: {
      name: 'Maria Santos',
      avatar: '/authors/maria-santos.jpg'
    },
    category: 'market',
    publishedAt: new Date('2024-01-12'),
    views: 980,
    tags: ['mercado', 'economia', 'crescimento']
  },
  {
    id: '3',
    title: 'Dicas Essenciais para Manejo de Leitões no Inverno',
    slug: 'dicas-manejo-leitoes-inverno',
    excerpt: 'Especialistas compartilham técnicas importantes para manter a saúde e produtividade dos leitões durante o período mais frio.',
    content: '',
    featuredImage: '/news/winter-care.jpg',
    author: {
      name: 'Carlos Oliveira',
      avatar: '/authors/carlos-oliveira.jpg'
    },
    category: 'tips',
    publishedAt: new Date('2024-01-10'),
    views: 750,
    tags: ['manejo', 'leitões', 'inverno', 'saúde']
  },
  {
    id: '4',
    title: 'Evento Nacional de Suinocultura 2024: Inscrições Abertas',
    slug: 'evento-nacional-suinocultura-2024',
    excerpt: 'O maior encontro de criadores de suínos do país acontecerá em março. Confira a programação e garanta sua vaga.',
    content: '',
    featuredImage: '/news/event-2024.jpg',
    author: {
      name: 'Ana Costa',
      avatar: '/authors/ana-costa.jpg'
    },
    category: 'events',
    publishedAt: new Date('2024-01-08'),
    views: 1100,
    tags: ['evento', 'networking', 'capacitação']
  }
]

const LatestNews = () => {
  const [news, setNews] = useState(mockNews)
  const [loading, setLoading] = useState(false)

  // Função para buscar notícias recentes (será implementada com API real)
  const fetchLatestNews = async () => {
    setLoading(true)
    try {
      // const response = await fetch('/api/news/latest')
      // const data = await response.json()
      // setNews(data.news)
      
      // Por enquanto, usar dados mock
      setTimeout(() => {
        setNews(mockNews)
        setLoading(false)
      }, 800)
    } catch (error) {
      console.error('Erro ao buscar notícias:', error)
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-AO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const calculateReadTime = (excerpt: string) => {
    const words = excerpt.split(' ').length
    const minutes = Math.ceil(words / 200) // 200 palavras por minuto
    return `${minutes} min de leitura`
  }

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Header */}
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

        {/* Loading State */}
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
          /* News Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Featured News - First Item */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:row-span-2"
            >
              <Link href={`/noticias/${news[0]?.slug}`} className="group block">
                <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  {/* Featured Image */}
                  <div className="relative h-64 lg:h-80 overflow-hidden">
                    <Image
                      src={news[0]?.featuredImage || ''}
                      alt={news[0]?.title || ''}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%2316a34a'/%3E%3Ctext x='400' y='300' text-anchor='middle' fill='white' font-size='32'%3ENotícia em Destaque%3C/text%3E%3C/svg%3E"
                      }}
                    />
                    
                    {/* Category Badge */}
                    {news[0] && (
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryInfo(news[0].category).color}`}>
                          {getCategoryInfo(news[0].category).label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-body">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight">
                      {news[0]?.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {news[0]?.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-2">
                        <Image
                          src={news[0]?.author.avatar || ''}
                          alt={news[0]?.author.name || ''}
                          width={24}
                          height={24}
                          className="rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236b7280'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='white' font-size='12'%3E👤%3C/text%3E%3C/svg%3E"
                          }}
                        />
                        <span>{news[0]?.author.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{news[0] && formatDate(news[0].publishedAt)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Eye size={14} />
                        <span>{news[0]?.views} visualizações</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {news[0]?.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Other News */}
            <div className="space-y-6">
              {news.slice(1, 4).map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/noticias/${article.slug}`} className="group block">
                    <div className="card overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex">
                        {/* Image */}
                        <div className="relative w-32 h-24 lg:w-40 lg:h-28 flex-shrink-0 overflow-hidden">
                          <Image
                            src={article.featuredImage}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%2316a34a'/%3E%3Ctext x='100' y='75' text-anchor='middle' fill='white' font-size='16'%3ENotícia%3C/text%3E%3C/svg%3E`
                            }}
                          />
                        </div>

                        {/* Content */}
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

                          {/* Meta */}
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

        {/* CTA Section */}
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
