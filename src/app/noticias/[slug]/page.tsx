import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import News from '@/models/News'
import { formatDate } from '@/lib/utils'
import { BRAND_NAME } from '@/lib/brand'
import ViewCounter from './ViewCounter'
import { cookies } from 'next/headers'
import { resolveLocaleKey } from '@/lib/translation/config'

interface RouteParams {
  params: {
    slug: string
  }
}

// Gerar metadados dinâmicos para SEO
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const cookieLocale = cookies().get('locale')?.value || 'pt-AO'
  const localeKey = resolveLocaleKey(cookieLocale)
  const isEn = localeKey === 'en'
  try {
    await connectDB()
    // Tenta por slug base; se não, tenta por slug_i18n[locale]
    let news = await News.findOne({ slug: params.slug, published: true }).populate('author', 'name')
    if (!news) {
      const q: any = { published: true }
      q[`slug_i18n.${localeKey}`] = params.slug
      news = await News.findOne(q).populate('author', 'name')
    }
    if (!news) {
      return {
        title: isEn ? 'News not found' : 'Notícia não encontrada',
        description: isEn ? 'The requested news was not found' : 'A notícia solicitada não foi encontrada'
      }
    }

    return {
      title: `${(news as any).title_i18n?.[localeKey] || news.title} - ${BRAND_NAME}`,
      description: (news as any).excerpt_i18n?.[localeKey] || news.excerpt,
      alternates: {
        languages: {
          'pt': `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pt/noticias/${(news as any).slug_i18n?.pt || news.slug}`,
          'en': `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/en/news/${(news as any).slug_i18n?.en || (news as any).slug_i18n?.pt || news.slug}`
        }
      },
      openGraph: {
        title: (news as any).title_i18n?.[localeKey] || news.title,
        description: (news as any).excerpt_i18n?.[localeKey] || news.excerpt,
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
  const cookieLocale = cookies().get('locale')?.value || 'pt-AO'
  const localeKey = resolveLocaleKey(cookieLocale)
  const isEn = localeKey === 'en'
  try {
    await connectDB()
    let news: any = await News.findOne({ slug: params.slug, published: true }).populate('author', 'name avatar').lean()
    if (!news) {
      const q: any = { published: true }
      q[`slug_i18n.${localeKey}`] = params.slug
      news = await News.findOne(q).populate('author', 'name avatar').lean()
    }
    if (!news) {
      notFound()
    }
    if (Array.isArray(news)) {
      notFound()
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{news.title_i18n?.[localeKey] || news.title}</h1>
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

        {/* Imagem de destaque */}
        {news.featuredImage && (
          <div className="mb-8">
            <img src={news.featuredImage} alt={news.title_i18n?.[localeKey] || news.title} className="w-full h-64 md:h-96 object-cover rounded-lg" />
          </div>
        )}

        {/* Conteúdo da notícia */}
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: news.content_i18n?.[localeKey] || news.content }} />
        </div>
        {(news.meta_i18n?.autoTranslated?.body?.[localeKey] || news.meta_i18n?.autoTranslated?.summary?.[localeKey] || news.meta_i18n?.autoTranslated?.title?.[localeKey]) && (
          <div className="mt-3"><span className="inline-block px-2 py-1 text-xs rounded bg-amber-100 text-amber-800">{isEn ? 'Machine-translated (awaiting review)' : 'Tradução automática (aguarda revisão)'}</span></div>
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
    notFound()
  }
}