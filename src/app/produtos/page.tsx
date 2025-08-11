export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Image from 'next/image'
import { Tag, Weight, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Produtos',
  description: 'Listagem de produtos disponíveis'
}

const placeholderImages = [
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1556229061-3f99a5d6c2ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1599327576016-7cc3f4f1bb4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
]

async function getProducts() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/products`, { next: { revalidate: 60 } })
  if (!res.ok) return []
  const json = await res.json()
  const data = json.data || []
  // Enriquecer com imagem fictícia se não houver
  const enriched = data.map((p: any, idx: number) => ({
    ...p,
    imageUrl: (Array.isArray(p.images) && p.images[0]) || p.imageUrl || placeholderImages[idx % placeholderImages.length]
  }))
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
}

export default async function ProdutosPage() {
  const products = await getProducts()

  return (
    <section className="">
      {/* Hero simples */}
      <div className="bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
        <div className="container-custom py-10">
          <h1 className="text-3xl font-heading font-bold text-primary-800">Produtos</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">Animais com procedência e qualidade. Imagens ilustrativas; consulte-nos para disponibilidade atual.</p>
        </div>
      </div>

      <div className="container-custom py-10">
        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">Nenhum produto disponível no momento.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p: any, idx: number) => (
              <div key={p._id || idx} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition">
                {/* Imagem */}
                <div className="relative h-48">
                  <Image
                    src={p.imageUrl}
                    alt={p.name || 'Produto'}
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
                    <div className="flex items-center gap-1"><Calendar size={14} className="text-primary-600" />{p.age ? `${p.age} meses` : '—'}</div>
                  </div>

                  {/* Ações */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Código: {p.code || p._id?.slice?.(0, 6) || '—'}</span>
                    <div className="flex items-center gap-3">
                      <a href="/contato" className="text-primary-700 hover:text-primary-800 font-medium text-sm">Entre em Contato</a>
                      <a href="tel:+244928476427" className="text-primary-700 hover:text-primary-800 font-medium text-sm">Ligue</a>
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