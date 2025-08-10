import { Metadata } from 'next'
import Hero from '@/components/sections/Hero'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import AboutPreview from '@/components/sections/AboutPreview'
import LatestNews from '@/components/sections/LatestNews'
import CallToAction from '@/components/sections/CallToAction'
import PartnersSection from '@/components/sections/PartnersSection'

export const metadata: Metadata = {
  title: 'Home - Associação de Porcos',
  description: 'Bem-vindo à Associação de Porcos. Uma associação recente (2-3 anos) focada em criação sustentável, organização da cadeia e parcerias no setor suinícola.',
  openGraph: {
    title: 'Associação de Porcos - Uma nova fase da suinocultura',
    description: 'Associação jovem, focada em sustentabilidade, organização e parcerias para fortalecer a cadeia.',
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
