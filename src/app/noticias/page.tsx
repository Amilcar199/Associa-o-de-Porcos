export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { BRAND_NAME } from '@/lib/brand'
import { headers } from 'next/headers'
 
import { cookies } from 'next/headers'
import NewsClient from '@/app/noticias/NewsClient'
import { localizeNews } from '@/lib/i18n/content'

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'News' : 'Notícias',
    description: isEn ? 'Latest news and events' : 'Últimas notícias e eventos'
  }
}

const placeholderImages = [
  'https://images.unsplash.com/photo-1556229061-3f99a5d6c2ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1525498128493-380d1990a112?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
]

async function getNews(locale: string) {
  try {
    const h = headers()
    const protocol = h.get('x-forwarded-proto') || 'http'
    const host = h.get('host') || 'assuino.com'
    const baseUrl = `${protocol}://${host}`

    const res = await fetch(`${baseUrl}/api/news`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    const data = json.data || []

    const enriched = data.map((n: any, idx: number) => ({
      ...localizeNews(n, locale),
      imageUrl: n.featuredImage || n.imageUrl || placeholderImages[idx % placeholderImages.length],
      publishedAtFormatted:
        n.publishedAtFormatted || (n.publishedAt
          ? new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(n.publishedAt))
          : undefined)
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
  } catch (e) {
    console.error('Falha ao carregar notícias:', e)
    return []
  }
}

export default async function NoticiasPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  const news = await getNews(locale)

  return (
    <section className="">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
        <div className="container-custom py-10">
          <h1 className="text-3xl font-heading font-bold text-primary-800">{isEn ? 'News' : 'Notícias'}</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">{isEn ? 'Follow news from the sector and the association. Illustrative images.' : 'Acompanhe novidades do setor e da associação. Imagens ilustrativas.'}</p>
        </div>
      </div>

      <div className="container-custom py-10">
        {news.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">{isEn ? 'No news published at the moment.' : 'Nenhuma notícia publicada no momento.'}</div>
        ) : (
          <NewsClient news={news.map((n: any, idx: number) => ({ ...n, _id: n._id || n.slug || String(idx) }))} isEn={isEn} />
        )}
      </div>
    </section>
  )
}