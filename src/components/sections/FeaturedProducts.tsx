'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Heart,
  ShoppingCart,
  MapPin,
  Clock,
  Weight
} from 'lucide-react'
import ProductModal from '@/components/modals/ProductModal'
import Placeholder from '@/components/assets/Foto Suino.webp'
import { formatPrice, formatAge, convertAndFormat } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import pt from '@/lib/i18n/dictionaries/pt'
import en from '@/lib/i18n/dictionaries/en'

interface FeaturedProduct {
  _id: string
  name: string
  breed: string
  age: number
  weight: number
  price?: number
  pricePerKg?: number
  saleForm?: 'carcaça' | 'vivo'
  images?: string[]
  healthStatus?: 'excellent' | 'good' | 'fair'
  vaccinated?: boolean
  location?: string
  features?: string[]
  seller?: { name?: string; company?: string }
}

const FeaturedProducts = () => {
  const { locale } = useLanguage()
  const dict = locale.startsWith('en') ? en : pt
  const [products, setProducts] = useState<FeaturedProduct[]>([])
  const [currency, setCurrency] = useState('AOA')
  const [showConverted, setShowConverted] = useState(false)
  const [convertedCache, setConvertedCache] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchFeaturedProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products/featured?limit=4', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao buscar produtos')
      const json = await res.json()
      const data: FeaturedProduct[] = json.data || []
      setProducts(data)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeaturedProducts()
    ;(async()=>{ try { const r = await fetch('/api/admin/config',{ cache:'no-store' }); if(r.ok){ const j = await r.json(); const curr = j?.data?.currency || 'AOA'; setCurrency(curr); setShowConverted(locale.startsWith('en') && curr !== 'USD') } } catch {} })()
  }, [])



  const getHealthStatusColor = (status?: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-yellow-600 bg-yellow-100'
      case 'fair': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthStatusText = (status?: string) => {
    switch (status) {
      case 'excellent': return locale.startsWith('en') ? 'Excellent' : 'Excelente'
      case 'good': return locale.startsWith('en') ? 'Good' : 'Bom'
      case 'fair': return locale.startsWith('en') ? 'Fair' : 'Regular'
      default: return 'N/A'
    }
  }

  const openProductModal = (product: FeaturedProduct) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const closeProductModal = () => {
    setModalOpen(false)
    setSelectedProduct(null)
  }

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
    <section className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            {locale.startsWith('en') ? 'Featured Products' : 'Produtos em Destaque'}
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-6">
            {locale.startsWith('en') ? 'Premium' : 'Suínos de'}
            <span className="text-gradient"> {locale.startsWith('en') ? 'Pig Selection' : 'Qualidade Superior'}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {locale.startsWith('en')
              ? 'Check out our premium selection, raised with the highest standards of quality and animal welfare by our members.'
              : 'Confira nossa seleção de suínos premium, criados com os mais altos padrões de qualidade e bem-estar animal pelos nossos associados.'}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <div className="card-body space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => openProductModal(product)}
                className="card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image
                    src={(product.images?.[0] as any) || (Placeholder as any)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(product.healthStatus)}`}>
                      {getHealthStatusText(product.healthStatus)}
                    </span>
                    {product.vaccinated && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full block">
                        {locale.startsWith('en') ? 'Vaccinated' : 'Vacinado'}
                      </span>
                    )}
                  </div>
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors">
                    <Heart size={16} className="text-gray-600 hover:text-red-500" />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-primary-600 text-white px-3 py-1 text-sm font-bold rounded-full">
                      {typeof product.pricePerKg === 'number' ? (
                        `${formatPrice(product.pricePerKg, currency, locale)} /kg`
                      ) : product.price !== undefined ? (
                        showConverted ? (
                          convertedCache[String(product._id)] || (
                            (()=>{ convertAndFormat(product.price || 0, currency, 'USD', locale).then(f=>setConvertedCache(prev=>({...prev, [String(product._id)]: f })) ); return formatPrice(product.price || 0, currency, locale) })()
                          )
                        ) : (
                          `${formatPrice(product.price, currency, locale)} ${locale.startsWith('en') ? '/head' : '/cabeça'}`
                        )
                      ) : (locale.startsWith('en') ? 'Price on request' : 'Preço sob consulta')}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">{product.breed}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{formatAge(product.age)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Weight size={12} />
                      <span>{product.weight}kg</span>
                    </div>
                    <div className="flex items-center space-x-1 col-span-2">
                      <MapPin size={12} />
                      <span>{product.location || '—'}</span>
                    </div>
                    <div className="flex items-center space-x-1 col-span-2">
                      <span className="text-gray-500">{locale.startsWith('en') ? 'Sale' : 'Condição'}:</span>
                      <span>{product.saleForm ? (product.saleForm === 'vivo' ? (locale.startsWith('en') ? 'Live' : 'Vivo') : (locale.startsWith('en') ? 'Carcass' : 'Carcaça')) : '—'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        openProductModal(product)
                      }}
                      className="flex-1 btn-primary text-center text-sm py-2"
                    >
                      {locale.startsWith('en') ? 'See Details' : 'Ver Detalhes'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
            {locale.startsWith('en') ? 'Explore our complete collection of high-quality pigs' : 'Explore nossa coleção completa de suínos de alta qualidade'}
          </p>
          <Link
            href="/produtos"
            className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {locale.startsWith('en') ? 'See All Products' : 'Ver Todos os Produtos'}
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </motion.div>
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
    </section>
  )
}

export default FeaturedProducts
