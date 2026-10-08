import type { Metadata } from 'next'
import ProducerPanel from '@/components/producer/ProducerPanel'

export const metadata: Metadata = {
  title: 'Área do produtor',
  robots: { index: false, follow: false },
}

export default function PainelPage() {
  return <ProducerPanel />
}
