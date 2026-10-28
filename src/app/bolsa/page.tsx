export const dynamic = 'force-dynamic'
import nextDynamic from 'next/dynamic'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { FileDown } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
const BolsaClient = nextDynamic(() => import('./BolsaClient'), { ssr: false })

export default function BolsaPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return (
    <>
      <PageHeader
        title={isEn ? 'Pig market' : 'Bolsa de suínos'}
        description={isEn ? 'Average, minimum and maximum from public listings.' : 'Média, mínimo e máximo dos anúncios públicos.'}
        actions={
          <Link href="/relatorio" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <FileDown className="h-4 w-4" />
            {isEn ? 'Report' : 'Relatório'}
          </Link>
        }
      />
      <div className="container-custom py-8">
        <BolsaClient />
      </div>
    </>
  )
}

