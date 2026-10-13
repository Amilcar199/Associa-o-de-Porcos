export const dynamic = 'force-dynamic'
import nextDynamic from 'next/dynamic'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { FileDown } from 'lucide-react'
const BolsaClient = nextDynamic(() => import('./BolsaClient'), { ssr: false })

export default function BolsaPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return (
    <section>
      <div className="container-custom py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-primary-800">{isEn ? 'Pig Market' : 'Bolsa de Suínos'}</h1>
            <p className="mt-2 max-w-2xl text-gray-600">{isEn ? 'The pig price reference: average, minimum and maximum from public listings, with the date and the source of each figure.' : 'A referência de preço do suíno: média, mínimo e máximo dos anúncios públicos, com a data e a origem de cada valor.'}</p>
          </div>
          <Link
            href="/relatorio"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileDown className="h-4 w-4" />
            {isEn ? 'Market report' : 'Relatório da bolsa'}
          </Link>
        </div>
        <BolsaClient />
      </div>
    </section>
  )
}

