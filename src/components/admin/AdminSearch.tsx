'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Modal from '@/components/admin/ui/Modal'

interface ProductItem { _id: string; name: string; breed?: string }
interface NewsItem { _id: string; title: string; category?: string }
interface ContactItem { _id: string; name: string; email: string; subject: string }

export default function AdminSearch() {
  const sp = useSearchParams()
  const router = useRouter()
  const q = useMemo(()=> sp.get('search')?.trim() || '', [sp])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<ProductItem[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [contacts, setContacts] = useState<ContactItem[]>([])

  useEffect(() => {
    if (!q) { setOpen(false); return }
    const load = async () => {
      try {
        setLoading(true)
        setOpen(true)
        const [pr, nr, cr] = await Promise.all([
          fetch(`/api/products?search=${encodeURIComponent(q)}&limit=5`),
          fetch(`/api/news?search=${encodeURIComponent(q)}&limit=5`),
          fetch(`/api/admin/contacts?search=${encodeURIComponent(q)}&limit=5`)
        ])
        if (pr.ok) { const j = await pr.json(); setProducts(j.data || j.data?.data || j.data?.results || j.data ?? []) }
        if (nr.ok) { const j = await nr.json(); setNews(j.data || j.data?.data || j.data?.results || j.data ?? []) }
        if (cr.ok) { const j = await cr.json(); setContacts(j.data || j.data?.data || j.data?.results || j.data ?? []) }
      } finally { setLoading(false) }
    }
    load()
  }, [q])

  const close = () => {
    setOpen(false)
    const url = new URL(window.location.href)
    url.searchParams.delete('search')
    router.replace(url.pathname + (url.search ? url.search : ''))
  }

  if (!q) return null

  return (
    <Modal isOpen={open} onClose={close} title={`Resultados para: "${q}"`} size="lg">
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className="space-y-6">
          <section>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Produtos</h4>
            {products.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum produto encontrado</p>
            ) : (
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                {products.map(p => (
                  <li key={p._id}>{p.name}{p.breed ? ` (${p.breed})` : ''}</li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Notícias</h4>
            {news.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma notícia encontrada</p>
            ) : (
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                {news.map(n => (
                  <li key={n._id}>{n.title}{n.category ? ` — ${n.category}` : ''}</li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Contatos</h4>
            {contacts.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma mensagem encontrada</p>
            ) : (
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                {contacts.map(c => (
                  <li key={c._id}>{c.name} &lt;{c.email}&gt; — {c.subject}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Modal>
  )
}