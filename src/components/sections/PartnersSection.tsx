'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowRight,
  Users,
  Building,
  Globe,
  Star
} from 'lucide-react'

// Mock data - será substituído pela API real
const mockPartners = [
  {
    id: '1',
    name: 'Dr. João Silva',
    role: 'Veterinário Especialista',
    company: 'Clínica Veterinária AgroSaúde',
    avatar: '/collaborators/joao-silva.jpg',
    description: 'Especialista em saúde suína com mais de 20 anos de experiência no setor.',
    featured: true
  },
  {
    id: '2',
    name: 'Maria Santos',
    role: 'Zootecnista',
    company: 'Consultoria Técnica Rural',
    avatar: '/collaborators/maria-santos.jpg',
    description: 'Consultora em melhoramento genético e nutrição animal.',
    featured: true
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    role: 'Criador Parceiro',
    company: 'Fazenda Esperança',
    avatar: '/collaborators/carlos-oliveira.jpg',
    description: 'Criador de suínos há 15 anos, especializado em reprodução.',
    featured: true
  },
  {
    id: '4',
    name: 'Ana Costa',
    role: 'Nutricionista Animal',
    company: 'NutriSuínos Ltda',
    avatar: '/collaborators/ana-costa.jpg',
    description: 'Especialista em formulação de rações e suplementos.',
    featured: true
  },
  {
    id: '5',
    name: 'Pedro Mendes',
    role: 'Técnico Agropecuário',
    company: 'TecnoRural',
    avatar: '/collaborators/pedro-mendes.jpg',
    description: 'Especialista em manejo e bem-estar animal.',
    featured: false
  },
  {
    id: '6',
    name: 'Lucia Ferreira',
    role: 'Médica Veterinária',
    company: 'VetCare',
    avatar: '/collaborators/lucia-ferreira.jpg',
    description: 'Especialista em medicina preventiva e programas sanitários.',
    featured: false
  }
]

const organizationPartners = [
  {
    name: 'ACSA - Associação de Criadores de Suínos de Angola',
    logo: '/partners/acsa-logo.png',
    website: 'https://acsa.ao',
    description: 'Entidade máxima da suinocultura angolana'
  },
  {
    name: 'IIA - Instituto de Investigação Agronómica',
    logo: '/partners/iia-logo.png',
    website: 'https://www.iia.ao',
    description: 'Centro de pesquisa e desenvolvimento'
  },
  {
    name: 'UAN - Universidade Agostinho Neto',
    logo: '/partners/uan-logo.png',
    website: 'https://www.uan.ao',
    description: 'Parceria em pesquisa e desenvolvimento'
  },
  {
    name: 'Sindicato Rural',
    logo: '/partners/sindicato-logo.png',
    website: '#',
    description: 'Representação dos produtores rurais'
  }
]

const PartnersSection = () => {
  const [collaborators, setCollaborators] = useState(mockPartners)
  const [loading, setLoading] = useState(false)

  // Função para buscar colaboradores (será implementada com API real)
  const fetchCollaborators = async () => {
    setLoading(true)
    try {
      // const response = await fetch('/api/collaborators/featured')
      // const data = await response.json()
      // setCollaborators(data.collaborators)
      
      // Por enquanto, usar dados mock
      setTimeout(() => {
        setCollaborators(mockPartners.filter(p => p.featured))
        setLoading(false)
      }, 600)
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCollaborators()
  }, [])

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Nossos Parceiros
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-6">
            Construindo o Futuro
            <span className="text-gradient"> Em Parceria</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Trabalhamos com os melhores profissionais e organizações do setor 
            para oferecer qualidade e inovação em todos os nossos serviços.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-primary-600" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
            <div className="text-sm text-gray-600">Colaboradores Ativos</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="text-primary-600" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
            <div className="text-sm text-gray-600">Organizações Parceiras</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="text-primary-600" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">8</div>
            <div className="text-sm text-gray-600">Estados Atendidos</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-primary-600" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">25+</div>
            <div className="text-sm text-gray-600">Anos de Experiência</div>
          </div>
        </motion.div>

        {/* Featured Collaborators */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl font-heading font-bold text-gray-900 mb-8 text-center"
          >
            Colaboradores em Destaque
          </motion.h3>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="card-body text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {collaborators.map((collaborator, index) => (
                <motion.div
                  key={collaborator.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="card-body text-center">
                    {/* Avatar */}
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <Image
                        src={collaborator.avatar}
                        alt={collaborator.name}
                        fill
                        className="object-cover rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='35' fill='%2316a34a'/%3E%3Ctext x='40' y='45' text-anchor='middle' fill='white' font-size='20'%3E👤%3C/text%3E%3C/svg%3E"
                        }}
                      />
                    </div>

                    {/* Info */}
                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {collaborator.name}
                    </h4>
                    <p className="text-sm text-primary-600 font-medium mb-2">
                      {collaborator.role}
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      {collaborator.company}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {collaborator.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Organization Partners */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl font-heading font-bold text-gray-900 mb-8 text-center"
          >
            Organizações Parceiras
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {organizationPartners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 block"
                >
                  <div className="card-body text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2316a34a'/%3E%3Ctext x='32' y='38' text-anchor='middle' fill='white' font-size='12'%3ELOGO%3C/text%3E%3C/svg%3E"
                        }}
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                      {partner.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {partner.description}
                    </p>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center bg-gray-50 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
            Quer se Tornar um Parceiro?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Junte-se à nossa rede de parceiros e colaboradores. Trabalhe conosco 
            para impulsionar o desenvolvimento da suinocultura angolana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/colaboradores"
              className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Ver Todos os Colaboradores
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link
              href="/contato"
              className="inline-flex items-center border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Entre em Contato
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PartnersSection
