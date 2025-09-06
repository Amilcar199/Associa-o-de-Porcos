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

interface PartnerItem {
  _id: string
  name: string
  role: string
  company?: string
  avatar: string
  description: string
  featured: boolean
}

const PartnersSection = () => {
  const [collaborators, setCollaborators] = useState<PartnerItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCollaborators = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/collaborators?limit=4', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao buscar colaboradores')
      const json = await res.json()
      const data = Array.isArray(json.data) ? json.data.slice(0, 4) : []
      setCollaborators(data)
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCollaborators()
  }, [])

  if (!loading && collaborators.length === 0) {
    return null
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Parceiros e Colaboradores
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-6">
            Nossa Rede de <span className="text-gradient">Especialistas</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Profissionais que apoiam nossa missão com conhecimento e experiência.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="card animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-lg" />
                <div className="card-body space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : collaborators.length === 0 ? null : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {collaborators.slice(0, 4).map((c) => (
              <div key={c._id} className="bg-white rounded-2xl shadow hover:shadow-xl transition p-6 text-center">
                <div className="mx-auto w-44 h-44 md:w-56 md:h-56 rounded-full ring-4 ring-white shadow overflow-hidden bg-gray-100">
                  <div className="relative w-full h-full">
                    <Image src={c.avatar} alt={c.name} fill className="object-cover" />
                  </div>
                </div>
                <h3 className="mt-6 font-bold text-lg text-gray-900">{c.name}</h3>
                <p className="text-sm text-gray-600">{c.role}{c.company ? ` · ${c.company}` : ''}</p>
                {c.description && (
                  <p className="text-sm text-gray-700 leading-relaxed mt-3 line-clamp-3">{c.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {collaborators.length > 0 && (
        <div className="text-center">
          <Link href="/colaboradores" className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300">
            Ver Todos os Colaboradores
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
        )}
      </div>
    </section>
  )
}

export default PartnersSection
