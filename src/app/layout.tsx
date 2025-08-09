import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/providers/AuthProvider'

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
    default: 'Associação de Porcos - Criação Sustentável e Parceria',
    template: '%s | Associação de Porcos'
  },
  description: 'Associação dedicada à criação sustentável de suínos, promovendo parcerias entre criadores e oferecendo produtos de qualidade superior.',
  keywords: ['associação', 'porcos', 'suínos', 'criação', 'sustentável', 'parceria', 'agricultura', 'agronegócio'],
  authors: [{ name: 'Associação de Porcos' }],
  creator: 'Associação de Porcos',
  publisher: 'Associação de Porcos',
  metadataBase: new URL('https://associacaodeporcos.ao'),
  openGraph: {
    type: 'website',
    locale: 'pt_AO',
    url: 'https://associacaodeporcos.ao',
    title: 'Associação de Porcos - Criação Sustentável e Parceria',
    description: 'Associação dedicada à criação sustentável de suínos, promovendo parcerias entre criadores.',
    siteName: 'Associação de Porcos',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Associação de Porcos'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Associação de Porcos - Criação Sustentável',
    description: 'Promovendo parcerias e criação sustentável de suínos.',
    images: ['/og-image.jpg']
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
  return (
    <html lang="pt-AO" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
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
