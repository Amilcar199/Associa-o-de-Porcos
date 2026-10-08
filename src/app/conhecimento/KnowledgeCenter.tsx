'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { KNOWLEDGE_CATEGORIES, knowledgeLabel } from '@/lib/knowledge'

type KnowledgeItem = {
  _id: string
  title: string
  excerpt?: string
  slug?: string
  category?: string
  publishedAt?: string
}

export default function KnowledgeCenter({ items, isEn }: { items: KnowledgeItem[]; isEn: boolean }) {
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false
      if (!text) return true
      return `${item.title} ${item.excerpt || ''}`.toLowerCase().includes(text)
    })
  }, [items, category, query])

  return (
    <div className="container-custom py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="block w-full sm:max-w-sm">
          <span className="sr-only">{isEn ? 'Search' : 'Pesquisar'}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isEn ? 'Search title or summary' : 'Pesquisar título ou resumo'}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <p className="text-sm text-gray-500">
          {filtered.length} {isEn ? 'published items' : 'publicações'}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`rounded-full px-3 py-1 text-sm ${category === 'all' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          {isEn ? 'All' : 'Tudo'}
        </button>
        {KNOWLEDGE_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`rounded-full px-3 py-1 text-sm ${category === item.id ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {isEn ? item.en : item.pt}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-gray-600">
          {isEn
            ? 'There is no published material in this area yet.'
            : 'Ainda não há material publicado nesta área.'}
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const href = item.slug ? `/noticias/${item.slug}` : '/noticias'
            const date = item.publishedAt
              ? new Intl.DateTimeFormat(isEn ? 'en-GB' : 'pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(item.publishedAt))
              : ''
            return (
              <Link key={item._id} href={href} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-xs font-medium uppercase tracking-wide text-primary-700">
                  {knowledgeLabel(item.category || 'news', isEn)}
                </p>
                <h2 className="mt-2 font-heading text-lg font-semibold text-gray-900">{item.title}</h2>
                {item.excerpt && <p className="mt-2 line-clamp-3 text-sm text-gray-600">{item.excerpt}</p>}
                {date && <p className="mt-3 text-xs text-gray-500">{date}</p>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
