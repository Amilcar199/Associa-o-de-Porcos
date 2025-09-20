'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
 
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
  pricePerKg?: number
  priceFormatted?: string
  code?: string
  imageUrl: string
  description?: string
  healthStatus?: 'excellent' | 'good' | 'fair'
  vaccinated?: boolean
  location?: string
  features?: string[]
  saleForm?: 'carcaça' | 'vivo'
}

interface ProductsClientProps {
  products: Product[]
}

export default function ProductsClient({ products }: ProductsClientProps) {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const [selectedProduct, setSelectedProduct] = useState(null as Product | null)
  const [currency, setCurrency] = useState('AOA')
  const [showConverted, setShowConverted] = useState(false)
  const [convertedCache, setConvertedCache] = useState({} as Record<string, string>)
  const [modalOpen, setModalOpen] = useState(false)
  const [list, setList] = useState((products || []) as Product[])
  const [query, setQuery] = useState('')
  const [health, setHealth] = useState('' as string)
  const [vaccinated, setVaccinated] = useState('' as string)
  const [minPrice, setMinPrice] = useState('' as string)
  const [maxPrice, setMaxPrice] = useState('' as string)
  const [minWeight, setMinWeight] = useState('' as string)
  const [maxAge, setMaxAge] = useState('' as string)
  const [priceType, setPriceType] = useState<'head' | 'kg'>('head')

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
    ;(async()=>{ try { const r = await fetch('/api/admin/config',{cache:'no-store'}); if(r.ok){ const j = await r.json(); const curr = j?.data?.currency || 'AOA'; setCurrency(curr); setShowConverted(locale.startsWith('en') && curr !== 'USD') } } catch {} })()
  },[])

  // Client-side fetch fallback if no SSR products (to mirror homepage behavior)
  useEffect(()=>{
    if ((products || []).length > 0) return
    const placeholderImages = [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1556229061-3f99a5d6c2ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1599327576016-7cc3f4f1bb4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ]
    ;(async()=>{
      try {
        const res = await fetch('/api/products', { cache: 'no-store' })
        const json = res.ok ? await res.json() : { data: [] }
        let data: any[] = json?.data || []
        let enriched = data.map((p: any, idx: number) => ({
          ...p,
          _id: p._id || p.code || String(idx),
          imageUrl: (p.images && p.images[0]) || p.imageUrl || placeholderImages[idx % placeholderImages.length]
        }))
        if (enriched.length === 0) {
          const rf = await fetch('/api/products/featured?limit=12', { cache: 'no-store' })
          const jf = rf.ok ? await rf.json() : { data: [] }
          const df: any[] = jf?.data || []
          enriched = df.map((p: any, idx: number) => ({
            ...p,
            _id: p._id || p.code || String(idx),
            imageUrl: (p.images && p.images[0]) || p.imageUrl || placeholderImages[idx % placeholderImages.length]
          }))
        }
        setList(enriched as any)
      } catch {}
    })()
  },[products])

  const goToPreviousProduct = () => {
    if (!selectedProduct) return
    const currentIndex = list.findIndex((p: Product) => p._id === selectedProduct._id)
    if (currentIndex > 0) {
      setSelectedProduct(list[currentIndex - 1])
    }
  }

  const goToNextProduct = () => {
    if (!selectedProduct) return
    const currentIndex = list.findIndex((p: Product) => p._id === selectedProduct._id)
    if (currentIndex < list.length - 1) {
      setSelectedProduct(list[currentIndex + 1])
    }
  }

  const filtered = list.filter((p: Product) => {
    if (query && !(`${p.name} ${p.breed} ${p.description || ''}`.toLowerCase().includes(query.toLowerCase()))) return false
    if (health && p.healthStatus !== health) return false
    if (vaccinated && String(!!p.vaccinated) !== vaccinated) return false
    if (minPrice || maxPrice) {
      const limit = Number(maxPrice)
      const lower = Number(minPrice)
      if (priceType === 'kg') {
        const perKg = typeof p.pricePerKg === 'number' && p.pricePerKg > 0
          ? p.pricePerKg
          : (typeof p.price === 'number' && typeof p.weight === 'number' && p.weight > 0
              ? p.price / p.weight
              : null)
        if (perKg != null) {
          if (minPrice && perKg < lower) return false
          if (maxPrice && perKg > limit) return false
        }
      } else {
        if (typeof p.price === 'number') {
          if (minPrice && p.price < lower) return false
          if (maxPrice && p.price > limit) return false
        }
      }
    }
    if (minWeight && typeof p.weight === 'number' && p.weight < Number(minWeight)) return false
    if (maxAge && typeof p.age === 'number' && p.age > Number(maxAge)) return false
    return true
  })

  const getCategory = (w?: number) => {
    if (w === undefined || w === null) return '—'
    if (w <= 30) return isEn ? 'Piglet' : 'Leitão'
    if (w < 80) return isEn ? 'Grower/Fattener' : 'Engorda'
    return isEn ? 'Finished' : 'Pronto para Abate'
  }

  const getPriceDisplay = (p: Product) => {
    const perKg = typeof p.pricePerKg === 'number' && p.pricePerKg! > 0
    const value = perKg ? p.pricePerKg! : (p.price || 0)
    const formatted = formatPrice(value, currency, locale)
    const unit = perKg ? (isEn ? '/kg' : '/kg') : (isEn ? '/head' : '/cabeça')
    return `${formatted} ${unit}`
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-8">
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder={isEn ? 'Search by name, breed...' : 'Buscar por nome, raça...'}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select value={health} onChange={e=>setHealth(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="">{isEn ? 'Health (all)' : 'Saúde (todas)'}</option>
            <option value="excellent">{isEn ? 'Excellent' : 'Excelente'}</option>
            <option value="good">{isEn ? 'Good' : 'Bom'}</option>
            <option value="fair">{isEn ? 'Fair' : 'Regular'}</option>
          </select>
          <select value={vaccinated} onChange={e=>setVaccinated(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="">{isEn ? 'Vaccinated (all)' : 'Vacinado (todos)'}</option>
            <option value="true">{isEn ? 'Vaccinated' : 'Vacinado'}</option>
            <option value="false">{isEn ? 'Not Vaccinated' : 'Não vacinado'}</option>
          </select>
          <select value={priceType} onChange={e=>setPriceType(e.target.value as any)} className="px-3 py-2 border rounded-lg">
            <option value="head">{isEn ? 'Price /head' : 'Preço /cabeça'}</option>
            <option value="kg">{isEn ? 'Price /kg' : 'Preço /kg'}</option>
          </select>
          <input type="number" min="0" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder={(isEn ? 'Min price' : 'Preço mín.') + (priceType === 'kg' ? ' /kg' : ` ${isEn ? '/head' : '/cabeça'}`)} className="px-3 py-2 border rounded-lg" />
          <input type="number" min="0" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder={(isEn ? 'Max price' : 'Preço máx.') + (priceType === 'kg' ? ' /kg' : ` ${isEn ? '/head' : '/cabeça'}`)} className="px-3 py-2 border rounded-lg" />
          <input type="number" min="0" value={minWeight} onChange={e=>setMinWeight(e.target.value)} placeholder={isEn ? 'Min weight (kg)' : 'Peso mín. (kg)'} className="px-3 py-2 border rounded-lg" />
          <input type="number" min="0" value={maxAge} onChange={e=>setMaxAge(e.target.value)} placeholder={isEn ? 'Max age (months)' : 'Idade máx. (meses)'} className="px-3 py-2 border rounded-lg" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(() => {
            const hasActiveFilters = !!(query || health || vaccinated || minPrice || maxPrice || minWeight || maxAge || priceType !== 'head')
            return (
              <button
                onClick={()=>{ setQuery(''); setHealth(''); setVaccinated(''); setMinPrice(''); setMaxPrice(''); setMinWeight(''); setMaxAge(''); setPriceType('head') }}
                disabled={!hasActiveFilters}
                className={`text-sm px-3 py-1.5 rounded border ${hasActiveFilters ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
              >
                {isEn ? 'Clear filters' : 'Limpar filtros'}
              </button>
            )
          })()}
          <span className="text-sm text-gray-500 ml-auto">{isEn ? 'Results' : 'Resultados'}: {filtered.length}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product: Product, idx: number) => (
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
              {(typeof product.price === 'number' && product.price > 0) || (typeof product.pricePerKg === 'number' && product.pricePerKg > 0) ? (
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                  {typeof product.pricePerKg === 'number' && product.pricePerKg > 0 && (
                    <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary-700 text-sm font-semibold shadow">
                      {`${formatPrice(product.pricePerKg, currency, locale)} ${isEn ? '/kg' : '/kg'}`}
                    </div>
                  )}
                  {typeof product.price === 'number' && product.price > 0 && (
                    <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary-700 text-sm font-semibold shadow">
                      {`${product.priceFormatted || formatPrice(product.price, currency, locale)} ${isEn ? '/head' : '/cabeça'}`}
                    </div>
                  )}
                </div>
              ) : null}
              {/* Overlay de hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              {/* Indicador de ação profissional */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"></path>
                  </svg>
                  <span className="text-primary-700 font-medium text-sm">{isEn ? 'See details' : 'Ver Detalhes'}</span>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-primary-600 transition-colors">
                {product.name}
              </h3>
              {/* Linha 1: Localização */}
              <div className="mt-2 text-xs text-gray-600">
                <span className="text-gray-500">{isEn ? 'Location' : 'Localização'}: </span>
                <span>{product.location || (isEn ? 'Not informed' : 'Não informado')}</span>
              </div>
              {/* Linha 2: Peso, Categoria, Condição */}
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-700">
                <div>
                  <span className="text-gray-500">{isEn ? 'Weight' : 'Peso'}: </span>
                  <span>{product.weight ? `${product.weight} kg` : '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500">{isEn ? 'Category' : 'Categoria'}: </span>
                  <span>{getCategory(product.weight)}</span>
                </div>
                <div>
                  <span className="text-gray-500">{isEn ? 'Sale' : 'Condição'}: </span>
                  <span>{product.saleForm ? (product.saleForm === 'vivo' ? (isEn ? 'Live' : 'Vivo') : (isEn ? 'Carcass' : 'Carcaça')) : '—'}</span>
                </div>
              </div>
              {/* Linha 3: Raça e Idade */}
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
                <div>
                  <span className="text-gray-500">{isEn ? 'Breed' : 'Raça'}: </span>
                  <span>{product.breed || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500">{isEn ? 'Age' : 'Idade'}: </span>
                  <span>{product.age ? `${product.age} ${isEn ? 'months' : 'meses'}` : '—'}</span>
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
        hasPrevious={selectedProduct ? list.findIndex((p: Product) => p._id === selectedProduct._id) > 0 : false}
        hasNext={selectedProduct ? list.findIndex((p: Product) => p._id === selectedProduct._id) < list.length - 1 : false}
      />
    </>
  )
}