export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { cookies } from 'next/headers'

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Team' : 'Colaboradores',
    description: isEn ? 'Partners and collaborators' : 'Parceiros e colaboradores'
  }
}

async function getCollaborators() {
  try {
    const res = await fetch(`/api/collaborators`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' }
    })
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
          <h1 className="text-3xl font-heading font-bold text-primary-800">{isEn ? 'Team' : 'Colaboradores'}</h1>
          <p className="text-gray-600 mt-1">{isEn ? 'Partners that strengthen our association.' : 'Parceiros que fortalecem a nossa associação.'}</p>
        </div>
      </div>
      {collaborators.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">{isEn ? 'No collaborators registered yet.' : 'Nenhum colaborador cadastrado ainda.'}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborators.map((c: any) => (
            <div key={c._id} className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">
              <div className="h-40 bg-gray-100" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg">{c.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{c.role} {c.company ? `• ${c.company}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}