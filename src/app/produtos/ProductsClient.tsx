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
  const [list, setList] = useState<Product[]>(products || [])
  const [query, setQuery] = useState('')
  const [health, setHealth] = useState<string>('')
  const [vaccinated, setVaccinated] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [minWeight, setMinWeight] = useState<string>('')
  const [maxAge, setMaxAge] = useState<string>('')

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
    const currentIndex = list.findIndex(p => p._id === selectedProduct._id)
    if (currentIndex > 0) {
      setSelectedProduct(list[currentIndex - 1])
    }
  }

  const goToNextProduct = () => {
    if (!selectedProduct) return
    const currentIndex = list.findIndex(p => p._id === selectedProduct._id)
    if (currentIndex < list.length - 1) {
      setSelectedProduct(list[currentIndex + 1])
    }
  }

  const filtered = list.filter(p => {
    if (query && !(`${p.name} ${p.breed} ${p.description || ''}`.toLowerCase().includes(query.toLowerCase()))) return false
    if (health && p.healthStatus !== health) return false
    if (vaccinated && String(!!p.vaccinated) !== vaccinated) return false
    if (maxPrice && typeof p.price === 'number' && p.price > Number(maxPrice)) return false
    if (minWeight && typeof p.weight === 'number' && p.weight < Number(minWeight)) return false
    if (maxAge && typeof p.age === 'number' && p.age > Number(maxAge)) return false
    return true
  })

  return (
    <>
      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
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
          <input type="number" min="0" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder={isEn ? 'Max price' : 'Preço máx.'} className="px-3 py-2 border rounded-lg" />
          <input type="number" min="0" value={minWeight} onChange={e=>setMinWeight(e.target.value)} placeholder={isEn ? 'Min weight (kg)' : 'Peso mín. (kg)'} className="px-3 py-2 border rounded-lg" />
          <input type="number" min="0" value={maxAge} onChange={e=>setMaxAge(e.target.value)} placeholder={isEn ? 'Max age (months)' : 'Idade máx. (meses)'} className="px-3 py-2 border rounded-lg" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(query || health || vaccinated || maxPrice || minWeight || maxAge) && (
            <button onClick={()=>{ setQuery(''); setHealth(''); setVaccinated(''); setMaxPrice(''); setMinWeight(''); setMaxAge('') }} className="text-sm px-3 py-1.5 rounded border text-gray-700 hover:bg-gray-50">{isEn ? 'Clear filters' : 'Limpar filtros'}</button>
          )}
          <span className="text-sm text-gray-500 ml-auto">{isEn ? 'Results' : 'Resultados'}: {filtered.length}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product, idx) => (
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
                        (()=>{ convertAndFormat((product.price as number) || 0, currency, 'USD', locale).then(f=>setConvertedCache(prev=>({...prev, [String(product._id)]: f })) ); return formatPrice((product.price as number) || 0, currency, locale) })()
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
                {((product as any).name_i18n?.[isEn ? 'en' : 'pt']) || product.name}
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
        hasPrevious={selectedProduct ? list.findIndex(p => p._id === selectedProduct._id) > 0 : false}
        hasNext={selectedProduct ? list.findIndex(p => p._id === selectedProduct._id) < list.length - 1 : false}
      />
    </>
  )
}