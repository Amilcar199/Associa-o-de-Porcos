'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CookieConsentProvider from '@/components/cookies/CookieConsentProvider'
import GoogleAnalytics from '@/components/providers/GoogleAnalytics'

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <CookieConsentProvider>
      <div className="flex flex-col min-h-screen">
        {/* GA4 loads only when analytics consent is granted */}
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </CookieConsentProvider>
  )
}