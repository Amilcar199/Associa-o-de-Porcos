import { Metadata } from 'next'
import Hero from '@/components/sections/Hero'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import AboutPreview from '@/components/sections/AboutPreview'
import LatestNews from '@/components/sections/LatestNews'
import CallToAction from '@/components/sections/CallToAction'
import PartnersSection from '@/components/sections/PartnersSection'

export const metadata: Metadata = {
  title: 'Home - Associação de Porcos',
  description: 'Bem-vindo à Associação de Porcos. Criação sustentável, produtos de qualidade e parcerias sólidas no agronegócio suinícola.',
  openGraph: {
    title: 'Associação de Porcos - Criação Sustentável',
    description: 'Criação sustentável, produtos de qualidade e parcerias sólidas no agronegócio suinícola.',
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
