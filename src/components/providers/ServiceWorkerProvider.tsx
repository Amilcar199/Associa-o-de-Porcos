'use client'

import { useEffect } from 'react'

type Props = { children?: React.ReactNode }

async function getVapidPublicKey(): Promise<Uint8Array | null> {
  try {
    const res = await fetch('/api/push/public-key', { cache: 'no-store' })
    if (!res.ok) return null
    const { publicKey } = await res.json()
    if (!publicKey) return null
    const padding = '='.repeat((4 - (publicKey.length % 4)) % 4)
    const base64 = (publicKey + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  } catch {
    return null
  }
}

async function ensureSubscription(registration: ServiceWorkerRegistration) {
  try {
    const existing = await registration.pushManager.getSubscription()
    if (existing) return existing
    const vapidKey = await getVapidPublicKey()
    if (!vapidKey) return null
    return await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: (vapidKey as unknown as BufferSource) })
  } catch {
    return null
  }
}

export default function ServiceWorkerProvider({ children }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        if (Notification.permission !== 'granted') return
        const sub = await ensureSubscription(reg)
        if (!sub) return
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub }),
        })
      } catch {
        // noop
      }
    }

    register()
  }, [])

  return <>{children}</>
}

