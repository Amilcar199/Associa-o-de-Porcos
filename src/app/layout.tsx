import type { Metadata } from 'next'
import { BRAND_NAME } from '@/lib/brand'
import { cookies } from 'next/headers'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import SiteChrome from '@/components/layout/SiteChrome'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/providers/AuthProvider'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import ServiceWorkerProvider from '@/components/providers/ServiceWorkerProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} - Criação Sustentável e Parceria`,
    template: `%s | ${BRAND_NAME}`
  },
  description: 'Associação dedicada à criação sustentável de suínos, promovendo parcerias entre criadores e oferecendo produtos de qualidade superior.',
  keywords: ['associação', 'porcos', 'suínos', 'criação', 'sustentável', 'parceria', 'agricultura', 'agronegócio'],
  authors: [{ name: BRAND_NAME }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  metadataBase: new URL('https://assuino.com'),
  openGraph: {
    type: 'website',
    locale: 'pt_AO',
    url: 'https://assuino.com',
    title: `${BRAND_NAME} - Criação Sustentável e Parceria`,
    description: 'Associação dedicada à criação sustentável de suínos, promovendo parcerias entre criadores.',
    siteName: BRAND_NAME,
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: BRAND_NAME
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} - Criação Sustentável`,
    description: 'Promovendo parcerias e criação sustentável de suínos.',
    images: ['/og']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'seu-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value || 'pt-AO'
  const baseUrl = process.env.NEXTAUTH_URL || 'https://assuino.com'
  return (
    <html lang={locale} className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#16a34a" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: BRAND_NAME,
              url: baseUrl,
              logo: `${baseUrl}/icon-512x512.png`,
              image: `${baseUrl}/og`,
              sameAs: [
                "https://www.facebook.com/associacaoporcos",
                "https://www.instagram.com/associacaoporcos",
                "https://www.linkedin.com/company/associacaoporcos"
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: "contato@associacaoporcos.ao",
                telephone: "+244 928 476 427"
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased overflow-x-hidden">
        <AuthProvider>
          <LanguageProvider>
            <ServiceWorkerProvider>
              <SiteChrome>{children}</SiteChrome>
            </ServiceWorkerProvider>
          </LanguageProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#22c55e',
                color: '#ffffff',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
