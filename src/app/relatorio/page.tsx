export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import nextDynamic from 'next/dynamic'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowLeft } from 'lucide-react'

const ReportClient = nextDynamic(() => import('./ReportClient'), { ssr: false })

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Market report' : 'Relatório da bolsa',
    description: isEn
      ? 'Downloadable pig price report by region, with averages and variations.'
      : 'Relatório de preços do suíno por região, com médias e variações, pronto para descarregar.'
  }
}

export default function RelatorioPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')

  return (
    <section>
      <div className="container-custom py-8">
        <Link
          href="/bolsa"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEn ? 'Back to the market' : 'Voltar à bolsa'}
        </Link>
        <h1 className="mt-3 text-2xl font-heading font-bold text-primary-800">
          {isEn ? 'Market report' : 'Relatório da bolsa'}
        </h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          {isEn
            ? 'A summary of pig prices for the chosen period: average, minimum and maximum by region, plus daily, weekly and monthly variation. Download it as PDF or CSV.'
            : 'Um resumo dos preços do suíno no período escolhido: média, mínimo e máximo por região, mais a variação diária, semanal e mensal. Descarregue em PDF ou CSV.'}
        </p>
        <div className="mt-6">
          <ReportClient />
        </div>
      </div>
    </section>
  )
}
