'use client'

import React, { useEffect, useRef } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCookieConsent } from '@/components/cookies/CookieConsentProvider'

type GoogleAnalyticsProps = {
  measurementId: string
}

// This component injects GA4 only when analytics consent is granted.
export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const { consent } = useCookieConsent()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasInitializedRef = useRef(false)
  const hasMeasurementId = typeof measurementId === 'string' && measurementId.trim().length > 0
  const analyticsAllowed = consent.analytics === true && hasMeasurementId

  useEffect(() => {
    // Reset init flag when consent toggles
    hasInitializedRef.current = false
  }, [analyticsAllowed])

  useEffect(() => {
    if (!analyticsAllowed) return
    if (typeof window === 'undefined') return
    if (!(window as any).gtag) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    ;(window as any).gtag('event', 'page_view', {
      page_path: pathname,
      page_location: url,
    })
  }, [analyticsAllowed, pathname, searchParams])

  if (!analyticsAllowed) return null

  return (
    <>
      <Script
        id="ga4-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} 
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true, send_page_view: false });
        `}
      </Script>
    </>
  )
}

