import { Metadata } from 'next'
import connectDB from '@/lib/mongodb'
import News from '@/models/News'
import { formatDate } from '@/lib/utils'
import { BRAND_NAME } from '@/lib/brand'
import ViewCounter from './ViewCounter'
import { cookies } from 'next/headers'

interface RouteParams {
  params: {
    slug: string
  }
}

// Gerar metadados dinâmicos para SEO
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  try {
    await connectDB()
    const news = await News.findOne({ slug: params.slug, published: true }).populate('author', 'name')
    if (!news) {
      return {
        title: isEn ? 'News not found' : 'Notícia não encontrada',
        description: isEn ? 'The requested news was not found' : 'A notícia solicitada não foi encontrada'
      }
    }

    return {
      title: `${news.title} - ${BRAND_NAME}`,
      description: news.excerpt,
      openGraph: {
        title: news.title,
        description: news.excerpt,
        images: news.featuredImage ? [news.featuredImage] : [],
        type: 'article',
        publishedTime: news.publishedAt?.toISOString(),
        authors: news.author ? [news.author.name] : []
      }
    }
  } catch (error) {
    return {
      title: isEn ? 'Error loading news' : 'Erro ao carregar notícia',
      description: isEn ? 'An error occurred while loading the news' : 'Ocorreu um erro ao carregar a notícia'
    }
  }
}

// Gerar dados estáticos para notícias publicadas
export async function generateStaticParams() {
  try {
    await connectDB()
    const news = await News.find({ published: true }).select('slug').lean()
    return news.map((item) => ({ slug: item.slug }))
  } catch (error) {
    return []
  }
}

export default async function NewsPage({ params }: RouteParams) {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  try {
    await connectDB()
    const news = await News.findOne({ slug: params.slug, published: true }).populate('author', 'name avatar').lean()
    if (!news) {
      return (
        <article className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">{isEn ? 'News not found' : 'Notícia não encontrada'}</h1>
          <a href="/noticias" className="text-primary-600 hover:underline">{isEn ? 'Back to News' : 'Voltar para Notícias'}</a>
        </article>
      )
    }
    if (Array.isArray(news)) {
      return (
        <article className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">{isEn ? 'News not found' : 'Notícia não encontrada'}</h1>
          <a href="/noticias" className="text-primary-600 hover:underline">{isEn ? 'Back to News' : 'Voltar para Notícias'}</a>
        </article>
      )
    }

    return (
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header da notícia */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
              {news.category === 'news' ? (isEn ? 'News' : 'Notícias') :
               news.category === 'events' ? (isEn ? 'Events' : 'Eventos') :
               news.category === 'tips' ? (isEn ? 'Tips' : 'Dicas') :
               news.category === 'market' ? (isEn ? 'Market' : 'Mercado') : news.category}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{news.title}</h1>
          <div className="flex items-center space-x-4 text-gray-600 mb-6">
            {news.author && (
              <div className="flex items-center space-x-2">
                {news.author.avatar && (
                  <img src={news.author.avatar} alt={news.author.name} className="w-8 h-8 rounded-full" />
                )}
                <span>{news.author.name}</span>
              </div>
            )}
            {news.publishedAt && (
              <time dateTime={news.publishedAt.toISOString()}>{formatDate(news.publishedAt)}</time>
            )}
            <ViewCounter newsId={(news._id as any).toString()} initialViews={news.views || 0} />
          </div>
        </header>

        {/* Galeria de imagens */}
        {(news.images && news.images.length > 0) ? (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(news.images as string[]).map((url: string, idx: number) => (
              <img key={idx} src={url} alt={`${news.title} ${idx+1}`} className="w-full h-64 object-cover rounded-lg" />
            ))}
          </div>
        ) : (news.featuredImage && (
          <div className="mb-8">
            <img src={news.featuredImage} alt={news.title} className="w-full h-64 md:h-96 object-cover rounded-lg" />
          </div>
        ))}

        {/* Conteúdo da notícia */}
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: news.content }} />
        </div>

        {/* Vídeos */}
        {Array.isArray((news as any).videos) && (news as any).videos.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vídeos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {((news as any).videos as string[]).map((url: string, idx: number) => (
                <div key={idx} className="aspect-video bg-black/5 rounded-lg overflow-hidden">
                  {/^(https?:)?\/\//.test(url) && /youtube\.com|youtu\.be|vimeo\.com/.test(url) ? (
                    <iframe
                      src={url.includes('embed') ? url : url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`video-${idx}`}
                    />
                  ) : (
                    <video src={url} controls className="w-full h-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{isEn ? 'Tags:' : 'Tags:'}</h3>
            <div className="flex flex-wrap gap-2">
              {(news.tags as string[] || []).map((tag: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Botão voltar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <a href="/noticias" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            ← {isEn ? 'Back to News' : 'Voltar para Notícias'}
          </a>
        </div>
      </article>
    )
  } catch (error) {
    console.error('Erro ao carregar notícia:', error)
    return (
      <article className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Erro</h1>
        <a href="/noticias" className="text-primary-600 hover:underline">{isEn ? 'Back to News' : 'Voltar para Notícias'}</a>
      </article>
    )
  }
}