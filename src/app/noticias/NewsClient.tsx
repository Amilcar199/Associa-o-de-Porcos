'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Calendar, Eye } from 'lucide-react'
import NewsModal from '@/components/modals/NewsModal'

interface NewsItem {
  _id: string
  title: string
  excerpt?: string
  featuredImage?: string
  imageUrl?: string
  author?: { name?: string }
  category?: string
  publishedAt?: string
  publishedAtFormatted?: string
  views?: number
  content?: string
}

export default function NewsClient({ news, isEn }: { news: NewsItem[]; isEn: boolean }) {
  const [selected, setSelected] = useState<NewsItem | null>(null)
  const [open, setOpen] = useState(false)

  const openModal = (n: NewsItem) => {
    setSelected(n)
    setOpen(true)
  }
  const closeModal = () => {
    setOpen(false)
    setSelected(null)
  }
  const goPrev = () => {
    if (!selected) return
    const idx = news.findIndex(n => n._id === selected._id)
    if (idx > 0) setSelected(news[idx - 1])
  }
  const goNext = () => {
    if (!selected) return
    const idx = news.findIndex(n => n._id === selected._id)
    if (idx < news.length - 1) setSelected(news[idx + 1])
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((n, idx) => (
          <article
            key={n._id || idx}
            onClick={() => openModal(n)}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="relative h-44">
              <Image
                src={n.featuredImage || n.imageUrl || ''}
                alt={n.title || (isEn ? 'News' : 'Notícia')}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{n.title}</h3>
              {(n.publishedAtFormatted || n.publishedAt) && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} className="text-primary-600" />
                  <span>{n.publishedAtFormatted}</span>
                  {typeof n.views === 'number' && (
                    <span className="ml-3 inline-flex items-center gap-1"><Eye size={14} className="text-primary-600" />{n.views}</span>
                  )}
                </div>
              )}
              {n.excerpt && (
                <p className="text-sm text-gray-600 line-clamp-3 mt-2">{n.excerpt}</p>
              )}
            </div>
          </article>
        ))}
      </div>

      <NewsModal
        isOpen={open}
        onClose={closeModal}
        news={selected}
        onPrevious={goPrev}
        onNext={goNext}
        hasPrevious={selected ? news.findIndex(n => n._id === selected._id) > 0 : false}
        hasNext={selected ? news.findIndex(n => n._id === selected._id) < news.length - 1 : false}
      />
    </>
  )
}

