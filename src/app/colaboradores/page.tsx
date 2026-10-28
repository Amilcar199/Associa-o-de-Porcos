export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import CollaboratorsClient from './CollaboratorsClient'
import PageHeader from '@/components/ui/PageHeader'

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Administrative Council' : 'Conselho Administrativo',
    description: isEn ? 'Administrative council members' : 'Membros do conselho administrativo'
  }
}

async function getCollaborators() {
  try {
    // Ensure ordering by importance (order asc)
    const res = await fetch(`/api/collaborators?sort=order&order=asc`, { cache: 'no-store', headers: { Accept: 'application/json' } })
    if (!res.ok) return []
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

export default async function ColaboradoresPage() {
  const collaborators = await getCollaborators()
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')

  return (
    <>
      <PageHeader
        eyebrow={isEn ? 'Association' : 'Associação'}
        title={isEn ? 'Administrative Council' : 'Conselho Administrativo'}
        description={isEn ? 'The people who lead the association and represent its members.' : 'Quem dirige a associação e representa os associados.'}
      />
      <section className="container-custom py-10 md:py-12">
        <CollaboratorsClient initial={collaborators} />
      </section>
    </>
  )
}