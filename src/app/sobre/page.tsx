import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { cookies } from 'next/headers'

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'About Us' : 'Quem Somos',
    description: isEn
      ? 'Pig Farmers Association in Angola: mission, values and history.'
      : 'Associação de Suinocultores do Norte em Angola: missão, valores e história.'
  }
}

const AboutClient = dynamic(() => import('./AboutClient'), { ssr: false })

export default function SobrePage() {
  return <AboutClient />
}