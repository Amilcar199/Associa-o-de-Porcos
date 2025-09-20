'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Weight, MapPin, Phone, Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Placeholder from '@/components/assets/Foto Suino.webp'
import { formatPrice, formatAge, convertAndFormat } from '@/lib/utils'
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
    pricePerKg?: number
    saleForm?: 'carcaça' | 'vivo'
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
  const [currency, setCurrency] = useState('AOA')
  const [showConverted, setShowConverted] = useState(false)
  const [converted, setConverted] = useState<string | null>(null)
  const isEn = locale.startsWith('en')
  const [isLoading, setIsLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  useEffect(() => {
    if (isOpen && product) {
      setIsLoading(true)
      setCurrentImageIndex(0)
      setTimeout(() => setIsLoading(false), 300)
    }
  }, [isOpen, product])

  useEffect(()=>{
    ;(async()=>{ try { const r = await fetch('/api/admin/config',{cache:'no-store'}); if(r.ok){ const j = await r.json(); const curr = j?.data?.currency || 'AOA'; setCurrency(curr); setShowConverted(locale.startsWith('en')) } } catch {} })()
  },[])

  useEffect(()=>{
    if (showConverted && product?.price) {
      convertAndFormat(product.price || 0, 'AOA', 'USD', locale).then(setConverted).catch(()=>setConverted(null))
    } else {
      setConverted(null)
    }
  }, [showConverted, product?.price, locale])

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
    : (product.imageUrl ? [product.imageUrl] : [String(Placeholder as any)])
  const videos = Array.isArray((product as any).videos) ? ((product as any).videos as string[]) : []

  const subject = (isEn ? 'Product inquiry: ' : 'Interesse no produto: ') + (product.name || '')
  const intro = isEn
    ? 'Hello, I liked this product and would like to know if it is still available.'
    : 'Olá, gostei deste produto e gostaria de saber se ainda está disponível.'
  const details = `${isEn ? 'Product info' : 'Informações do produto'}:\n`
    + `- ${isEn ? 'Name' : 'Nome'}: ${product.name}\n`
    + `- ${isEn ? 'Breed' : 'Raça'}: ${product.breed || '-'}\n`
    + `- ${isEn ? 'Weight' : 'Peso'}: ${product.weight ? `${product.weight} kg` : '-'}\n`
    + `- ${isEn ? 'Age' : 'Idade'}: ${product.age ? `${product.age} ${isEn ? 'months' : 'meses'}` : '-'}\n`
    + `- ${isEn ? 'Code' : 'Código'}: ${product.code || product._id?.slice?.(0,8) || '-'}`
  const outro = isEn ? 'Thanks!' : 'Obrigado!'
  const prefillMessage = `${intro}\n\n${details}\n\n${outro}`
  const contactHref = `/contato?subject=${encodeURIComponent(subject)}&message=${encodeURIComponent(prefillMessage)}`
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header com imagem */}
        <div className="relative h-64 lg:h-72 overflow-hidden cursor-zoom-in" onClick={() => setIsZoomOpen(true)}>
          <Image src={(images[currentImageIndex] as any) || (Placeholder as any)} alt={(product.name ?? '') as string} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
            <X size={20} className="text-white" />
          </button>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <button onClick={(e)=>{ e.stopPropagation(); onPrevious?.() }} disabled={!hasPrevious} className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${hasPrevious ? 'bg-white/20 hover:bg-white/30 text-white hover:scale-110' : 'bg-white/10 text_white/50 cursor-not-allowed'}`}>
              <ArrowLeft size={20} />
            </button>
            <button onClick={(e)=>{ e.stopPropagation(); onNext?.() }} disabled={!hasNext} className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${hasNext ? 'bg_white/20 hover:bg_white/30 text-white hover:scale-110' : 'bg-white/10 text-white/50 cursor-not-allowed'}`}>
              <ArrowRight size={20} />
            </button>
          </div>
          <div className="absolute top-4 left-4 space-y-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getHealthStatusColor(product.healthStatus)}`}>{getHealthStatusText(product.healthStatus)}</span>
            {product.vaccinated && (<span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium rounded-full block">{isEn ? 'Vaccinated' : 'Vacinado'}</span>)}
          </div>
          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
            {typeof product.pricePerKg === 'number' && product.pricePerKg > 0 && (
              <span className="bg-primary-600 text-white px-4 py-2 text-lg font-bold rounded-full shadow-lg">
                {`${formatPrice(product.pricePerKg, currency, locale)} /kg`}
              </span>
            )}
            {typeof product.price === 'number' && product.price > 0 && (
              <span className="bg-primary-600 text-white px-4 py-2 text-lg font-bold rounded-full shadow-lg">
                {showConverted ? (converted || formatPrice(product.price, 'AOA', locale)) : `${formatPrice(product.price, currency, locale)} ${isEn ? '/head' : '/cabeça'}`}
              </span>
            )}
            {(!(typeof product.pricePerKg === 'number' && product.pricePerKg > 0) && !(typeof product.price === 'number' && product.price > 0)) && (
              <span className="bg-primary-600 text-white px-4 py-2 text-lg font-bold rounded-full shadow-lg">
                {isEn ? 'Price on request' : 'Preço sob consulta'}
              </span>
            )}
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
                      <p className="font-semibold text-gray-900">{product.age ? formatAge(product.age, locale) : (isEn ? 'Not informed' : 'Não informado')}</p>
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
                <div className="flex items-center gap-3">
                  <div className="text-primary-600 font-semibold">{isEn ? 'Sale' : 'Condição'}:</div>
                  <div className="text-gray-900 font-medium">{product.saleForm ? (product.saleForm === 'vivo' ? (isEn ? 'Live' : 'Vivo') : (isEn ? 'Carcass' : 'Carcaça')) : '—'}</div>
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

        {/* Galeria de vídeos */}
        {videos.length > 0 && (
          <div className="px-6 lg:px-8 pb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Vídeos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((url, idx) => (
                <div key={idx} className="aspect-video bg-black/5 rounded-lg overflow-hidden">
                  {/^(https?:)?\/\//.test(url) && /youtube\.com|youtu\.be|vimeo\.com/.test(url) ? (
                    <iframe
                      src={url.includes('embed') ? url : url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`video-${idx}`}
                    />
                  ) : (
                    <video src={url} controls className="w-full h-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer com ações */}
        <div className="px-6 lg:px-8 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3" />
            <div className="flex items-center gap-3">
              <a href={contactHref} className="btn-secondary flex items-center gap-2">
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
      {/* Zoom Overlay */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setIsZoomOpen(false); }}>
          <div className="relative max-w-[95vw] max-h-[95vh] w-auto h-auto cursor-zoom-out" onClick={(e)=>e.stopPropagation()}>
            <Image src={(images[currentImageIndex] as any) || (Placeholder as any)} alt={(product.name ?? '') as string} width={1600} height={1200} className="object-contain w-auto h-auto max-w-[95vw] max-h-[95vh]" />
          </div>
        </div>
      )}
    </div>
  )
}