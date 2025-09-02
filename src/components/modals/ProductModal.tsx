'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Weight, MapPin, Heart, ShoppingCart, Phone, Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Placeholder from '@/components/assets/Foto Suino.webp'
import { formatPrice, formatAge } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    _id?: string
    name: string
    description?: string
    breed: string
    age?: number
    weight: number
    price?: number
    images?: string[]
    imageUrl?: string
    healthStatus?: 'excellent' | 'good' | 'fair'
    vaccinated?: boolean
    location?: string
    features?: string[]
    code?: string
  } | null
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
}

export default function ProductModal({ 
  isOpen, onClose, product, onPrevious, onNext, hasPrevious = false, hasNext = false 
}: ProductModalProps) {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const [isLoading, setIsLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (isOpen && product) {
      setIsLoading(true)
      setCurrentImageIndex(0)
      setTimeout(() => setIsLoading(false), 300)
    }
  }, [isOpen, product])

  if (!isOpen || !product) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && hasPrevious) onPrevious?.()
    if (e.key === 'ArrowRight' && hasNext) onNext?.()
  }

  const getHealthStatusColor = (status?: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthStatusText = (status?: string) => {
    switch (status) {
      case 'excellent': return isEn ? 'Excellent' : 'Excelente'
      case 'good': return isEn ? 'Good' : 'Bom'
      case 'fair': return isEn ? 'Fair' : 'Regular'
      default: return 'N/A'
    }
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : [Placeholder as unknown as string])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header com imagem */}
        <div className="relative h-64 lg:h-72 overflow-hidden">
          <Image src={(images[currentImageIndex] as any) || (Placeholder as any)} alt={(product.name ?? '') as string} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
            <X size={20} className="text-white" />
          </button>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <button onClick={onPrevious} disabled={!hasPrevious} className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${hasPrevious ? 'bg-white/20 hover:bg-white/30 text-white hover:scale-110' : 'bg-white/10 text_white/50 cursor-not-allowed'}`}>
              <ArrowLeft size={20} />
            </button>
            <button onClick={onNext} disabled={!hasNext} className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${hasNext ? 'bg_white/20 hover:bg_white/30 text-white hover:scale-110' : 'bg-white/10 text-white/50 cursor-not-allowed'}`}>
              <ArrowRight size={20} />
            </button>
          </div>
          <div className="absolute top-4 left-4 space-y-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getHealthStatusColor(product.healthStatus)}`}>{getHealthStatusText(product.healthStatus)}</span>
            {product.vaccinated && (<span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium rounded-full block">{isEn ? 'Vaccinated' : 'Vacinado'}</span>)}
          </div>
          <div className="absolute bottom-4 right-4">
            <span className="bg-primary-600 text-white px-4 py-2 text-lg font-bold rounded-full shadow-lg">
              {product.price ? formatPrice(product.price) : (isEn ? 'Price on request' : 'Preço sob consulta')}
            </span>
          </div>
          {images.length > 1 && (
            <div className="absolute top-4 right-16 flex gap-2">
              {images.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-3 h-3 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`} />
              ))}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-6 lg:p-8 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
                <p className="text-xl text-primary-600 font-semibold">{product.breed}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500">{isEn ? 'Age' : 'Idade'}</p>
                      <p className="font-semibold text-gray-900">{product.age ? (isEn ? (product.age >= 12 ? `${Math.floor(product.age/12)} ${Math.floor(product.age/12) === 1 ? 'year' : 'years'}` : `${product.age} months`) : formatAge(product.age)) : (isEn ? 'Not informed' : 'Não informado')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Weight size={20} className="text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500">{isEn ? 'Weight' : 'Peso'}</p>
                      <p className="font-semibold text-gray-900">{product.weight} kg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500">{isEn ? 'Location' : 'Localização'}</p>
                      <p className="font-semibold text-gray-900">{product.location || (isEn ? 'Not informed' : 'Não informado')}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">{isEn ? 'Health Status' : 'Status de Saúde'}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getHealthStatusColor(product.healthStatus ?? undefined)}`}>{getHealthStatusText(product.healthStatus ?? undefined)}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">{isEn ? 'Vaccination' : 'Vacinação'}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${product.vaccinated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {product.vaccinated ? (isEn ? 'Vaccinated' : 'Vacinado') : (isEn ? 'Not vaccinated' : 'Não vacinado')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {product.description && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{isEn ? 'Description' : 'Descrição'}</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}
              {product.features && product.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{isEn ? 'Features' : 'Características'}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary-600 rounded-full" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg mb-8">
                <p className="text-sm text-gray-500">{isEn ? 'Product Code' : 'Código do Produto'}</p>
                <p className="font-mono font-semibold text-gray-900">{product.code || product._id?.slice?.(0, 8) || 'N/A'}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer com ações */}
        <div className="px-6 lg:px-8 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                <Heart size={20} className="text-gray-600 hover:text-red-500" />
              </button>
              <button className="w-10 h-10 bg-gray-100 hover:bg-primary-100 rounded-lg flex items-center justify-center transition-colors">
                <ShoppingCart size={20} className="text-gray-600 hover:text-primary-600" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <a href="/contato" className="btn-secondary flex items-center gap-2">
                <Mail size={16} />
                {isEn ? 'Send Message' : 'Enviar Mensagem'}
              </a>
              <a href="tel:+244928476427" className="btn-primary flex items-center gap-2">
                <Phone size={16} />
                {isEn ? 'Call Now' : 'Ligar Agora'}
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <button onClick={onClose} className="text-gray-600 hover:text-gray-800 font-medium transition-colors">
                {isEn ? 'Close' : 'Fechar'}
              </button>
              <div className="flex items-center gap-2">
                <span>{isEn ? 'Use arrows to navigate' : 'Use as setas para navegar'}</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">←</kbd>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">→</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}