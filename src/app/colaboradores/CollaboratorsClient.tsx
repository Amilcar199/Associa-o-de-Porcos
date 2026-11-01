'use client'

import React from 'react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import CouncilBoard, { type CouncilMember } from '@/components/sections/CouncilBoard'

export default function CollaboratorsClient({ initial }: { initial: CouncilMember[] }) {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')
  const [list, setList] = React.useState(initial || [])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if ((initial || []).length > 0) return
    let cancelled = false
    setLoading(true)
    fetch('/api/collaborators?limit=100&sort=order&order=asc', { cache: 'no-store' })
      .then((response) => response.json())
      .then((json) => { if (!cancelled) setList(Array.isArray(json?.data) ? json.data : []) })
      .catch(() => { if (!cancelled) setList([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [initial])

  if (loading && list.length === 0) {
    return (
      <section className="bg-gray-950 py-20">
        <div className="container-custom grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="aspect-[3/4] animate-pulse rounded-3xl bg-white/10" />)}
        </div>
      </section>
    )
  }

  if (list.length === 0) {
    return (
      <section className="bg-gray-950 py-20 text-center text-white/70">
        {isEn ? 'No council members yet.' : 'Ainda não há membros do conselho.'}
      </section>
    )
  }

  return <CouncilBoard members={list} isEn={isEn} />
}
