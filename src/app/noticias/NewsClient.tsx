'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Calendar, Eye } from 'lucide-react'
import NewsModal from '@/components/modals/NewsModal'

interface NewsItem {
  _id: string
  title: string
  excerpt?: string
  featuredImage?: string
  imageUrl?: string
  slug?: string
  author?: { name?: string }
  category?: string
  publishedAt?: string
  publishedAtFormatted?: string
  views?: number
  content?: string
}

export default function NewsClient({ news, isEn }: { news: NewsItem[]; isEn: boolean }) {
  const [list, setList] = useState<NewsItem[]>(news)
  const [selected, setSelected] = useState<NewsItem | null>(null)
  const [open, setOpen] = useState(false)
  const [incremented, setIncremented] = useState<Record<string, boolean>>({})

  const isValidObjectId = (id?: string) => !!id && /^[a-fA-F0-9]{24}$/.test(id)

  const openModal = (n: NewsItem) => {
    setSelected(n)
    setOpen(true)
    // Incrementa visualizações uma vez por item
    const key = n._id || n.slug || ''
    if (key && !incremented[key]) {
      incrementViews(n).catch(() => {})
    }
  }
  const closeModal = () => {
    setOpen(false)
    setSelected(null)
  }
  const incrementViews = async (n: NewsItem) => {
    try {
      let newViews: number | undefined
      if (isValidObjectId(n._id)) {
        const resp = await fetch(`/api/news/${n._id}/views`, { method: 'POST' })
        if (resp.ok) {
          const j = await resp.json()
          newViews = j?.data?.views
        }
      } else if (n.slug) {
        const resp = await fetch(`/api/news?slug=${encodeURIComponent(n.slug)}`, { cache: 'no-store' })
        if (resp.ok) {
          const j = await resp.json()
          newViews = j?.data?.views
        }
      }
      if (typeof newViews === 'number') {
        const key = n._id || n.slug || ''
        setIncremented(prev => ({ ...prev, [key]: true }))
        setList(prev => prev.map(item => (item._id === n._id ? { ...item, views: newViews } : item)))
        setSelected(prev => (prev ? { ...prev, views: newViews } : prev))
      }
    } catch {
      // Silencia falhas de rede sem quebrar a UI
    }
  }
  const goPrev = () => {
    if (!selected) return
    const idx = list.findIndex(n => n._id === selected._id)
    if (idx > 0) setSelected(list[idx - 1])
  }
  const goNext = () => {
    if (!selected) return
    const idx = list.findIndex(n => n._id === selected._id)
    if (idx < list.length - 1) setSelected(list[idx + 1])
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((n, idx) => (
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
        hasPrevious={selected ? list.findIndex(n => n._id === selected._id) > 0 : false}
        hasNext={selected ? list.findIndex(n => n._id === selected._id) < list.length - 1 : false}
      />
    </>
  )
}

