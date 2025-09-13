export const dynamic = 'force-dynamic'

import dynamic from 'next/dynamic'
const BolsaClient = dynamic(() => import('./BolsaClient'), { ssr: false })

export default function BolsaPage() {
  return (
    <section>
      <div className="container-custom py-8">
        <h1 className="text-2xl font-heading font-bold text-primary-800">Bolsa de Suínos</h1>
        <BolsaClient />
      </div>
    </section>
  )
}

