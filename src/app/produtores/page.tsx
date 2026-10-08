export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import InteractiveMapSection from '@/components/sections/PigMap/InteractiveMapSection'
import ProducersDirectory from './ProducersDirectory'

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Producers' : 'Produtores',
    description: isEn
      ? 'Approved pig farms in Angola, with province, municipality, herd and capacity.'
      : 'Fazendas de suínos aprovadas em Angola, com província, município, efectivo e capacidade.',
  }
}

export default function ProdutoresPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')

  return (
    <section>
      <div className="border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
        <div className="container-custom py-10">
          <h1 className="font-heading text-3xl font-bold text-primary-800">{isEn ? 'Producers' : 'Produtores'}</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            {isEn
              ? 'The national pig-farming map: approved producers and farms, by province and municipality, with herd, sows, boars, fattening pigs and capacity.'
              : 'O mapa nacional da suinocultura: produtores e fazendas aprovados, por província e município, com efectivo, matrizes, reprodutores, engorda e capacidade.'}
          </p>
        </div>
      </div>
      <ProducersDirectory />
      <InteractiveMapSection isEn={isEn} />
    </section>
  )
}
