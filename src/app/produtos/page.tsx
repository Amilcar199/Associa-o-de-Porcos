export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Image from 'next/image'
import { Tag, Weight, Calendar } from 'lucide-react'
import { cookies } from 'next/headers'

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Products' : 'Produtos',
    description: isEn ? 'Available products list' : 'Listagem de produtos disponíveis'
  }
}

const placeholderImages = [
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1556229061-3f99a5d6c2ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1599327576016-7cc3f4f1bb4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
]

async function getProducts() {
  try {
    const res = await fetch(`/api/products`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    let data = json.data || []

    const currencyFormatter = new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    })

    let enriched = data.map((p: any, idx: number) => ({
      ...p,
      imageUrl: (p.images && p.images[0]) || p.imageUrl || placeholderImages[idx % placeholderImages.length],
      priceFormatted: p.priceFormatted || (typeof p.price === 'number' ? currencyFormatter.format(p.price) : undefined)
    }))

    // Fallback: se a lista geral vier vazia, tentar os "featured" (como na home)
    if (enriched.length === 0) {
      const resFeatured = await fetch(`/api/products/featured?limit=12`, { cache: 'no-store' })
      if (resFeatured.ok) {
        const jsonFeatured = await resFeatured.json()
        const dataFeatured = jsonFeatured.data || []
        enriched = dataFeatured.map((p: any, idx: number) => ({
          ...p,
          imageUrl: (p.images && p.images[0]) || p.imageUrl || placeholderImages[idx % placeholderImages.length],
          priceFormatted: p.priceFormatted || (typeof p.price === 'number' ? currencyFormatter.format(p.price) : undefined)
        }))
      }
    }

    if (enriched.length === 0) {
      return [
        {
          name: 'Suíno Reprodutor Duroc',
          breed: 'Duroc',
          weight: 80,
          age: 6,
          priceFormatted: 'AOA 120.000',
          code: 'DEMO-001',
          imageUrl: placeholderImages[0]
        }
      ]
    }
    return enriched
  } catch (e) {
    console.error('Falha ao carregar produtos:', e)
    return []
  }
}

export default async function ProdutosPage() {
  const products = await getProducts()
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')

  return (
    <section className="">
      {/* Hero simples */}
      <div className="bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
        <div className="container-custom py-10">
          <h1 className="text-3xl font-heading font-bold text-primary-800">{isEn ? 'Products' : 'Produtos'}</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">{isEn ? 'Animals with origin and quality. Illustrative images; contact us for current availability.' : 'Animais com procedência e qualidade. Imagens ilustrativas; consulte-nos para disponibilidade atual.'}</p>
        </div>
      </div>

      <div className="container-custom py-10">
        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">{isEn ? 'No products available at the moment.' : 'Nenhum produto disponível no momento.'}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p: any, idx: number) => (
              <div key={p._id || idx} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition">
                {/* Imagem */}
                <div className="relative h-48">
                  <Image
                    src={p.imageUrl}
                    alt={p.name || (isEn ? 'Product' : 'Produto')}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                  {/* Badge de preço */}
                  {p.priceFormatted && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary-700 text-sm font-semibold shadow">
                      {p.priceFormatted}
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{p.name}</h3>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1"><Tag size={14} className="text-primary-600" />{p.breed || '—'}</div>
                    <div className="flex items-center gap-1"><Weight size={14} className="text-primary-600" />{p.weight ? `${p.weight} kg` : '—'}</div>
                    <div className="flex items-center gap-1"><Calendar size={14} className="text-primary-600" />{p.age ? `${p.age} ${isEn ? 'months' : 'meses'}` : '—'}</div>
                  </div>

                  {/* Ações */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{isEn ? 'Code' : 'Código'}: {p.code || p._id?.slice?.(0, 6) || '—'}</span>
                    <div className="flex items-center gap-3">
                      <a href="/contato" className="text-primary-700 hover:text-primary-800 font-medium text-sm">{isEn ? 'Contact us' : 'Entre em Contato'}</a>
                      <a href="tel:+244928476427" className="text-primary-700 hover:text-primary-800 font-medium text-sm">{isEn ? 'Call' : 'Ligue'}</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}