'use client'

import Link from 'next/link'
import Image from 'next/image'
import AboutImage from '@/components/assets/oksuinos.webp'
import { motion } from 'framer-motion'
import { 
  Users, 
  Award, 
  Leaf, 
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import pt from '@/lib/i18n/dictionaries/pt'
import en from '@/lib/i18n/dictionaries/en'

const AboutPreview = () => {
  const { locale } = useLanguage()
  const dict = locale.startsWith('en') ? en : pt

  const features = locale.startsWith('en') ? [
    {
      icon: Users,
      title: 'Growing community',
      description: 'Over 100 farmers united to boost the emerging pig sector'
    },
    {
      icon: Award,
      title: 'Quality in progress',
      description: 'Certifications and standards being implemented with focus on animal welfare'
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'Sustainable practices implemented since the start of operations'
    },
    {
      icon: Heart,
      title: 'Animal welfare',
      description: 'Care and respect present at every stage of the process'
    }
  ] : [
    {
      icon: Users,
      title: 'Comunidade em expansão',
      description: 'Mais de 100 criadores unidos para impulsionar a suinocultura recente'
    },
    {
      icon: Award,
      title: 'Qualidade em construção',
      description: 'Certificações e padrões sendo implantados com foco em bem-estar animal'
    },
    {
      icon: Leaf,
      title: 'Sustentabilidade',
      description: 'Práticas sustentáveis implantadas desde o início das operações'
    },
    {
      icon: Heart,
      title: 'Bem-estar Animal',
      description: 'Cuidado e respeito presentes em todas as etapas do processo'
    }
  ]

  const achievements = locale.startsWith('en') ? [
    '2-3 years of trajectory with a solid foundation',
    '100+ active associated farmers',
    '5+ certifications and standards implemented',
    '95% member satisfaction',
    '1,500+ pigs traded'
  ] : [
    '2-3 anos de trajetória com base sólida',
    '100+ criadores associados ativos',
    '5+ certificações e padrões implantados',
    '95% de satisfação dos associados',
    '1.500+ suínos comercializados'
  ]

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Imagem e Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={AboutImage}
                alt={locale.startsWith('en') ? 'Association Farm' : 'Fazenda da Associação de Porcos'}
                width={600}
                height={400}
                className="object-cover w-full h-[400px]"
              />
              
              {/* Overlay com informações */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="text-white">
                  <h3 className="font-bold text-xl mb-2">{locale.startsWith('en') ? 'Our Farm' : 'Nossa Fazenda'}</h3>
                  <p className="text-sm opacity-90">
                    {locale.startsWith('en') ? 'Technology and tradition working together' : 'Tecnologia e tradição trabalhando juntas'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards Flutuantes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="absolute bottom-2 right-2 md:-bottom-6 md:-right-6 bg-white rounded-xl shadow-xl p-4 border border-gray-200 pointer-events-none select-none"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">20+</div>
                <div className="text-xs text-gray-600">{locale.startsWith('en') ? 'Trainings' : 'Capacitações'}</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute top-2 left-2 md:-top-6 md:-left-6 bg-primary-600 text-white rounded-xl shadow-xl p-4 pointer-events-none select-none"
            >
              <div className="text-center">
                <div className="text-2xl font-bold">100+</div>
                <div className="text-xs opacity-90">{locale.startsWith('en') ? 'Farmers' : 'Criadores'}</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Conteúdo Textual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                {locale.startsWith('en') ? 'About Us' : 'Sobre Nós'}
              </span>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-6">
                {locale.startsWith('en') ? 'Excellence and Innovation in' : 'Excelência e Inovação na'}
                <span className="text-gradient"> {locale.startsWith('en') ? 'Pig Farming' : 'Suinocultura'}</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {locale.startsWith('en')
                  ? 'We promote sustainable and responsible pig farming in Angola. Our mission is to connect farmers, support growth, and drive sector development with quality, technology, and strong partnerships.'
                  : 'Promovemos a criação sustentável e responsável de suínos em Angola. Nossa missão é conectar criadores, apoiar o crescimento e impulsionar o desenvolvimento do setor com qualidade, tecnologia e parcerias sólidas.'}
              </p>
            </div>

            {/* Lista de Conquistas */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {locale.startsWith('en') ? 'Our Differentials' : 'Nossos Diferenciais'}
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="text-primary-600 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{achievement}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <feature.icon className="text-primary-600 mb-2" size={24} />
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/sobre"
                className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {locale.startsWith('en') ? 'Discover Our Story' : 'Conheça Nossa História'}
                <ArrowRight size={18} className="ml-2" />
              </Link>
              
              <Link
                href="/contato"
                className="inline-flex items-center justify-center border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                {dict.footer.contactTitle}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutPreview
