export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import CollaboratorsClient from './CollaboratorsClient'

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
    const res = await fetch(`/api/collaborators`, { cache: 'no-store', headers: { Accept: 'application/json' } })
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
    <section className="container-custom py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary-800">{isEn ? 'Administrative Council' : 'Conselho Administrativo'}</h1>
          <p className="text-gray-600 mt-1">{isEn ? 'Leaders who guide our association.' : 'Lideranças que orientam a nossa associação.'}</p>
        </div>
      </div>
      <CollaboratorsClient initial={collaborators} />
    </section>
  )
}