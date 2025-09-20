export const dynamic = 'force-dynamic'
import nextDynamic from 'next/dynamic'
import { cookies } from 'next/headers'
const BolsaClient = nextDynamic(() => import('./BolsaClient'), { ssr: false })

export default function BolsaPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return (
    <section>
      <div className="container-custom py-8">
        <h1 className="text-2xl font-heading font-bold text-primary-800">{isEn ? 'Pig Market' : 'Bolsa de Suínos'}</h1>
        <BolsaClient />
      </div>
    </section>
  )
}

