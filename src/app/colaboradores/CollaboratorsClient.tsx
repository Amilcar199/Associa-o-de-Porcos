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
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">Nenhum colaborador cadastrado ainda.</div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {list.map((c) => (
        <div key={c._id} className="bg-white rounded-2xl shadow hover:shadow-xl transition p-6 text-center">
          <div className="mx-auto w-44 h-44 md:w-56 md:h-56 rounded-full ring-4 ring-white shadow overflow-hidden bg-gray-100">
            <div className="relative w-full h-full">
              {(c as any)?.avatar && (
                <Image src={(c as any).avatar as string} alt={c.name} fill className="object-cover" />
              )}
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
  )
}

