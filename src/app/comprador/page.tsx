import type { Metadata } from 'next'
import BuyerArea from '@/components/buyer/BuyerArea'

export const metadata: Metadata = {
  title: 'Área do comprador',
  robots: { index: false, follow: false },
}

export default function CompradorPage() {
  return <BuyerArea />
}
