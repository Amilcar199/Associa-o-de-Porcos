export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Image from 'next/image'
import { Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Notícias',
  description: 'Últimas notícias e eventos'
}

const placeholderImages = [
  'https://images.unsplash.com/photo-1556229061-3f99a5d6c2ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1525498128493-380d1990a112?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
]

async function getNews() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/news`, { next: { revalidate: 60 } })
  if (!res.ok) return []
  const json = await res.json()
  const data = json.data || []
  const enriched = data.map((n: any, idx: number) => ({
    ...n,
    imageUrl: n.featuredImage || n.imageUrl || placeholderImages[idx % placeholderImages.length]
  }))
  if (enriched.length === 0) {
    return [
      {
        title: 'Programa de Boas Práticas na Suinocultura',
        excerpt: 'Iniciativa reforça capacitações e padrões de qualidade para elevar produtividade e bem‑estar animal.',
        publishedAtFormatted: new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }),
        imageUrl: placeholderImages[0]
      }
    ]
  }
  return enriched
}

export default async function NoticiasPage() {
  const news = await getNews()

  return (
    <section className="">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
        <div className="container-custom py-10">
          <h1 className="text-3xl font-heading font-bold text-primary-800">Notícias</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">Acompanhe novidades do setor e da associação. Imagens ilustrativas.</p>
        </div>
      </div>

      <div className="container-custom py-10">
        {news.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">Nenhuma notícia publicada no momento.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((n: any, idx: number) => (
              <article key={n._id || idx} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="relative h-44">
                  <Image
                    src={n.imageUrl}
                    alt={n.title || 'Notícia'}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{n.title}</h3>
                  {n.publishedAtFormatted && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} className="text-primary-600" />
                      <span>{n.publishedAtFormatted}</span>
                    </div>
                  )}
                  {n.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-3 mt-2">{n.excerpt}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}