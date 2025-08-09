'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight, Play, Users, Award, Leaf } from 'lucide-react'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      image: '/hero/slide-1.jpg',
      title: 'Criação Sustentável de Suínos',
      subtitle: 'Conectando criadores e promovendo a excelência no agronegócio',
      description: 'Somos uma associação dedicada ao desenvolvimento sustentável da suinocultura angolana, oferecendo suporte, conhecimento e parcerias estratégicas.',
      cta: 'Conheça Nossos Produtos',
      ctaLink: '/produtos',
      stats: [
        { label: 'Criadores Associados', value: '500+' },
        { label: 'Suínos Comercializados', value: '10K+' },
        { label: 'Anos de Experiência', value: '25+' }
      ]
    },
    {
      id: 2,
      image: '/hero/slide-2.jpg',
      title: 'Qualidade e Tradição',
      subtitle: 'Produtos certificados com os mais altos padrões de qualidade',
      description: 'Nossos suínos são criados seguindo rigorosos protocolos de bem-estar animal e sustentabilidade ambiental, garantindo produtos de excelência.',
      cta: 'Faça Parte da Associação',
      ctaLink: '/auth/register',
      stats: [
        { label: 'Certificações', value: '15+' },
        { label: 'Raças Disponíveis', value: '12' },
        { label: 'Satisfação do Cliente', value: '98%' }
      ]
    },
    {
      id: 3,
      image: '/hero/slide-3.jpg',
      title: 'Inovação e Tecnologia',
      subtitle: 'Utilizando as mais modernas técnicas de criação e manejo',
      description: 'Investimos continuamente em pesquisa, desenvolvimento e tecnologia para oferecer soluções inovadoras aos nossos associados.',
      cta: 'Saiba Mais',
      ctaLink: '/sobre',
      stats: [
        { label: 'Projetos de Pesquisa', value: '8' },
        { label: 'Parcerias Universitárias', value: '5' },
        { label: 'Publicações Científicas', value: '50+' }
      ]
    }
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
    <section className="relative min-h-[80vh] lg:min-h-screen overflow-hidden">
      {/* Background Slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentSlide ? 1 : 0,
              scale: index === currentSlide ? 1 : 1.1
            }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              onError={(e) => {
                // Fallback para gradiente quando imagem não existir
                const target = e.target as HTMLElement
                target.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
              }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom h-full min-h-[80vh] lg:min-h-screen flex items-center">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white"
            >
              <motion.h1 
                className="text-4xl lg:text-6xl font-heading font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
              
              <motion.h2 
                className="text-xl lg:text-2xl text-primary-200 mb-6 font-medium"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {slides[currentSlide].subtitle}
              </motion.h2>
              
              <motion.p 
                className="text-lg text-gray-200 mb-8 leading-relaxed max-w-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {slides[currentSlide].description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <Link
                  href={slides[currentSlide].ctaLink}
                  className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {slides[currentSlide].cta}
                  <ChevronRight size={20} className="ml-2" />
                </Link>
                
                <Link
                  href="/sobre"
                  className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-4 px-8 rounded-lg transition-all duration-300"
                >
                  <Play size={20} className="mr-2" />
                  Assista ao Vídeo
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                {slides[currentSlide].stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-primary-300 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-300">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Features Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <Users className="text-primary-300 mb-4" size={40} />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Comunidade Forte
                  </h3>
                  <p className="text-gray-200 text-sm">
                    Mais de 500 criadores associados compartilhando conhecimento e experiências.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <Award className="text-primary-300 mb-4" size={40} />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Qualidade Certificada
                  </h3>
                  <p className="text-gray-200 text-sm">
                    Produtos com certificação de qualidade e bem-estar animal.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <Leaf className="text-primary-300 mb-4" size={40} />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Sustentabilidade
                  </h3>
                  <p className="text-gray-200 text-sm">
                    Práticas sustentáveis e responsabilidade ambiental em primeiro lugar.
                  </p>
                </div>
              </div>
            </motion.div>
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

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-2 bg-white rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
