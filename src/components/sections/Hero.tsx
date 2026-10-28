'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import Slide1 from '@/components/assets/Foto Slider1.jpg'
import Slide2 from '@/components/assets/Foto slider2.jpg'
import Slide3 from '@/components/assets/Foto slider 3.jpg'
import { useLanguage } from '@/components/providers/LanguageProvider'
import pt from '@/lib/i18n/dictionaries/pt'
import en from '@/lib/i18n/dictionaries/en'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { locale } = useLanguage()
  const dict = locale.startsWith('en') ? en : pt
  const isEn = locale.startsWith('en')

  const slides = isEn
    ? [
        {
          id: 1,
          image: Slide1 as unknown as string,
          title: 'Excellence in Pig Farming',
          subtitle: 'Connecting farmers and boosting productivity with quality',
          description:
            'We promote best practices, sustainability, and partnerships for consistent results across the entire chain.',
          cta: 'Explore Our Products',
          ctaLink: '/produtos',
          stats: [
            { label: 'Associated Farmers', value: '100+' },
            { label: 'Pigs Traded', value: '1K+' },
            { label: 'Trainings', value: '20+' },
          ],
        },
        {
          id: 2,
          image: Slide2 as unknown as string,
          title: 'Quality that inspires confidence',
          subtitle: 'Animal welfare, traceability, and efficiency',
          description:
            'We follow strict quality standards to ensure performance, safety, and member satisfaction.',
          cta: 'Join the Association',
          ctaLink: '/registro',
          stats: [
            { label: 'Certifications', value: '5+' },
            { label: 'Available Breeds', value: '6+' },
            { label: 'Member Satisfaction', value: '95%' },
          ],
        },
        {
          id: 3,
          image: Slide3 as unknown as string,
          title: 'Innovation that drives results',
          subtitle: 'Technology, management, and knowledge applied to the field',
          description:
            'Continuous training, data, and technology to raise productivity, welfare, and sustainability.',
          cta: 'Learn More',
          ctaLink: '/sobre',
          stats: [
            { label: 'Projects Started', value: '5+' },
            { label: 'Active Partnerships', value: '4+' },
            { label: 'Trainings Held', value: '20+' },
          ],
        },
      ]
    : [
        {
          id: 1,
          image: Slide1 as unknown as string,
          title: 'Excelência na Suinocultura',
          subtitle: 'Conectando criadores e impulsionando produtividade com qualidade',
          description:
            'Promovemos boas práticas, sustentabilidade e parcerias para resultados consistentes em toda a cadeia.',
          cta: 'Conheça Nossos Produtos',
          ctaLink: '/produtos',
          stats: [
            { label: 'Criadores Associados', value: '100+' },
            { label: 'Suínos Comercializados', value: '1K+' },
            { label: 'Capacitações', value: '20+' },
          ],
        },
        {
          id: 2,
          image: Slide2 as unknown as string,
          title: 'Qualidade que inspira confiança',
          subtitle: 'Bem-estar animal, rastreabilidade e eficiência',
          description:
            'Seguimos padrões rigorosos de qualidade para garantir desempenho, segurança e satisfação dos clientes e associados.',
          cta: 'Faça Parte da Associação',
          ctaLink: '/registro',
          stats: [
            { label: 'Certificações', value: '5+' },
            { label: 'Raças Disponíveis', value: '6+' },
            { label: 'Satisfação dos Associados', value: '95%' },
          ],
        },
        {
          id: 3,
          image: Slide3 as unknown as string,
          title: 'Inovação que impulsiona resultados',
          subtitle: 'Tecnologia, gestão e conhecimento aplicados ao campo',
          description:
            'Capacitação contínua, dados e tecnologia para elevar produtividade, bem-estar e sustentabilidade.',
          cta: 'Saiba Mais',
          ctaLink: '/sobre',
          stats: [
            { label: 'Projetos Iniciados', value: '5+' },
            { label: 'Parcerias Ativas', value: '4+' },
            { label: 'Capacitações Realizadas', value: '20+' },
          ],
        },
      ]

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <section className="relative min-h-[68vh] overflow-hidden lg:min-h-[72vh]">
      {/* Background Slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={slide.image as any}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              onError={(e) => {
                const target = e.target as HTMLElement
                target.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
              }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom flex h-full min-h-[68vh] items-center lg:min-h-[72vh]">
        <div key={currentSlide} className="max-w-xl text-white">
          <h1 className="font-heading text-3xl font-bold leading-tight sm:text-5xl">
            {slides[currentSlide].title}
          </h1>
          <p className="mt-3 text-base text-primary-100 sm:text-lg">
            {slides[currentSlide].subtitle}
          </p>
          <p className="mt-3 hidden max-w-lg text-sm leading-relaxed text-gray-200 sm:block">
            {slides[currentSlide].description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={slides[currentSlide].ctaLink}
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary-800 transition-colors hover:bg-primary-50"
            >
              {slides[currentSlide].cta}
              <ChevronRight size={18} className="ml-1" />
            </Link>
            <Link href="/sobre" className="text-sm font-medium text-white/90 underline-offset-4 hover:underline">
              {isEn ? 'Who we are' : 'Quem somos'}
            </Link>
          </div>
          <div className="mt-8 hidden grid-cols-3 gap-6 sm:grid">
            {slides[currentSlide].stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-primary-500 scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

    </section>
  )
}

export default Hero
