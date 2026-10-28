import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Wrench, GraduationCap, Stethoscope, Shield, BarChart3, Users, Leaf, CheckCircle, ArrowRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import SurfaceCard from '@/components/ui/SurfaceCard'

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Services' : 'Serviços',
    description: isEn
      ? 'Our services and specialties to support pig farmers with technical consulting, training, and partnerships.'
      : 'Nossos serviços e especialidades para apoiar suinocultores com consultoria técnica, capacitação e parcerias.'
  }
}

type Service = {
  title: string
  description: string
  icon: any
  items: string[]
}

function getServices(isEn: boolean): Service[] {
  if (isEn) {
    return [
      {
        title: 'Technical Consulting',
        description: 'Specialized assistance in daily farm routines to improve productivity and welfare.',
        icon: Wrench,
        items: ['Herd management and nutrition', 'Facilities, environment and stocking density', 'Reproductive planning and genetics']
      },
      {
        title: 'Training & Workshops',
        description: 'Continuous training, field days and workshops with experts.',
        icon: GraduationCap,
        items: ['Good production practices', 'Safety and animal welfare', 'Team management and routines']
      },
      {
        title: 'Health & Biosecurity',
        description: 'Preventive protocols and support for disease control.',
        icon: Stethoscope,
        items: ['Vaccination and quarantine plans', 'Diagnostics and monitoring', 'Pest control and disinfection']
      },
      {
        title: 'Quality & Sustainability',
        description: 'Technical standards and sustainable actions aligned with our purpose.',
        icon: Leaf,
        items: ['Animal welfare and environment', 'Waste and water management', 'Traceability and compliance']
      },
      {
        title: 'Management & Data',
        description: 'Indicators, processes and technology for better decisions.',
        icon: BarChart3,
        items: ['Zootechnical performance KPIs', 'Routine standardization', 'Support in tool selection']
      },
      {
        title: 'Experts & Partnerships',
        description: 'Connection with professionals and partners to accelerate results.',
        icon: Users,
        items: ['Access to our expert network', 'Technical and commercial partnerships', 'Integration with suppliers']
      },
      {
        title: 'Protection & Compliance',
        description: 'Guidance to minimize risks and meet legal requirements.',
        icon: Shield,
        items: ['Biosecurity procedures', 'Compliance with standards and audits', 'Contingency plans']
      }
    ]
  }
  return [
    {
      title: 'Consultoria Técnica',
      description: 'Assistência especializada no dia a dia da granja para elevar produtividade e bem‑estar.',
      icon: Wrench,
      items: ['Manejo e nutrição de rebanho', 'Instalações, ambiência e lotação', 'Planejamento reprodutivo e genética']
    },
    {
      title: 'Capacitação e Treinamentos',
      description: 'Formações contínuas, dias de campo e workshops com especialistas.',
      icon: GraduationCap,
      items: ['Boas práticas de produção', 'Segurança e bem‑estar animal', 'Gestão de equipe e rotinas']
    },
    {
      title: 'Sanidade e Biossegurança',
      description: 'Protocolos preventivos e apoio no controle de enfermidades.',
      icon: Stethoscope,
      items: ['Planos de vacinação e quarentena', 'Diagnóstico e monitoramento', 'Controle de pragas e desinfecção']
    },
    {
      title: 'Qualidade e Sustentabilidade',
      description: 'Padrões técnicos e ações sustentáveis alinhados ao nosso propósito.',
      icon: Leaf,
      items: ['Bem‑estar animal e ambiência', 'Gestão de resíduos e água', 'Rastreabilidade e conformidade']
    },
    {
      title: 'Gestão e Dados',
      description: 'Indicadores, processos e tecnologia para decisões melhores.',
      icon: BarChart3,
      items: ['KPIs de desempenho zootécnico', 'Padronização de rotinas', 'Apoio em seleção de ferramentas']
    },
    {
      title: 'Rede de Especialistas e Parcerias',
      description: 'Conexão com profissionais e parceiros para acelerar resultados.',
      icon: Users,
      items: ['Acesso à nossa rede de especialistas', 'Parcerias técnicas e comerciais', 'Integração com fornecedores']
    },
    {
      title: 'Proteção e Conformidade',
      description: 'Orientação para minimizar riscos e atender requisitos legais.',
      icon: Shield,
      items: ['Procedimentos de biossegurança', 'Adequação a normas e auditorias', 'Planos de contingência']
    }
  ]
}

export default function ServicosPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  const services = getServices(isEn)

  return (
    <>
      <PageHeader
        title={isEn ? 'Services' : 'Serviços'}
        description={isEn
          ? 'Technical support, training and partnerships for the farm.'
          : 'Apoio técnico, formação e parcerias para a granja.'}
      />

      <section className="container-custom py-10 md:py-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <SurfaceCard key={service.title} interactive>
              <div className="inline-flex items-center justify-center rounded-xl bg-primary-50 p-2 text-primary-700">
                <service.icon size={22} />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-gray-900">{service.title}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{service.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {service.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-[2px] shrink-0 text-primary-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          ))}
        </div>

        <SurfaceCard className="mt-8 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="font-heading text-lg font-semibold text-gray-900">
              {isEn ? 'Need specialized support?' : 'Precisa de suporte especializado?'}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {isEn ? 'Talk to our team and build a tailored plan for your farm.' : 'Fale com a nossa equipa e monte um plano à medida da sua granja.'}
            </p>
          </div>
          <a href="/contato" className="btn-primary mt-4 inline-flex items-center gap-2 sm:mt-0 sm:shrink-0">
            {isEn ? 'Talk to the team' : 'Falar com a equipa'} <ArrowRight size={18} />
          </a>
        </SurfaceCard>
      </section>
    </>
  )
}

