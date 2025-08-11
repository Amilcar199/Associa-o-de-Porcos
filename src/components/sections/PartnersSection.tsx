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
    // Seção temporariamente oculta
    <section className="section-padding bg-white hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Conteúdo oculto */}
        </div>

        {/* Stats Cards */}
        {/* Conteúdo oculto */}

        {/* Featured Collaborators */}
        {/* Conteúdo oculto */}

        {/* Partners Carousel */}
        {/* Conteúdo oculto */}

        {/* CTA Partners */}
        {/* Conteúdo oculto */}
      </div>
    </section>
  )
}

export default PartnersSection
