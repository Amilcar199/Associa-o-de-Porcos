import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Quem Somos',
  description: 'Associação de Porcos em Angola: missão, valores e história.'
}

const AboutClient = dynamic(() => import('./AboutClient'), { ssr: false })

export default function SobrePage() {
  return <AboutClient />
}