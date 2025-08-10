export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notícias',
  description: 'Últimas notícias e eventos'
}

async function getNews() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/news`, { next: { revalidate: 60 } })
  if (!res.ok) return []
  const json = await res.json()
  return json.data || []
}

export default async function NoticiasPage() {
  const news = await getNews()

  return (
    <section className="container-custom py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary-800">Notícias</h1>
          <p className="text-gray-600 mt-1">Acompanhe as novidades do setor e da associação.</p>
        </div>
      </div>
      {news.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">Nenhuma notícia publicada no momento.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((n: any) => (
            <article key={n._id} className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">
              <div className="h-44 bg-gray-100" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg">{n.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mt-1">{n.excerpt}</p>
                <p className="text-xs text-gray-500 mt-3">{n.publishedAtFormatted}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}