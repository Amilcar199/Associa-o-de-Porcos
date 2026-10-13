'use client'

import { useEffect, useState } from 'react'

export interface AdminStatsPayload {
  overview: {
    totalUsers: number
    totalProducts: number
    totalNews: number
    totalContacts: number
    newContactsThisMonth: number
    usersThisMonth: number
    productsThisMonth: number
    newsThisMonth: number
    activeProducts: number
    publishedNews: number
  }
  charts: {
    productsByBreed: Array<{ name: string; value: number }>
    newsByCategory: Array<{ name: string; value: number }>
    topNews: Array<{ title: string; views: number; publishedAt: string }>
  }
  reports: Array<{
    title: string
    items: Array<{ label: string; value: number }>
  }>
}

let cache: { at: number; data: AdminStatsPayload } | null = null
let inflight: Promise<AdminStatsPayload | null> | null = null

export function loadAdminStats(): Promise<AdminStatsPayload | null> {
  if (cache && Date.now() - cache.at < 20000) return Promise.resolve(cache.data)
  if (inflight) return inflight

  inflight = fetch('/api/admin/stats')
    .then(async (response) => {
      if (!response.ok) return null
      const json = await response.json()
      const data = json.data as AdminStatsPayload
      cache = { at: Date.now(), data }
      return data
    })
    .catch(() => null)
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function reportValue(stats: AdminStatsPayload | null, title: string, label: string) {
  const group = stats?.reports?.find((item) => item.title === title)
  return group?.items.find((item) => item.label === label)?.value ?? 0
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStatsPayload | null>(cache?.data ?? null)
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    let alive = true
    loadAdminStats().then((data) => {
      if (!alive) return
      setStats(data)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  return { stats, loading }
}
