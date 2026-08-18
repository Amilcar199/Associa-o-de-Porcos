'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_PUBLIC_SITE_CONFIG, type PublicSiteConfig } from '@/lib/public-site-config'

export function useSiteConfig() {
  const [config, setConfig] = useState<PublicSiteConfig>(DEFAULT_PUBLIC_SITE_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/config', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          if (!cancelled && json?.data) {
            setConfig({ ...DEFAULT_PUBLIC_SITE_CONFIG, ...json.data })
          }
        }
      } catch {
        // defaults
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return { config, loading }
}
