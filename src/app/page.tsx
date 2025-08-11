import { Metadata } from 'next'
import Hero from '@/components/sections/Hero'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import AboutPreview from '@/components/sections/AboutPreview'
import LatestNews from '@/components/sections/LatestNews'
import CallToAction from '@/components/sections/CallToAction'
// import PartnersSection from '@/components/sections/PartnersSection'

export const metadata: Metadata = {
  title: 'Home - Associação de Porcos',
  description: 'Bem-vindo à Associação de Porcos. Sustentabilidade, qualidade e parcerias para impulsionar resultados na suinocultura.',
  openGraph: {
    title: 'Associação de Porcos - Sustentabilidade e Qualidade',
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
      
      {/* Partners Section ocultada temporariamente */}
      {/* <PartnersSection /> */}
      
      {/* Call to Action */}
      <CallToAction />
    </div>
  )
}
