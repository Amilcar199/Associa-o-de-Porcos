export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import ProductsClient from '@/app/produtos/ProductsClient'

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
    const h = headers()
    const protocol = h.get('x-forwarded-proto') || 'http'
    const host = h.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`

    const cfgRes = await fetch(`${baseUrl}/api/admin/config`, { cache: 'no-store' })
    const cfgJson = cfgRes.ok ? await cfgRes.json() : { data: {} }
    const currency = cfgJson?.data?.currency || 'AOA'
    const locale = cfgJson?.data?.locale || 'pt-AO'

    const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    let data = json.data || []

    const currencyFormatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    })

    let enriched = data.map((p: any, idx: number) => ({
      ...p,
      imageUrl: (p.images && p.images[0]) || p.imageUrl || placeholderImages[idx % placeholderImages.length],
      priceFormatted: p.priceFormatted || (typeof p.price === 'number' ? currencyFormatter.format(p.price) : undefined)
    }))

    // Fallback: se a lista geral vier vazia, tentar os "featured" (como na home)
    if (enriched.length === 0) {
      const resFeatured = await fetch(`${baseUrl}/api/products/featured?limit=12`, { cache: 'no-store' })
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
          priceFormatted: currencyFormatter.format(120000),
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
  const normalizedProducts = (products || []).map((p: any, idx: number) => ({
    ...p,
    _id: p._id || p.code || String(idx),
    age: typeof p.age === 'number' ? p.age : 0,
    weight: typeof p.weight === 'number' ? p.weight : 0,
  }))

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
        {normalizedProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">{isEn ? 'No products available at the moment.' : 'Nenhum produto disponível no momento.'}</div>
        ) : (
          <ProductsClient products={normalizedProducts} />
        )}
      </div>
    </section>
  )
}