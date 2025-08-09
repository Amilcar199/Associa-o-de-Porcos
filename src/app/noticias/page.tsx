import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notícias',
  description: 'Últimas notícias e eventos'
}

async function getNews() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/news`, { next: { revalidate: 60 } })
  if (!res.ok) return []
  const json = await res.json()
  return json.data || []
}

export default async function NoticiasPage() {
  const news = await getNews()

  return (
    <section className="container-custom py-12">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-6">Notícias</h1>
      {news.length === 0 ? (
        <p className="text-gray-600">Nenhuma notícia publicada no momento.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {news.map((n: any) => (
            <article key={n._id} className="bg-white rounded-xl shadow p-4">
              <div className="h-40 bg-gray-100 rounded mb-3" />
              <h3 className="font-semibold text-gray-900">{n.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{n.excerpt}</p>
              <p className="text-xs text-gray-500 mt-2">{n.publishedAtFormatted}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}