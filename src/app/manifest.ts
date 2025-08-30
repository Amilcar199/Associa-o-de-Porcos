import { MetadataRoute } from 'next'
import { BRAND_NAME } from '@/lib/brand'

export default function manifest(): MetadataRoute.Manifest {
  const name = BRAND_NAME
  const short_name = 'Suinocultores Norte'
  const theme_color = '#16a34a'
  const background_color = '#ffffff'

  return {
    name,
    short_name,
    description: 'Associação de Suinocultores do Norte - site institucional',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color,
    background_color,
    icons: [
      { src: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
}

