import type { Metadata } from 'next'
import { Wrench, GraduationCap, Stethoscope, Shield, BarChart3, Users, Leaf } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Serviços',
  description: 'Nossos serviços e especialidades para apoiar suinocultores com consultoria técnica, capacitação e parcerias.'
}

type Service = {
  title: string
  description: string
  icon: any
  items: string[]
}

const services: Service[] = [
  {
    title: 'Consultoria Técnica',
    description: 'Assistência especializada no dia a dia da granja para elevar produtividade e bem‑estar.',
    icon: Wrench,
    items: [
      'Manejo e nutrição de rebanho',
      'Instalações, ambiência e lotação',
      'Planejamento reprodutivo e genética'
    ]
  },
  {
    title: 'Capacitação e Treinamentos',
    description: 'Formações contínuas, dias de campo e workshops com especialistas.',
    icon: GraduationCap,
    items: [
      'Boas práticas de produção',
      'Segurança e bem‑estar animal',
      'Gestão de equipe e rotinas'
    ]
  },
  {
    title: 'Sanidade e Biossegurança',
    description: 'Protocolos preventivos e apoio no controle de enfermidades.',
    icon: Stethoscope,
    items: [
      'Planos de vacinação e quarentena',
      'Diagnóstico e monitoramento',
      'Controle de pragas e desinfecção'
    ]
  },
  {
    title: 'Qualidade e Sustentabilidade',
    description: 'Padrões técnicos e ações sustentáveis alinhados ao nosso propósito.',
    icon: Leaf,
    items: [
      'Bem‑estar animal e ambiência',
      'Gestão de resíduos e água',
      'Rastreabilidade e conformidade'
    ]
  },
  {
    title: 'Gestão e Dados',
    description: 'Indicadores, processos e tecnologia para decisões melhores.',
    icon: BarChart3,
    items: [
      'KPIs de desempenho zootécnico',
      'Padronização de rotinas',
      'Apoio em seleção de ferramentas'
    ]
  },
  {
    title: 'Rede de Especialistas e Parcerias',
    description: 'Conexão com profissionais e parceiros para acelerar resultados.',
    icon: Users,
    items: [
      'Acesso à nossa rede de especialistas',
      'Parcerias técnicas e comerciais',
      'Integração com fornecedores'
    ]
  },
  {
    title: 'Proteção e Conformidade',
    description: 'Orientação para minimizar riscos e atender requisitos legais.',
    icon: Shield,
    items: [
      'Procedimentos de biossegurança',
      'Adequação a normas e auditorias',
      'Planos de contingência'
    ]
  }
]

export default function ServicosPage() {
  return (
    <section>
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
        <div className="container-custom py-10">
          <h1 className="text-3xl font-heading font-bold text-primary-800">Serviços e Especialidades</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Suporte técnico, capacitação e parcerias para uma suinocultura mais produtiva, sustentável e
            competitiva em toda a cadeia.
          </p>
        </div>
      </div>

      {/* Grid de serviços */}
      <div className="container-custom py-10">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.title} className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="p-6">
                <service.icon className="text-primary-600" size={28} />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{service.title}</h3>
                <p className="mt-2 text-gray-600">{service.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc pl-5">
                  {service.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10">
          <div className="bg-primary-700 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="text-xl font-semibold">Precisa de suporte especializado?</h4>
              <p className="text-primary-100 mt-1">Fale com nossa equipe e monte um plano sob medida para sua granja.</p>
            </div>
            <div className="flex gap-3">
              <a href="/contato" className="bg-white text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors">Falar com a equipe</a>
              <a href="tel:+244928476427" className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-lg font-medium transition-colors">Ligar agora</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

