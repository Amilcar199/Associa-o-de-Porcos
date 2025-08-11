'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Award, Leaf, Users, Target, ShieldCheck, Sparkles, ArrowRight, Recycle, LineChart } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function AboutClient() {
  return (
    <section className="space-y-0">
      {/* Hero Section */}
      <div className="relative min-h-[40vh] lg:min-h-[55vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2000&auto=format&fit=crop"
          alt="Suinocultura sustentável"
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
            <span className="inline-block bg-white/15 backdrop-blur px-3 py-1 rounded-full text-sm mb-4">Quem Somos</span>
            <h1 className="text-4xl lg:text-5xl font-heading font-bold leading-tight">Excelência e Inovação na Suinocultura</h1>
            <p className="mt-4 text-primary-100 text-lg">Promovemos a criação sustentável, a qualidade e o desenvolvimento do setor, conectando produtores, conhecimento e mercado.</p>
          </motion.div>
        </div>
      </div>

      {/* Stats Highlights */}
      <div className="container-custom -mt-10 lg:-mt-14 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Produtores Apoiados', value: '100+', icon: Users },
            { label: 'Capacitações', value: '20+', icon: Award },
            { label: 'Projetos Ativos', value: '8', icon: LineChart },
            { label: 'Boas Práticas', value: '100%', icon: ShieldCheck }
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
              title: 'Missão',
              desc: 'Impulsionar o desenvolvimento do setor suíno com capacitação, qualidade e apoio ao produtor.',
              icon: Target
            },
            {
              title: 'Visão',
              desc: 'Ser referência em suinocultura sustentável, com alto padrão de produtividade e bem-estar.',
              icon: Sparkles
            },
            {
              title: 'Valores',
              desc: 'Sustentabilidade, transparência, inovação, qualidade e respeito ao bem-estar animal.',
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
            <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-3">Como Trabalhamos</span>
            <h3 className="text-3xl font-heading font-bold">Nossos Pilares</h3>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Unimos conhecimento, sustentabilidade e mercado para gerar resultados consistentes para toda a cadeia.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: 'Apoio ao Produtor',
                desc: 'Capacitação, assistência técnica e partilha de boas práticas para elevar produtividade e rentabilidade.',
                icon: Users
              },
              {
                title: 'Sustentabilidade',
                desc: 'Gestão responsável, bem-estar animal e práticas que preservam o meio ambiente e a eficiência do sistema.',
                icon: Recycle
              },
              {
                title: 'Mercado e Qualidade',
                desc: 'Padrões, rastreabilidade e ligações com o mercado para fortalecer a confiança e a competitividade.',
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
          <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-3">Nossa Trajetória</span>
          <h3 className="text-3xl font-heading font-bold">Marcos que nos moldaram</h3>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Evoluímos continuamente com foco em qualidade, conhecimento e sustentabilidade.</p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-gray-200 hidden md:block" />
          <div className="space-y-8">
            {[
              { title: 'Estruturação de Programas', desc: 'Iniciativas de capacitação e apoio técnico a produtores.' },
              { title: 'Padrões de Qualidade', desc: 'Implantação de processos e rastreabilidade para elevar a confiança.' },
              { title: 'Projetos e Parcerias', desc: 'Ações com instituições e empresas para inovação e mercado.' },
              { title: 'Expansão e Resultados', desc: 'Maior alcance, produtividade e bem-estar animal aprimorado.' }
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, amount: 0.3 }}
                className={`md:w-1/2 ${idx % 2 === 0 ? 'md:pr-8 md:ml-auto' : 'md:pl-8'}`}
              >
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                  <p className="text-gray-700 mt-2 text-sm leading-relaxed">{step.desc}</p>
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
            <h3 className="text-2xl font-heading font-bold">Da Fazenda ao Mercado</h3>
            <p className="text-gray-600 mt-2">Momentos que representam nosso compromisso com qualidade e bem‑estar.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              'https://images.unsplash.com/photo-1525498128493-380d1990a112?q=80&w=1200&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
              'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
            ].map((src, idx) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="relative h-56 rounded-2xl overflow-hidden shadow"
              >
                <Image src={src} alt="Galeria da associação" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="container-custom py-12 lg:py-16">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 lg:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-2xl font-heading font-bold mb-1">Vamos construir resultados juntos</h4>
            <p className="text-primary-100">Fale connosco para parcerias, capacitações e soluções personalizadas.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contato" className="inline-flex items-center bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-6 rounded-lg transition-all">
              Entrar em Contato <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link href="/registro" className="inline-flex items-center border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-lg transition-all">
              Tornar-se Membro
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}