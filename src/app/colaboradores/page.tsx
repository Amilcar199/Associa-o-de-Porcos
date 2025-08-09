import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Colaboradores',
  description: 'Parceiros e colaboradores'
}

async function getCollaborators() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/collaborators`, { next: { revalidate: 60 } })
  if (!res.ok) return []
  const json = await res.json()
  return json.data || []
}

export default async function ColaboradoresPage() {
  const collaborators = await getCollaborators()

  return (
    <section className="container-custom py-12">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-6">Colaboradores</h1>
      {collaborators.length === 0 ? (
        <p className="text-gray-600">Nenhum colaborador cadastrado ainda.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {collaborators.map((c: any) => (
            <div key={c._id} className="bg-white rounded-xl shadow p-4">
              <div className="h-32 bg-gray-100 rounded mb-3" />
              <h3 className="font-semibold text-gray-900">{c.name}</h3>
              <p className="text-sm text-gray-600">{c.role} {c.company ? `• ${c.company}` : ''}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}