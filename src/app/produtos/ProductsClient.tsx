'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Tag, Weight, Calendar, Eye } from 'lucide-react'
import ProductModal from '@/components/modals/ProductModal'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { formatPrice, convertAndFormat } from '@/lib/utils'

interface Product {
  _id: string
  name: string
  breed: string
  weight: number
  age: number
  price?: number
  priceFormatted?: string
  code?: string
  imageUrl: string
  description?: string
  healthStatus?: 'excellent' | 'good' | 'fair'
  vaccinated?: boolean
  location?: string
  features?: string[]
}

interface ProductsClientProps {
  products: Product[]
}

export default function ProductsClient({ products }: ProductsClientProps) {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [currency, setCurrency] = useState('AOA')
  const [showConverted, setShowConverted] = useState(false)
  const [convertedCache, setConvertedCache] = useState<Record<string, string>>({})
  const [modalOpen, setModalOpen] = useState(false)

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const closeProductModal = () => {
    setModalOpen(false)
    setSelectedProduct(null)
  }

  // Load currency for client-side formatted fallbacks
  useEffect(()=>{
    ;(async()=>{ try { const r = await fetch('/api/admin/config',{cache:'no-store'}); if(r.ok){ const j = await r.json(); setCurrency(j?.data?.currency || 'AOA'); setShowConverted(locale.startsWith('en')) } } catch {} })()
  },[])

  const goToPreviousProduct = () => {
    if (!selectedProduct) return
    const currentIndex = products.findIndex(p => p._id === selectedProduct._id)
    if (currentIndex > 0) {
      setSelectedProduct(products[currentIndex - 1])
    }
  }

  const goToNextProduct = () => {
    if (!selectedProduct) return
    const currentIndex = products.findIndex(p => p._id === selectedProduct._id)
    if (currentIndex < products.length - 1) {
      setSelectedProduct(products[currentIndex + 1])
    }
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, idx) => (
          <div 
            key={product._id || idx} 
            onClick={() => openProductModal(product)}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer hover:scale-[1.02]"
          >
            {/* Imagem */}
            <div className="relative h-48">
              <Image
                src={product.imageUrl}
                alt={product.name || (isEn ? 'Product' : 'Produto')}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width:768px) 100vw, 33vw"
              />
              {/* Badge de preço */}
              {(product.priceFormatted || typeof product.price === 'number') && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary-700 text-sm font-semibold shadow">
                  {product.priceFormatted || (
                    showConverted
                      ? convertedCache[String(product._id)] || (
                        (()=>{ convertAndFormat((product.price as number) || 0, 'AOA', 'USD', locale).then(f=>setConvertedCache(prev=>({...prev, [String(product._id)]: f })) ); return formatPrice((product.price as number) || 0, 'AOA', locale) })()
                      )
                      : formatPrice(product.price as number, currency, locale)
                  )}
                </div>
              )}
              {/* Overlay de hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              {/* Ícone de visualizar */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                  <Eye size={16} className="text-primary-600" />
                  <span className="text-primary-700 font-medium text-sm">{isEn ? 'See details' : 'Ver Detalhes'}</span>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-primary-600 transition-colors">
                {product.name}
              </h3>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Tag size={14} className="text-primary-600" />
                  {product.breed || '—'}
                </div>
                <div className="flex items-center gap-1">
                  <Weight size={14} className="text-primary-600" />
                  {product.weight ? `${product.weight} kg` : '—'}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} className="text-primary-600" />
                  {product.age ? `${product.age} ${isEn ? 'months' : 'meses'}` : '—'}
                </div>
              </div>

              {/* Ações */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {isEn ? 'Code' : 'Código'}: {product.code || product._id?.slice?.(0, 6) || '—'}
                </span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      openProductModal(product)
                    }}
                    className="text-primary-700 hover:text-primary-800 font-medium text-sm hover:underline"
                  >
                    {isEn ? 'See details' : 'Ver Detalhes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Produto */}
      <ProductModal
        isOpen={modalOpen}
        onClose={closeProductModal}
        product={selectedProduct}
        onPrevious={goToPreviousProduct}
        onNext={goToNextProduct}
        hasPrevious={selectedProduct ? products.findIndex(p => p._id === selectedProduct._id) > 0 : false}
        hasNext={selectedProduct ? products.findIndex(p => p._id === selectedProduct._id) < products.length - 1 : false}
      />
    </>
  )
}