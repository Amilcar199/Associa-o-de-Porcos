'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Collaborator {
  _id: string
  name: string
  role: string
  company?: string
  description?: string
}

export default function CollaboratorsClient({ initial }: { initial: Collaborator[] }) {
  const [list, setList] = useState<Collaborator[]>(initial || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ((initial || []).length > 0) return
    setLoading(true)
    ;(async()=>{
      try {
        const res = await fetch('/api/collaborators?limit=100', { cache: 'no-store' })
        const json = res.ok ? await res.json() : { data: [] }
        setList(Array.isArray(json?.data) ? json.data : [])
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
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((c) => (
        <div key={c._id} className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">
          <div className="relative h-40 bg-gray-100">
            {c as any && (c as any).avatar ? (
              <Image src={(c as any).avatar as string} alt={c.name} fill className="object-cover" />
            ) : null}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 text-lg">{c.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{c.role}{c.company ? ` • ${c.company}` : ''}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

