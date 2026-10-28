import { Metadata } from 'next'
import { BRAND_NAME } from '@/lib/brand'
import Hero from '@/components/sections/Hero'
import BolsaPreview from '@/components/sections/BolsaPreview'
import OfferRail from '@/components/sections/home/OfferRail'
import LatestNews from '@/components/sections/LatestNews'
import CallToAction from '@/components/sections/CallToAction'
import PartnersSection from '@/components/sections/PartnersSection'

export const metadata: Metadata = {
  title: `Home - ${BRAND_NAME}`,
  description: `Bem-vindo à ${BRAND_NAME}. Sustentabilidade, qualidade e parcerias para impulsionar resultados na suinocultura.`,
  alternates: {
    canonical: `${process.env.NEXTAUTH_URL || 'https://assuino.com'}/`,
  },
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

      <section className="bg-gray-50 py-8 md:py-12">
        <div className="container-custom grid items-start gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <BolsaPreview compact />
          </div>
          <div className="lg:col-span-2">
            <OfferRail />
          </div>
        </div>
      </section>

      {/* Latest News */}
      <LatestNews />
      
      {/* Partners Section */}
      <PartnersSection />
      
      {/* Call to Action */}
      <CallToAction />
    </div>
  )
}
