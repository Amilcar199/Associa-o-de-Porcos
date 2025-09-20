'use client'

import Image from 'next/image'
import Slide1 from '@/components/assets/Foto Slider1.jpg'
import Slide2 from '@/components/assets/Foto slider2.jpg'
import Slide3 from '@/components/assets/Foto slider 3.jpg'
import Suino from '@/components/assets/Foto Suino.webp'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Award, Leaf, Users, Target, ShieldCheck, Sparkles, ArrowRight, Recycle, LineChart, Flag, Milestone, TrendingUp } from 'lucide-react'
import MapaAngola from '@/components/assets/Mapa de Angola.png'
import { useLanguage } from '@/components/providers/LanguageProvider'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function AboutClient() {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  return (
    <section className="space-y-0">
      {/* Hero Section */}
      <div className="relative min-h-[40vh] lg:min-h-[55vh] overflow-hidden">
        <Image
          src={Suino}
          alt={isEn ? 'Sustainable pig farming' : 'Suinocultura sustentável'}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/40" />
        <div className="relative z-10 container-custom h-full flex items-end pb-10 lg:items-center lg:pb-0">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="text-white max-w-3xl"
          >
            <span className="inline-block bg-white/15 backdrop-blur px-3 py-1 rounded-full text-sm mb-4">{isEn ? 'About Us' : 'Quem Somos'}</span>
            <h1 className="text-4xl lg:text-5xl font-heading font-bold leading-tight">{isEn ? 'Excellence and Innovation in Pig Farming' : 'Excelência e Inovação na Suinocultura'}</h1>
            <p className="mt-4 text-primary-100 text-lg">{isEn ? 'We promote sustainability, quality and sector development by connecting producers, knowledge and the market.' : 'Promovemos a criação sustentável, a qualidade e o desenvolvimento do setor, conectando produtores, conhecimento e mercado.'}</p>
          </motion.div>
        </div>
      </div>

      {/* Stats Highlights */}
      <div className="container-custom -mt-10 lg:-mt-14 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: isEn ? 'Supported Producers' : 'Produtores Apoiados', value: '100+', icon: Users },
            { label: isEn ? 'Trainings' : 'Capacitações', value: '20+', icon: Award },
            { label: isEn ? 'Active Projects' : 'Projetos Ativos', value: '8+', icon: LineChart },
            { label: isEn ? 'Best Practices' : 'Boas Práticas', value: '100%', icon: ShieldCheck }
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow p-5 border border-gray-100 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <item.icon size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Missão, Visão, Valores */}
      <div className="container-custom py-12 lg:py-16">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              title: isEn ? 'Mission' : 'Missão',
              desc: isEn ? 'Drive the pig sector in Angola through training, quality and producer support.' : 'Impulsionar o desenvolvimento do sector da Suinocultura em Angola, com capacitação, qualidade e apoio ao produtor.',
              icon: Target
            },
            {
              title: isEn ? 'Vision' : 'Visão',
              desc: isEn ? 'Be a national reference in sustainable pig farming in Angola, with high productivity and animal welfare.' : 'Ser referência nacional em suinocultura sustentável em Angola, com alto padrão de produtividade e bem-estar.',
              icon: Sparkles
            },
            {
              title: isEn ? 'Values' : 'Valores',
              desc: isEn ? 'Sustainability, transparency, innovation, quality and animal welfare.' : 'Sustentabilidade, transparência, inovação, qualidade e respeito ao bem-estar animal.',
              icon: Leaf
            }
          ].map((card, idx) => (
            <motion.div
              key={card.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                <card.icon size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h2>
              <p className="text-gray-700 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pilares */}
      <div className="bg-gray-50 py-12 lg:py-16">
        <div className="container-custom">
          <div className="text-center mb-10">
            <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-3">{isEn ? 'How We Work' : 'Como Trabalhamos'}</span>
            <h3 className="text-3xl font-heading font-bold">{isEn ? 'Our Pillars' : 'Nossos Pilares'}</h3>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{isEn ? 'We combine knowledge, sustainability and market to deliver consistent results across the chain.' : 'Unimos conhecimento, sustentabilidade e mercado para gerar resultados consistentes para toda a cadeia.'}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: isEn ? 'Producer Support' : 'Apoio ao Produtor',
                desc: isEn ? 'Training, technical assistance and best practices tailored to Angolan producers to raise productivity and profitability.' : 'Capacitação, assistência técnica e boas práticas adaptadas à realidade dos produtores angolanos para elevar produtividade e rentabilidade.',
                icon: Users
              },
              {
                title: isEn ? 'Sustainability' : 'Sustentabilidade',
                desc: isEn ? 'Responsible management and animal welfare aligned with Angola’s context, preserving the environment and system efficiency.' : 'Gestão responsável e bem-estar animal alinhados ao contexto de Angola, preservando o meio ambiente e a eficiência do sistema.',
                icon: Recycle
              },
              {
                title: isEn ? 'Market and Quality' : 'Mercado e Qualidade',
                desc: isEn ? 'Standards, traceability and market links focused on the Angolan market to strengthen confidence and competitiveness across the local chain.' : 'Padrões, rastreabilidade e ligações com o mercado angolano para fortalecer a confiança e a competitividade em toda a cadeia local.',
                icon: Award
              }
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                  <item.icon size={24} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-700 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Linha do Tempo */}
      <div className="container-custom py-12 lg:py-16">
        <div className="text-center mb-10">
          <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-3">{isEn ? 'Our Journey' : 'Nossa Trajetória'}</span>
          <h3 className="text-3xl font-heading font-bold">{isEn ? 'Milestones that shaped us' : 'Marcos que nos moldaram'}</h3>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{isEn ? 'We continually evolve with a focus on quality, knowledge and sustainability.' : 'Evoluímos continuamente com foco em qualidade, conhecimento e sustentabilidade.'}</p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-gradient-to-b from-primary-200 via-gray-200 to-primary-200 hidden md:block" />
          <div className="space-y-10">
            {[
              { title: isEn ? 'Program Structuring' : 'Estruturação de Programas', desc: isEn ? 'Training initiatives and technical support for producers.' : 'Iniciativas de capacitação e apoio técnico a produtores.', icon: Flag },
              { title: isEn ? 'Quality Standards' : 'Padrões de Qualidade', desc: isEn ? 'Implementation of processes and traceability to raise confidence.' : 'Implantação de processos e rastreabilidade para elevar a confiança.', icon: Milestone },
              { title: isEn ? 'Projects and Partnerships' : 'Projetos e Parcerias', desc: isEn ? 'Actions with institutions and companies for innovation and market.' : 'Ações com instituições e empresas para inovação e mercado.', icon: Users },
              { title: isEn ? 'Expansion and Results' : 'Expansão e Resultados', desc: isEn ? 'Greater reach, productivity and improved animal welfare.' : 'Maior alcance, produtividade e bem-estar animal aprimorado.', icon: TrendingUp }
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, amount: 0.3 }}
                className={`relative md:w-1/2 ${idx % 2 === 0 ? 'md:pr-10 md:ml-auto' : 'md:pl-10'}`}
              >
                {/* Marker */}
                <div className={`hidden md:flex absolute top-7 ${idx % 2 === 0 ? '-left-4' : '-right-4'} items-center justify-center w-8 h-8 rounded-full bg-white ring-2 ring-primary-200 shadow-sm`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition p-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50 text-primary-700">
                    <step.icon size={18} />
                  </div>
                  <h4 className="mt-3 text-lg font-semibold text-gray-900">{step.title}</h4>
                  <p className="text-gray-700 mt-1.5 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Galeria */}
      <div className="bg-gray-50 py-12 lg:py-16">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold">{isEn ? 'From Farm to Market' : 'Da Fazenda ao Mercado'}</h3>
            <p className="text-gray-600 mt-2">{isEn ? 'Moments representing our commitment to quality and welfare.' : 'Momentos que representam nosso compromisso com qualidade e bem‑estar.'}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[Slide1, Slide2, Slide3].map((src, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="relative h-56 rounded-2xl overflow-hidden shadow"
              >
                <Image src={src} alt={isEn ? 'Association gallery' : 'Galeria da Associação de Suinocultores do Norte'} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Localização - Fundo da Página */}
      <div className="bg-gray-50 py-12 lg:py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Imagem à Esquerda */}
            <div>
              <div className="relative w-full h-96 lg:h-[34rem] rounded-2xl overflow-hidden shadow">
                <Image
                  src={MapaAngola}
                  alt={isEn ? 'Map of Angola' : 'Mapa de Angola'}
                  fill
                  className="object-contain"
                  sizes="(max-width:768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Texto à Direita */}
            <div>
              <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-3">{isEn ? 'Our Presence' : 'Nossa Presença'}</span>
              <h3 className="text-3xl font-heading font-bold mb-3">{isEn ? 'Our presence in Angola' : 'Nossa presença em Angola'}</h3>
              <p className="text-gray-700 mb-3">{isEn ? 'We operate nationally with local partnerships and close support to producers. We deliver knowledge, technical assistance and quality standards to consistently drive results.' : 'Estamos presentes em território nacional com parcerias locais e atuação próxima ao produtor. Levamos conhecimento, assistência técnica e padrões de qualidade para impulsionar resultados de forma consistente.'}</p>
              <p className="text-gray-600 mb-6">{isEn ? 'Below are some provinces where we maintain operations and continuous support:' : 'Abaixo, algumas das províncias onde mantemos operações e apoio contínuo:'}</p>
              <ul className="space-y-2">
                <li className="text-3xl font-heading font-extrabold text-primary-700">Luanda</li>
                <li className="text-xl text-gray-800">Benguela</li>
                <li className="text-xl text-gray-800">Bengo</li>
                <li className="text-xl text-gray-800">Icole Bengo</li>
                <li className="text-xl text-gray-800">Malanje</li>
                <li className="text-xl text-gray-800">Huambo</li>
                <li className="text-xl text-gray-800">Kuanza Norte</li>
                
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="container-custom py-12 lg:py-16">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 lg:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-2xl font-heading font-bold mb-1">{isEn ? 'Let’s build results together' : 'Vamos construir resultados juntos'}</h4>
            <p className="text-primary-100">{isEn ? 'Contact us for partnerships, training and tailored solutions.' : 'Fale connosco para parcerias, capacitações e soluções personalizadas.'}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contato" className="inline-flex items-center bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-6 rounded-lg transition-all">
              {isEn ? 'Get in Touch' : 'Entrar em Contato'} <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link href="/registro" className="inline-flex items-center border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-lg transition-all">
              {isEn ? 'Become a Member' : 'Tornar-se Membro'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}