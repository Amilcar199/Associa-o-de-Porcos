'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface Offer {
  _id: string
  name: string
  breed?: string
  price?: number
  pricePerKg?: number
  location?: string
}

export default function OfferRail() {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/products/featured?limit=3', { cache: 'no-store' })
        const json = res.ok ? await res.json() : { data: [] }
        if (!cancelled) setOffers(Array.isArray(json.data) ? json.data.slice(0, 3) : [])
      } catch {
        if (!cancelled) setOffers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const priceOf = (offer: Offer) => {
    if (typeof offer.pricePerKg === 'number' && offer.pricePerKg > 0) {
      return `${formatPrice(offer.pricePerKg, 'AOA', locale)} /kg`
    }
    if (typeof offer.price === 'number') {
      return `${formatPrice(offer.price, 'AOA', locale)} ${isEn ? '/head' : '/cabeça'}`
    }
    return isEn ? 'On request' : 'Sob consulta'
  }

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-gray-900">{isEn ? 'Where to buy' : 'Onde comprar'}</h2>
          <p className="mt-1 text-sm text-gray-600">{isEn ? 'Prices in view, from members.' : 'Preços em destaque, de associados.'}</p>
        </div>
        <Link href="/produtos" className="shrink-0 text-sm font-semibold text-primary-700 hover:text-primary-800">
          {isEn ? 'See all' : 'Ver todos'}
        </Link>
      </div>

      <div className="mt-4 divide-y divide-gray-100">
        {loading && [0, 1, 2].map((item) => (
          <div key={item} className="py-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="mt-2 h-5 w-1/3 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
        {!loading && offers.length === 0 && (
          <p className="py-6 text-sm text-gray-500">{isEn ? 'No animals listed right now.' : 'Não há animais anunciados neste momento.'}</p>
        )}
        {!loading && offers.map((offer) => (
          <Link key={offer._id} href="/produtos" className="block py-3 hover:bg-gray-50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{offer.name}</p>
                <p className="truncate text-xs text-gray-500">{[offer.breed, offer.location].filter(Boolean).join(' · ') || (isEn ? 'Member listing' : 'Anúncio de associado')}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-primary-800">{priceOf(offer)}</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  )
}
