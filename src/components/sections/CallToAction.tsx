'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight,
  Users,
  Star,
  Shield,
  Heart,
  Phone,
  Mail
} from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useEffect, useState } from 'react'

const CallToAction = () => {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const [siteConfig, setSiteConfig] = useState<any>(null)

  useEffect(()=>{ (async()=>{ try { const r = await fetch('/api/admin/config',{ cache:'no-store' }); if(r.ok){ const j = await r.json(); setSiteConfig(j?.data || null) } } catch {} })() },[])

  const benefits = isEn ? [
    { icon: Users, title: 'Active Community', description: 'Connect with over 500 experienced farmers' },
    { icon: Star, title: 'Guaranteed Quality', description: 'Certified products with top standards' },
    { icon: Shield, title: 'Technical Support', description: 'Specialized assistance always available' },
    { icon: Heart, title: 'Animal Welfare', description: 'Proven sustainable and ethical practices' }
  ] : [
    { icon: Users, title: 'Comunidade Ativa', description: 'Conecte-se com mais de 500 criadores experientes' },
    { icon: Star, title: 'Qualidade Garantida', description: 'Produtos certificados com os melhores padrões' },
    { icon: Shield, title: 'Suporte Técnico', description: 'Assistência especializada sempre disponível' },
    { icon: Heart, title: 'Bem-estar Animal', description: 'Práticas sustentáveis e éticas comprovadas' }
  ]

  const stats = isEn ? [
    { value: '500+', label: 'Active Members' },
    { value: '3+', label: 'Years of Experience' },
    { value: '98%', label: 'Customer Satisfaction' },
    { value: '15+', label: 'Certifications' }
  ] : [
    { value: '500+', label: 'Membros Ativos' },
    { value: '3+', label: 'Anos de Experiência' },
    { value: '98%', label: 'Satisfação dos Clientes' },
    { value: '15+', label: 'Certificações' }
  ]

  return (
    <section className="section-padding bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container-custom relative z-10">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-6 leading-tight">
            {isEn ? 'Ready to be part of the' : 'Pronto Para Fazer Parte da'}
            <br />
            <span className="text-primary-200">{isEn ? 'Best Association?' : 'Melhor Associação?'}</span>
          </h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed mb-8">
            {isEn ? 'Join Angola’s most respected community of farmers. Access premium products, specialized technical support and a valuable network.' : 'Junte-se à comunidade de criadores mais respeitada de Angola. Tenha acesso a produtos premium, suporte técnico especializado e uma rede de contatos valiosa.'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/auth/register"
              className="inline-flex items-center bg-white text-primary-700 hover:bg-primary-50 font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isEn ? 'Sign up for free' : 'Cadastre-se Gratuitamente'}
              <ArrowRight size={20} className="ml-2" />
            </Link>
            
            <Link
              href="/produtos"
              className="inline-flex items-center border-2 border-white text-white hover:bg-white hover:text-primary-700 font-semibold py-4 px-8 rounded-lg transition-all duration-300"
            >
              {isEn ? 'Explore Our Products' : 'Explore Nossos Produtos'}
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-primary-200">
            <div className="flex items-center space-x-2">
              <Shield size={20} />
              <span className="text-sm font-medium">{isEn ? '100% Secure' : '100% Seguro'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart size={20} />
              <span className="text-sm font-medium">{isEn ? 'Welfare Assured' : 'Bem-estar Garantido'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star size={20} />
              <span className="text-sm font-medium">{isEn ? 'Premium Quality' : 'Qualidade Premium'}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-primary-200 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-primary-100 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              <h3 className="text-2xl font-heading font-bold text-white mb-4">
                {isEn ? 'Still have questions?' : 'Ainda tem Dúvidas?'}
              </h3>
              <p className="text-primary-100 mb-6 leading-relaxed">
                {isEn ? 'Our team is ready to clarify your questions and help you find the best solution for your business.' : 'Nossa equipe está pronta para esclarecer todas as suas questões e ajudá-lo a encontrar a melhor solução para seu negócio.'}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <Phone size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">+244 928 476 427</p>
                    <p className="text-primary-200 text-sm">{isEn ? 'WhatsApp and Calls' : 'WhatsApp e Ligações'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <Mail size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{siteConfig?.contactEmail || 'contato@associacaodeporcos.ao'}</p>
                    <p className="text-primary-200 text-sm">{isEn ? 'We reply within 24h' : 'Respondemos em até 24h'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - CTA */}
            <div className="text-center lg:text-right">
              <div className="inline-flex flex-col space-y-4">
                <Link
                  href="/contato"
                  className="bg-white text-primary-700 hover:bg-primary-50 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  {isEn ? 'Get in Touch' : 'Entre em Contato'}
                </Link>
                
                <a
                  href="https://wa.me/244928476427"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 inline-flex items-center justify-center"
                >
                  <Phone size={18} className="mr-2" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final Message */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-primary-200 text-lg">
            {isEn ? '✨ Transform your business today. Join us! ✨' : '✨ Transforme seu negócio hoje mesmo. Junte-se a nós! ✨'}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default CallToAction
