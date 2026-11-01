'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { formatPrice, isExternalImageUrl, normalizeImageUrl } from '@/lib/utils'
import Placeholder from '@/components/assets/Foto Suino.webp'

type Pig = {
  _id: string
  name: string
  breed?: string
  location?: string
  weight?: number
  price?: number
  pricePerKg?: number
  saleForm?: string
  images?: string[]
}

function priceLabel(pig: Pig, locale: string, isEn: boolean) {
  const head = typeof pig.price === 'number' && pig.price > 0 ? `${formatPrice(pig.price, 'AOA', locale)} ${isEn ? '/head' : '/cabeça'}` : ''
  const kilo = typeof pig.pricePerKg === 'number' && pig.pricePerKg > 0 ? `${formatPrice(pig.pricePerKg, 'AOA', locale)} /kg` : ''
  if (pig.saleForm === 'carcaça') return kilo || head || (isEn ? 'On request' : 'Sob consulta')
  return head || kilo || (isEn ? 'On request' : 'Sob consulta')
}

function Thumb({ src, alt }: { src?: string; alt: string }) {
  const normalized = normalizeImageUrl(src)
  if (normalized && isExternalImageUrl(normalized)) {
    return <img src={normalized} alt={alt} className="h-full w-full object-cover" />
  }
  return <Image src={normalized || Placeholder} alt={alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 25vw" />
}

export default function LatestProducts() {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const [pigs, setPigs] = useState<Pig[]>([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/products?limit=3', { cache: 'no-store' })
      .then((response) => response.json())
      .then((json) => { if (!cancelled) setPigs(Array.isArray(json.data) ? json.data.slice(0, 3) : []) })
      .catch(() => { if (!cancelled) setPigs([]) })
    return () => { cancelled = true }
  }, [])

  return (
    <section className="bg-gray-50 py-10 md:py-14">
      <div className="container-custom">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
            {isEn ? 'Pigs for sale' : 'Suínos à venda'}
          </span>
          <h2 className="mb-4 font-heading text-3xl font-bold text-gray-900 lg:text-4xl">
            {isEn ? 'A look at the' : 'Uma vista dos'}
            <span className="text-gradient"> {isEn ? 'listings' : 'anúncios'}</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {isEn ? 'A few animals published by members. The full list is on the products page.' : 'Alguns animais publicados pelos associados. A lista completa está nos produtos.'}
          </p>
        </div>

        {pigs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            {isEn ? 'No pigs are published yet.' : 'Ainda não há suínos publicados.'}
          </p>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
            {pigs.map((pig) => (
              <Link key={pig._id} href="/produtos" className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="relative h-44">
                  <Thumb src={pig.images?.[0]} alt={pig.name} />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{pig.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{[pig.breed, pig.location].filter(Boolean).join(' · ')}</p>
                  <p className="mt-2 text-sm font-semibold text-primary-800">{priceLabel(pig, locale, isEn)}</p>
                  {typeof pig.weight === 'number' && pig.weight > 0 && (
                    <p className="mt-1 text-xs text-gray-500">{pig.weight} kg{pig.saleForm ? ` · ${pig.saleForm}` : ''}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/produtos" className="inline-flex items-center rounded-lg bg-primary-600 px-8 py-3 font-semibold text-white transition hover:bg-primary-700">
            {isEn ? 'See all pigs' : 'Ver todos os suínos'}
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}
