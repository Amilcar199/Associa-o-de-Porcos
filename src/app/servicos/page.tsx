import type { Metadata } from 'next'
import { Wrench, GraduationCap, Stethoscope, Shield, BarChart3, Users, Leaf, CheckCircle, Sparkles, ArrowRight, PhoneCall, MessageCircle } from 'lucide-react'

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
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-white border-b border-gray-100">
        <div className="container-custom py-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-primary-700 bg-primary-100/70 rounded-full px-3 py-1">
              <Sparkles size={14} /> O que fazemos
            </span>
            <h1 className="mt-3 text-3xl md:text-4xl font-heading font-bold text-primary-800 leading-tight">Serviços e Especialidades</h1>
            <p className="text-gray-600 mt-3 md:text-lg">
              Suporte técnico, capacitação e parcerias para uma suinocultura mais produtiva, sustentável e competitiva em toda a cadeia.
            </p>
          </div>

          {/* Badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {['Consultoria', 'Capacitação', 'Biossegurança', 'Qualidade', 'Gestão', 'Parcerias'].map(b => (
              <span key={b} className="inline-flex items-center gap-2 text-sm text-primary-800 bg-primary-100/60 px-3 py-1.5 rounded-full border border-primary-200">
                <CheckCircle size={14} className="text-primary-600" /> {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de serviços */}
      <div className="container-custom py-10">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.title} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 opacity-60" />
              <div className="p-6">
                <div className="inline-flex items-center justify-center rounded-xl bg-primary-50 text-primary-700 p-2 ring-1 ring-primary-200/50">
                  <service.icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{service.title}</h3>
                <p className="mt-1.5 text-gray-600">{service.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle size={16} className="mt-[2px] text-primary-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <a href="/contato" className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800">
                    Saber mais <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Destaques */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="text-primary-600" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900">Práticas Modernas</h4>
                <p className="text-sm text-gray-600 mt-1">Atualização constante em tecnologia e gestão para resultados consistentes.</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5">
            <div className="flex items-start gap-3">
              <Shield className="text-primary-600" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900">Biossegurança</h4>
                <p className="text-sm text-gray-600 mt-1">Protocolos claros e apoio prático para proteger o seu rebanho.</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5">
            <div className="flex items-start gap-3">
              <BarChart3 className="text-primary-600" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900">Gestão por Indicadores</h4>
                <p className="text-sm text-gray-600 mt-1">Decisões baseadas em dados com foco em produtividade e qualidade.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12">
          <div className="bg-gradient-to-br from-primary-700 to-primary-600 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h4 className="text-xl md:text-2xl font-semibold">Precisa de suporte especializado?</h4>
              <p className="text-primary-100 mt-1 md:text-base">Fale com nossa equipe e monte um plano sob medida para sua granja.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/contato" className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors">
                Falar com a equipe <ArrowRight size={18} />
              </a>
              <a href="tel:+244928476427" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 px-4 py-2 rounded-lg font-medium transition-colors">
                <PhoneCall size={18} /> Ligar agora
              </a>
              <a href="https://wa.me/244928476427" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-lg font-medium transition-colors">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

