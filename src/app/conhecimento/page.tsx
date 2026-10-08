export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import Link from 'next/link'
import KnowledgeCenter from './KnowledgeCenter'

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Knowledge centre' : 'Centro de conhecimento',
    description: isEn
      ? 'Public news, guides, manuals, studies and technical themes for pig farming. Member-only material stays in the members area.'
      : 'Notícias, guias, manuais, estudos e temas técnicos públicos da suinocultura. O material exclusivo continua na área de membros.',
  }
}

async function getPublishedNews() {
  try {
    const h = headers()
    const protocol = h.get('x-forwarded-proto') || 'http'
    const host = h.get('host') || 'localhost:3000'
    const res = await fetch(`${protocol}://${host}/api/news?limit=100`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.data) ? json.data : []
  } catch {
    return []
  }
}

export default async function ConhecimentoPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  const items = await getPublishedNews()

  return (
    <section>
      <div className="border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
        <div className="container-custom py-10">
          <h1 className="font-heading text-3xl font-bold text-primary-800">
            {isEn ? 'Knowledge centre' : 'Centro de conhecimento'}
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            {isEn
              ? 'Public material from the association: news, articles, technical guides, manuals, studies, legislation and the themes of nutrition, health, reproduction, biosecurity, management and training.'
              : 'O material público da associação: notícias, artigos, guias técnicos, manuais, estudos, legislação e os temas de nutrição, sanidade, reprodução, biossegurança, gestão e formação.'}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            {isEn ? 'Manuals, videos and files reserved for members stay in the ' : 'Manuais, vídeos e ficheiros reservados aos membros ficam na '}
            <Link href="/membros" className="font-medium text-primary-700 underline">
              {isEn ? 'members area' : 'área de membros'}
            </Link>
            .
          </p>
        </div>
      </div>
      <KnowledgeCenter items={items} isEn={isEn} />
    </section>
  )
}
