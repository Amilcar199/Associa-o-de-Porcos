export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import connectDB from '@/lib/mongodb'
import Farm from '@/models/Farm'
import User from '@/models/User'

function formatCount(value: number) {
  return new Intl.NumberFormat('pt-AO').format(value || 0)
}

function whatsappNumber(phone?: string) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('244') && digits.length >= 12) return digits
  if (digits.length === 9) return `244${digits}`
  return digits.length >= 10 ? digits : ''
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

  const owner = farm.owner
    ? await User.findById(farm.owner).select('verificationStatus').lean() as { verificationStatus?: string } | null
    : null
  const verified = owner?.verificationStatus === 'verified'
  const photos = Array.isArray(farm.photos) ? farm.photos.filter((item) => typeof item === 'string') : []
  const figures = [
    { label: isEn ? 'Total pigs' : 'Total de porcos', value: farm.herd?.total || 0 },
    { label: isEn ? 'Females' : 'Fêmeas', value: farm.herd?.females || 0 },
    { label: isEn ? 'For slaughter' : 'Para abate', value: farm.herd?.forSlaughter || 0 },
    { label: isEn ? 'For breeding' : 'Para reprodução', value: farm.herd?.forBreeding || 0 },
  ]
  const extras = [
    farm.production?.sows ? { label: isEn ? 'Sows' : 'Matrizes', value: farm.production.sows } : null,
    farm.production?.boars ? { label: isEn ? 'Boars' : 'Reprodutores', value: farm.production.boars } : null,
    farm.production?.fattening ? { label: isEn ? 'Fattening' : 'Engorda', value: farm.production.fattening } : null,
    farm.capacity ? { label: isEn ? 'Capacity' : 'Capacidade', value: farm.capacity } : null,
  ].filter((item): item is { label: string; value: number } => Boolean(item))

  return (
    <section className="container-custom py-10">
      <Link href="/produtores" className="text-sm font-medium text-primary-700">{isEn ? 'Back to producers' : 'Voltar aos produtores'}</Link>
      <h1 className="mt-3 font-heading text-3xl font-bold text-gray-900">{farm.producerName}</h1>
      {verified && <p className="mt-2 inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">{isEn ? 'Verified producer' : 'Produtor verificado'}</p>}
      <p className="mt-1 text-gray-600">{farm.farmName || (isEn ? 'Farm' : 'Fazenda')} · {farm.province}{farm.municipality ? ` · ${farm.municipality}` : ''}</p>

      <div className="mt-6 max-w-3xl rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="font-heading text-lg font-semibold text-gray-900">{isEn ? 'Contact' : 'Contacto'}</h2>
        {farm.phone || farm.email ? (
          <div className="mt-3 flex flex-wrap gap-3">
            {farm.phone && (
              <a href={`tel:${farm.phone}`} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                {isEn ? 'Call' : 'Ligar'} · {farm.phone}
              </a>
            )}
            {whatsappNumber(farm.phone) && (
              <a href={`https://wa.me/${whatsappNumber(farm.phone)}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                WhatsApp
              </a>
            )}
            {farm.email && (
              <a href={`mailto:${farm.email}`} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:border-primary-200">
                {farm.email}
              </a>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            {isEn ? 'This producer has not published a phone number or email yet.' : 'Este produtor ainda não publicou telefone nem email.'}
          </p>
        )}
      </div>

      {(farm.notes || farm.description) && (
        <div className="mt-6 max-w-3xl space-y-4">
          {farm.notes && (
            <div>
              <h2 className="font-heading text-lg font-semibold text-gray-900">{isEn ? 'Notes' : 'Observações'}</h2>
              <p className="mt-2 leading-relaxed text-gray-700">{farm.notes}</p>
            </div>
          )}
          {farm.description && (
            <div>
              <h2 className="font-heading text-lg font-semibold text-gray-900">{isEn ? 'Description' : 'Descrição'}</h2>
              <p className="mt-2 leading-relaxed text-gray-700">{farm.description}</p>
            </div>
          )}
        </div>
      )}

      <h2 className="mt-8 font-heading text-lg font-semibold text-gray-900">{isEn ? 'Herd' : 'Rebanho'}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {figures.map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatCount(item.value)}</p>
          </div>
        ))}
      </div>
      {extras.length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {extras.map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatCount(item.value)}</p>
            </div>
          ))}
        </div>
      )}

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
