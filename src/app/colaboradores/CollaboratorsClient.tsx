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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white shadow-sm" />
        ))}
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">Nenhum colaborador cadastrado ainda.</div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((c: Collaborator) => (
        <div key={c._id} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md">
          <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-primary-50 md:h-32 md:w-32">
            <div className="relative h-full w-full">
              {(c as any)?.avatar && (
                <Image src={(c as any).avatar as string} alt={c.name} fill className="object-cover" />
              )}
              {!(c as any)?.avatar && <span className="flex h-full items-center justify-center text-3xl font-bold text-primary-700">{c.name.slice(0, 1).toUpperCase()}</span>}
            </div>
          </div>
          <h3 className="mt-4 font-heading text-lg font-semibold text-gray-900">{c.name}</h3>
          <p className="mt-1 text-sm text-gray-600">{c.role}{c.company ? ` • ${c.company}` : ''}</p>
          {(c as any)?.description && (
            <p className="mt-3 hidden text-sm leading-relaxed text-gray-600 line-clamp-3 sm:block">{(c as any).description}</p>
          )}
        </div>
      ))}
    </div>
  )
}

