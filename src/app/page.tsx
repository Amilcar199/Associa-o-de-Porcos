import { Metadata } from 'next'
import { BRAND_NAME } from '@/lib/brand'
import Hero from '@/components/sections/Hero'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import AboutPreview from '@/components/sections/AboutPreview'
import LatestNews from '@/components/sections/LatestNews'
import CallToAction from '@/components/sections/CallToAction'
import PartnersSection from '@/components/sections/PartnersSection'

export const metadata: Metadata = {
  title: `Home - ${BRAND_NAME}`,
  description: `Bem-vindo à ${BRAND_NAME}. Sustentabilidade, qualidade e parcerias para impulsionar resultados na suinocultura.`,
  openGraph: {
    title: `${BRAND_NAME} - Sustentabilidade e Qualidade`,
    description: 'Boas práticas, inovação e parcerias para fortalecer toda a cadeia da suinocultura.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <Hero />
      
      {/* About Preview */}
      <AboutPreview />
      
      {/* Featured Products */}
      <FeaturedProducts />
      
      {/* Latest News */}
      <LatestNews />
      
      {/* Partners Section */}
      <PartnersSection />
      
      {/* Call to Action */}
      <CallToAction />
    </div>
  )
}
