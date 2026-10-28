export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import Link from 'next/link'
import KnowledgeCenter from './KnowledgeCenter'
import PageHeader from '@/components/ui/PageHeader'

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
      <PageHeader
        title={isEn ? 'Knowledge centre' : 'Centro de conhecimento'}
        description={isEn ? 'Guides, manuals and public technical themes.' : 'Guias, manuais e temas técnicos públicos.'}
        actions={<Link href="/membros" className="text-sm font-semibold text-primary-700">{isEn ? 'Members area' : 'Área de membros'}</Link>}
      />
      <KnowledgeCenter items={items} isEn={isEn} />
    </section>
  )
}
