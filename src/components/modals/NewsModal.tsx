'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, User, Eye, Tag, ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Placeholder from '@/components/assets/Foto Suino.webp'
import { formatDate, calculateReadTime } from '@/lib/utils'

interface NewsModalProps {
  isOpen: boolean
  onClose: () => void
  news: any
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
}

export default function NewsModal({ 
  isOpen, 
  onClose, 
  news, 
  onPrevious, 
  onNext, 
  hasPrevious = false, 
  hasNext = false 
}: NewsModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && news) {
      setIsLoading(true)
      // Simular carregamento
      setTimeout(() => setIsLoading(false), 300)
    }
  }, [isOpen, news])

  if (!isOpen || !news) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && hasPrevious) onPrevious?.()
    if (e.key === 'ArrowRight' && hasNext) onNext?.()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-80 lg:h-96 overflow-hidden">
          <Image
            src={(news.featuredImage as any) || (Placeholder as any)}
            alt={news.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <X size={20} className="text-white" />
          </button>

          {/* Navegação */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                hasPrevious 
                  ? 'bg-white/20 hover:bg-white/30 text-white hover:scale-110' 
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                hasNext 
                  ? 'bg-white/20 hover:bg-white/30 text-white hover:scale-110' 
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Categoria */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary-600 text-white">
              {news.category}
            </span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 lg:p-8 overflow-y-auto max-h-[calc(90vh-24rem)]">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ) : (
            <>
              {/* Título */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {news.title}
              </h1>

              {/* Meta informações */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                {news.author?.name && (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-primary-600" />
                    <span>{news.author.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary-600" />
                  <span>{formatDate(news.publishedAt)}</span>
                </div>
                {news.views != null && (
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-primary-600" />
                    <span>{news.views} visualizações</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-primary-600" />
                  <span>{calculateReadTime(news.excerpt)} de leitura</span>
                </div>
              </div>

              {/* Resumo */}
              {news.excerpt && (
                <div className="mb-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {news.excerpt}
                  </p>
                </div>
              )}

              {/* Conteúdo completo */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: news.content || news.excerpt }}
                />
              </div>

              {/* Tags */}
              {news.tags && news.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {news.tags.map((tag: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 lg:px-8 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Fechar
            </button>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Use as setas para navegar</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">←</kbd>
                <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">→</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}