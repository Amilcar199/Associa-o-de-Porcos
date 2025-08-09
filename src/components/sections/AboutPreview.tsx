'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Users, 
  Award, 
  Leaf, 
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const AboutPreview = () => {
  const features = [
    {
      icon: Users,
      title: 'Comunidade Unida',
      description: 'Mais de 500 criadores unidos pela paixão e qualidade na suinocultura'
    },
    {
      icon: Award,
      title: 'Excelência Reconhecida',
      description: 'Certificações nacionais e internacionais em qualidade e bem-estar animal'
    },
    {
      icon: Leaf,
      title: 'Sustentabilidade',
      description: 'Práticas sustentáveis que respeitam o meio ambiente e as futuras gerações'
    },
    {
      icon: Heart,
      title: 'Bem-estar Animal',
      description: 'Cuidado e respeito aos animais em todas as etapas do processo'
    }
  ]

  const achievements = [
    '25 anos de tradição e experiência',
    '500+ criadores associados ativos',
    '15+ certificações de qualidade',
    '98% de satisfação dos clientes',
    '10.000+ suínos comercializados'
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
                src="/about/main-image.jpg"
                alt="Fazenda da Associação de Porcos"
                width={600}
                height={400}
                className="object-cover w-full h-[400px]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%2316a34a'/%3E%3Ctext x='300' y='200' text-anchor='middle' fill='white' font-size='24'%3EFazenda Sustentável%3C/text%3E%3C/svg%3E"
                }}
              />
              
              {/* Overlay com informações */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="text-white">
                  <h3 className="font-bold text-xl mb-2">Nossa Fazenda</h3>
                  <p className="text-sm opacity-90">
                    Tecnologia e tradição trabalhando juntas
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
              className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 border border-gray-200"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">25+</div>
                <div className="text-xs text-gray-600">Anos de Experiência</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute -top-6 -left-6 bg-primary-600 text-white rounded-xl shadow-xl p-4"
            >
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-xs opacity-90">Criadores</div>
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
                Sobre Nós
              </span>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-6">
                Tradição e Inovação na 
                <span className="text-gradient"> Suinocultura</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Há mais de 25 anos, a Associação de Porcos tem sido pioneira na 
                criação sustentável e responsável de suínos em Angola. Nossa missão 
                é conectar criadores, promover a excelência e impulsionar o 
                desenvolvimento do agronegócio suinícola.
              </p>
            </div>

            {/* Lista de Conquistas */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Nossos Diferenciais
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
                Conheça Nossa História
                <ArrowRight size={18} className="ml-2" />
              </Link>
              
              <Link
                href="/contato"
                className="inline-flex items-center justify-center border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Entre em Contato
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutPreview
