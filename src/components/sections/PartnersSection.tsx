'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import CouncilBoard, { type CouncilMember } from '@/components/sections/CouncilBoard'

export default function PartnersSection() {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')
  const [members, setMembers] = useState<CouncilMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/collaborators?limit=3&sort=order&order=asc', { cache: 'no-store' })
      .then((response) => response.json())
      .then((json) => {
        if (!cancelled) setMembers(Array.isArray(json.data) ? json.data.slice(0, 3) : [])
      })
      .catch(() => { if (!cancelled) setMembers([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading || members.length === 0) return null
  return <CouncilBoard members={members} isEn={isEn} preview />
}
