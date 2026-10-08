export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import connectDB from '@/lib/mongodb'
import Farm from '@/models/Farm'

function formatCount(value: number) {
  return new Intl.NumberFormat('pt-AO').format(value || 0)
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (!/^[a-f\d]{24}$/i.test(params.id)) return { title: 'Produtor' }
  await connectDB()
  const farm = await Farm.findOne({ _id: params.id, status: 'approved', isActive: true }).select('producerName').lean()
  return { title: farm?.producerName || 'Produtor' }
}

export default async function ProducerProfilePage({ params }: { params: { id: string } }) {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  if (!/^[a-f\d]{24}$/i.test(params.id)) notFound()

  await connectDB()
  const farm = await Farm.findOne({ _id: params.id, status: 'approved', isActive: true }).lean()
  if (!farm) notFound()

  const photos = Array.isArray(farm.photos) ? farm.photos.filter((item) => typeof item === 'string') : []
  const figures = [
    { label: isEn ? 'Pigs' : 'Suínos', value: farm.herd?.total || 0 },
    { label: isEn ? 'Sows' : 'Matrizes', value: farm.production?.sows || 0 },
    { label: isEn ? 'Boars' : 'Reprodutores', value: farm.production?.boars || 0 },
    { label: isEn ? 'Fattening' : 'Engorda', value: farm.production?.fattening || 0 },
    { label: isEn ? 'For slaughter' : 'Para abate', value: farm.herd?.forSlaughter || 0 },
    { label: isEn ? 'Capacity' : 'Capacidade', value: farm.capacity || 0 },
  ]

  return (
    <section className="container-custom py-10">
      <Link href="/produtores" className="text-sm font-medium text-primary-700">{isEn ? 'Back to producers' : 'Voltar aos produtores'}</Link>
      <h1 className="mt-3 font-heading text-3xl font-bold text-gray-900">{farm.producerName}</h1>
      <p className="mt-1 text-gray-600">{farm.farmName || (isEn ? 'Farm' : 'Fazenda')} · {farm.province}{farm.municipality ? ` · ${farm.municipality}` : ''}</p>
      {farm.description && <p className="mt-4 max-w-3xl leading-relaxed text-gray-700">{farm.description}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {figures.map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{item.label === (isEn ? 'Capacity' : 'Capacidade') && !farm.capacity ? '—' : formatCount(item.value)}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-heading text-xl font-semibold text-gray-900">{isEn ? 'Photos' : 'Fotos'}</h2>
      {photos.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">{isEn ? 'This farm has no published photos yet.' : 'Esta fazenda ainda não tem fotos publicadas.'}</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((url) => (
            <img key={url} src={url} alt={farm.producerName} className="h-56 w-full rounded-2xl object-cover" />
          ))}
        </div>
      )}
    </section>
  )
}
