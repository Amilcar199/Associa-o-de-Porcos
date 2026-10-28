export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import InteractiveMapSection from '@/components/sections/PigMap/InteractiveMapSection'
import ProducersDirectory from './ProducersDirectory'
import PageHeader from '@/components/ui/PageHeader'

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
      <PageHeader
        title={isEn ? 'Producers' : 'Produtores'}
        description={isEn ? 'Approved farms on the map, by province and municipality.' : 'Fazendas aprovadas no mapa, por província e município.'}
      />
      <InteractiveMapSection isEn={isEn} />
      <ProducersDirectory />
    </section>
  )
}
