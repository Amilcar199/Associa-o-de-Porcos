export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import dynamicImport from 'next/dynamic'
const BolsaClient = dynamicImport(() => import('./BolsaClient'), { ssr: false })

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Pig Market' : 'Bolsa de Suínos',
    description: isEn ? 'Price board and indicators' : 'Quadro de preços e indicadores'
  }
}

export default function BolsaPage() {
  return (
    <section>
      <BolsaClient />
    </section>
  )
}

