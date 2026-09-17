'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Calendar, Weight, MapPin, Phone, Mail, ChevronLeft, ChevronRight,
  ShieldCheck, Syringe, Tag, PlayCircle, ImageOff, VideoOff, ZoomIn,
} from 'lucide-react'
import Image from 'next/image'
import Placeholder from '@/components/assets/Foto Suino.webp'
import { formatPrice, formatAge, convertAndFormat, isExternalImageUrl, normalizeImageUrl } from '@/lib/utils'
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

// Cartão de vídeo com estado próprio de erro/carregamento — se o ficheiro
// falhar (link quebrado, formato não suportado, etc.) mostramos um aviso
// em vez de deixar uma caixa preta eternamente "a carregar".
function VideoCard({ url, label }: { url: string; label: string }) {
  const [failed, setFailed] = useState(false)
  const isEmbed = /^(https?:)?\/\//.test(url) && /youtube\.com|youtu\.be|vimeo\.com/.test(url)

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900">
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
          <VideoOff size={28} />
          <span className="text-xs">{label}</span>
        </div>
      ) : isEmbed ? (
        <iframe
          src={url.includes('embed') ? url : url.replace('watch?v=', 'embed/')}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setFailed(true)}
          title={label}
        />
      ) : (
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

export default function ProductModal({
  isOpen, onClose, product, onPrevious, onNext, hasPrevious = false, hasNext = false
}: ProductModalProps) {
  const { locale } = useLanguage()
  const [currency, setCurrency] = useState('AOA')
  const [showConverted, setShowConverted] = useState(false)
  const [converted, setConverted] = useState<string | null>(null)
  const isEn = locale.startsWith('en')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({})
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (isOpen && product) {
      setCurrentImageIndex(0)
      setBrokenImages({})
    }
  }, [isOpen, product])

  useEffect(() => {
    if (!isOpen) return
    dialogRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [isOpen])

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/config', { cache: 'no-store' })
        if (r.ok) {
          const j = await r.json()
          const curr = j?.data?.currency || 'AOA'
          setCurrency(curr)
          setShowConverted(locale.startsWith('en'))
        }
      } catch {}
    })()
  }, [locale])

  useEffect(() => {
    if (showConverted && product?.price) {
      convertAndFormat(product.price || 0, 'AOA', 'USD', locale).then(setConverted).catch(() => setConverted(null))
    } else {
      setConverted(null)
    }
  }, [showConverted, product?.price, locale])

  if (!isOpen || !product || !mounted) return null

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

  const rawImages = product.images && product.images.length > 0
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : [])
  const hasRealImages = rawImages.length > 0
  const images = hasRealImages ? rawImages : [String(Placeholder as any)]
  const videos = Array.isArray((product as any).videos) ? ((product as any).videos as string[]) : []

  const activeImageBroken = !!brokenImages[currentImageIndex]
  const activeImageSrc = activeImageBroken
    ? String(Placeholder)
    : normalizeImageUrl(images[currentImageIndex])

  const subject = (isEn ? 'Product inquiry: ' : 'Interesse no produto: ') + (product.name || '')
  const intro = isEn
    ? 'Hello, I liked this product and would like to know if it is still available.'
    : 'Olá, gostei deste produto e gostaria de saber se ainda está disponível.'
  const details = `${isEn ? 'Product info' : 'Informações do produto'}:\n`
    + `- ${isEn ? 'Name' : 'Nome'}: ${product.name}\n`
    + `- ${isEn ? 'Breed' : 'Raça'}: ${product.breed || '-'}\n`
    + `- ${isEn ? 'Weight' : 'Peso'}: ${product.weight ? `${product.weight} kg` : '-'}\n`
    + `- ${isEn ? 'Age' : 'Idade'}: ${product.age ? `${product.age} ${isEn ? 'months' : 'meses'}` : '-'}\n`
    + `- ${isEn ? 'Code' : 'Código'}: ${product.code || product._id?.slice?.(0, 8) || '-'}`
  const outro = isEn ? 'Thanks!' : 'Obrigado!'
  const prefillMessage = `${intro}\n\n${details}\n\n${outro}`
  const contactHref = `/contato?subject=${encodeURIComponent(subject)}&message=${encodeURIComponent(prefillMessage)}`

  const modal = (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
        tabIndex={-1}
        className="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl focus:outline-none sm:h-auto sm:max-h-[92vh] sm:w-full sm:max-w-4xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior fixa: só o essencial (fechar + navegar), nunca fica fora de vista */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevious}
              aria-label={isEn ? 'Previous product' : 'Produto anterior'}
              disabled={!hasPrevious}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${hasPrevious ? 'text-gray-600 hover:bg-gray-100' : 'cursor-not-allowed text-gray-300'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={onNext}
              aria-label={isEn ? 'Next product' : 'Próximo produto'}
              disabled={!hasNext}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${hasNext ? 'text-gray-600 hover:bg-gray-100' : 'cursor-not-allowed text-gray-300'}`}
            >
              <ChevronRight size={20} />
            </button>
            <span className="ml-2 hidden text-xs text-gray-400 sm:inline">
              {isEn ? 'Use arrow keys to navigate' : 'Use as setas do teclado para navegar'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label={isEn ? 'Close product details' : 'Fechar detalhes do produto'}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo — TUDO dentro de um único contentor com scroll, para nada ficar cortado */}
        <div className="flex-1 overflow-y-auto">
          {/* Galeria: imagem inteira visível (sem cortar), com miniaturas por baixo */}
          <div className="border-b border-gray-100 bg-gray-50 p-4 sm:p-6">
            <div
              className="group relative aspect-[4/3] w-full max-w-xl mx-auto cursor-zoom-in overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 sm:aspect-video"
              onClick={() => !activeImageBroken && setIsZoomOpen(true)}
            >
              {isExternalImageUrl(activeImageSrc) ? (
                <img
                  src={activeImageSrc}
                  alt={product.name ?? ''}
                  className="h-full w-full object-contain"
                  onError={() => setBrokenImages((prev) => ({ ...prev, [currentImageIndex]: true }))}
                />
              ) : (
                <Image
                  src={activeImageSrc as any}
                  alt={(product.name ?? '') as string}
                  fill
                  sizes="(max-width: 640px) 100vw, 640px"
                  className="object-contain"
                  onError={() => setBrokenImages((prev) => ({ ...prev, [currentImageIndex]: true }))}
                  priority
                />
              )}
              {!activeImageBroken && (
                <div className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <ZoomIn size={16} />
                </div>
              )}
              {activeImageBroken && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <ImageOff size={32} />
                  <span className="text-xs">{isEn ? 'Image unavailable' : 'Imagem indisponível'}</span>
                </div>
              )}

              {/* Selos sobrepostos à imagem */}
              <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm ${getHealthStatusColor(product.healthStatus)}`}>
                  {getHealthStatusText(product.healthStatus)}
                </span>
                {product.vaccinated && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 shadow-sm">
                    <Syringe size={12} /> {isEn ? 'Vaccinated' : 'Vacinado'}
                  </span>
                )}
              </div>
              <div className="absolute right-3 top-3">
                {typeof product.pricePerKg === 'number' && product.pricePerKg > 0 && (
                  <span className="rounded-full bg-primary-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                    {`${formatPrice(product.pricePerKg, currency, locale)} /kg`}
                  </span>
                )}
                {typeof product.price === 'number' && product.price > 0 && (
                  <span className="rounded-full bg-primary-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                    {showConverted ? (converted || formatPrice(product.price, 'AOA', locale)) : `${formatPrice(product.price, currency, locale)} ${isEn ? '/head' : '/cabeça'}`}
                  </span>
                )}
                {(!(typeof product.pricePerKg === 'number' && product.pricePerKg > 0) && !(typeof product.price === 'number' && product.price > 0)) && (
                  <span className="rounded-full bg-primary-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                    {isEn ? 'Price on request' : 'Preço sob consulta'}
                  </span>
                )}
              </div>
            </div>

            {/* Miniaturas — só aparecem quando há mais do que uma imagem real */}
            {hasRealImages && images.length > 1 && (
              <div className="mx-auto mt-3 flex max-w-xl gap-2 overflow-x-auto pb-1">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    aria-label={`${isEn ? 'View image' : 'Ver imagem'} ${idx + 1}`}
                    aria-current={idx === currentImageIndex}
                    className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg ring-2 transition-all ${idx === currentImageIndex ? 'ring-primary-600' : 'ring-transparent hover:ring-gray-300'}`}
                  >
                    {isExternalImageUrl(normalizeImageUrl(src)) ? (
                      <img
                        src={brokenImages[idx] ? String(Placeholder) : normalizeImageUrl(src)}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={() => setBrokenImages((prev) => ({ ...prev, [idx]: true }))}
                      />
                    ) : (
                      <Image
                        src={(brokenImages[idx] ? Placeholder : src) as any}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                        onError={() => setBrokenImages((prev) => ({ ...prev, [idx]: true }))}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações principais */}
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h1 id="product-dialog-title" className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{product.name}</h1>
              <p className="mt-1 text-lg font-semibold text-primary-600">{product.breed}</p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <Calendar size={20} className="flex-shrink-0 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">{isEn ? 'Age' : 'Idade'}</p>
                  <p className="font-semibold text-gray-900">{product.age ? formatAge(product.age, locale) : (isEn ? 'Not informed' : 'Não informado')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <Weight size={20} className="flex-shrink-0 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">{isEn ? 'Weight' : 'Peso'}</p>
                  <p className="font-semibold text-gray-900">{product.weight} kg</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <MapPin size={20} className="flex-shrink-0 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">{isEn ? 'Location' : 'Localização'}</p>
                  <p className="font-semibold text-gray-900">{product.location || (isEn ? 'Not informed' : 'Não informado')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <Tag size={20} className="flex-shrink-0 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">{isEn ? 'Sale' : 'Condição'}</p>
                  <p className="font-semibold text-gray-900">{product.saleForm ? (product.saleForm === 'vivo' ? (isEn ? 'Live' : 'Vivo') : (isEn ? 'Carcass' : 'Carcaça')) : '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 sm:col-span-2">
                <ShieldCheck size={20} className={`flex-shrink-0 ${product.vaccinated ? 'text-green-600' : 'text-yellow-600'}`} />
                <div>
                  <p className="text-xs text-gray-500">{isEn ? 'Vaccination' : 'Vacinação'}</p>
                  <p className="font-semibold text-gray-900">
                    {product.vaccinated ? (isEn ? 'Vaccinated' : 'Vacinado') : (isEn ? 'Not vaccinated' : 'Não vacinado')}
                  </p>
                </div>
              </div>
            </div>

            {product.description && (
              <div className="mb-8">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{isEn ? 'Description' : 'Descrição'}</h3>
                <p className="leading-relaxed text-gray-700">{product.description}</p>
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">{isEn ? 'Features' : 'Características'}</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {product.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-600" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vídeos */}
            {videos.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <PlayCircle size={18} className="text-primary-600" />
                  {isEn ? 'Videos' : 'Vídeos'}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {videos.map((url, idx) => (
                    <VideoCard key={idx} url={url} label={isEn ? 'Video unavailable' : 'Vídeo indisponível'} />
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">{isEn ? 'Product Code' : 'Código do Produto'}</p>
              <p className="font-mono font-semibold text-gray-900">{product.code || product._id?.slice?.(0, 8) || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Rodapé de ações — sempre visível, fixo na base do diálogo */}
        <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <a href={contactHref} className="btn-secondary flex items-center justify-center gap-2">
            <Mail size={16} />
            {isEn ? 'Send Message' : 'Enviar Mensagem'}
          </a>
          <a href="tel:+244923221950" className="btn-primary flex items-center justify-center gap-2">
            <Phone size={16} />
            {isEn ? 'Call Now' : 'Ligar Agora'}
          </a>
        </div>
      </div>

      {/* Zoom da imagem principal */}
      {isZoomOpen && !activeImageBroken && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85"
          onClick={(e) => { e.stopPropagation(); setIsZoomOpen(false) }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsZoomOpen(false) }}
            aria-label={isEn ? 'Close' : 'Fechar'}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <div className="relative h-[90vh] w-[95vw] cursor-zoom-out" onClick={(e) => e.stopPropagation()}>
            {isExternalImageUrl(activeImageSrc) ? (
              <img src={activeImageSrc} alt={product.name ?? ''} className="h-full w-full object-contain" />
            ) : (
              <Image
                src={activeImageSrc as any}
                alt={(product.name ?? '') as string}
                fill
                sizes="95vw"
                className="object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )

  // Renderizado via portal para o body: garante posicionamento correto
  // do overlay/fixed independentemente de qualquer estilo (transform,
  // filter, etc.) que algum elemento ancestral da página possa ter.
  return createPortal(modal, document.body)
}
