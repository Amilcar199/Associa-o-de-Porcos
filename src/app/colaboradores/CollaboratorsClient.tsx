'use client'

import React from 'react'
import Image from 'next/image'

interface Collaborator {
  _id: string
  name: string
  role: string
  company?: string
  description?: string
}

export default function CollaboratorsClient({ initial }: { initial: Collaborator[] }) {
  const [list, setList] = React.useState((initial || []) as Collaborator[])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if ((initial || []).length > 0) return
    setLoading(true)
    ;(async()=>{
      try {
        const res = await fetch('/api/collaborators?limit=100', { cache: 'no-store' })
        const json = res.ok ? await res.json() : { data: [] }
        setList((Array.isArray(json?.data) ? json.data : []) as Collaborator[])
      } catch {
        setList([])
      } finally {
        setLoading(false)
      }
    })()
  }, [initial])

  if (loading && list.length === 0) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse h-40" />
        ))}
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-600">Nenhum colaborador cadastrado ainda.</div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((c: Collaborator) => (
            <div key={c._id} className="bg-white rounded-2xl shadow hover:shadow-xl transition p-6 text-center">
              <div className="mx-auto h-36 w-36 overflow-hidden rounded-full bg-primary-50 ring-4 ring-white shadow md:h-40 md:w-40">
                <div className="relative w-full h-full">
                  {(c as any)?.avatar && (
                    <Image src={(c as any).avatar as string} alt={c.name} fill className="object-cover" />
                  )}
                  {!(c as any)?.avatar && <span className="flex h-full items-center justify-center text-3xl font-bold text-primary-700">{c.name.slice(0, 1).toUpperCase()}</span>}
                </div>
              </div>
              <h3 className="mt-6 font-bold text-lg text-gray-900">{c.name}</h3>
              <p className="text-sm text-gray-600">{c.role}{c.company ? ` • ${c.company}` : ''}</p>
              {(c as any)?.description && (
                <p className="text-sm text-gray-700 leading-relaxed mt-3 line-clamp-3">{(c as any).description}</p>
              )}
            </div>
          ))}
        </div>
    </div>
  )
}

