'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, GraduationCap, Map, Wrench } from 'lucide-react'
import { BRAND_NAME } from '@/lib/brand'
import { useLanguage } from '@/components/providers/LanguageProvider'

const HomeGuide = () => {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')

  const steps = isEn
    ? [
        { n: '01', title: 'Who we are', text: `${BRAND_NAME} organises producers and speaks for the sector.`, href: '/sobre', label: 'About us' },
        { n: '02', title: 'What we do', text: 'Consulting, training, herd health and management support.', href: '/servicos', label: 'Services' },
        { n: '03', title: 'The value', text: 'Animals with a known origin, a price reference and a peer network.', href: '/produtos', label: 'Products' },
        { n: '04', title: 'How to join', text: 'Create an account, ask for membership, or talk to the team.', href: '/registro', label: 'Register' },
        { n: '05', title: 'How to use it', text: 'Map, catalogue, market prices, news and the members area.', href: '#usar', label: 'See the paths' },
      ]
    : [
        { n: '01', title: 'Quem é', text: `A ${BRAND_NAME} organiza produtores e dá voz ao setor.`, href: '/sobre', label: 'Quem somos' },
        { n: '02', title: 'O que faz', text: 'Consultoria, formação, saúde do rebanho e apoio de gestão.', href: '/servicos', label: 'Serviços' },
        { n: '03', title: 'Que valor oferece', text: 'Animais com procedência, referência de preços e uma rede de pares.', href: '/produtos', label: 'Produtos' },
        { n: '04', title: 'Como participar', text: 'Crie conta, peça a adesão ou fale com a equipa.', href: '/registro', label: 'Registo' },
        { n: '05', title: 'Como usar', text: 'Mapa, catálogo, bolsa, notícias e área de membros.', href: '#usar', label: 'Ver os caminhos' },
      ]

  const figures = isEn
    ? [
        { value: '100+', label: 'Associated producers' },
        { value: '20+', label: 'Trainings' },
        { value: '1,500+', label: 'Pigs traded' },
        { value: '95%', label: 'Member satisfaction' },
      ]
    : [
        { value: '100+', label: 'Produtores associados' },
        { value: '20+', label: 'Capacitações' },
        { value: '1.500+', label: 'Suínos comercializados' },
        { value: '95%', label: 'Satisfação dos associados' },
      ]

  const paths = isEn
    ? [
        { icon: Wrench, title: 'Services', text: 'What the association does for the farm, from routine to biosecurity.', href: '/servicos', label: 'See services' },
        { icon: Map, title: 'Pig-farming map', text: 'Where producers are, and the figures for each province.', href: '/sobre#mapa', label: 'Open the map' },
        { icon: BookOpen, title: 'Knowledge', text: 'Sector news, events and the training the association offers.', href: '/noticias', label: 'Read the news' },
      ]
    : [
        { icon: Wrench, title: 'Serviços', text: 'O que a associação faz pela granja, da rotina à biossegurança.', href: '/servicos', label: 'Ver serviços' },
        { icon: Map, title: 'Mapa da suinocultura', text: 'Onde estão os produtores e os números de cada província.', href: '/sobre#mapa', label: 'Abrir o mapa' },
        { icon: BookOpen, title: 'Conhecimento', text: 'Notícias do setor, eventos e a formação que a associação oferece.', href: '/noticias', label: 'Ler notícias' },
      ]

  return (
    <section className="bg-white py-14 lg:py-16">
      <div className="container-custom">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
            {isEn ? 'The association' : 'A associação'}
          </span>
          <h2 className="font-heading text-3xl font-bold text-gray-900 lg:text-4xl">
            {isEn ? 'From the producer to the platform' : 'Do produtor à plataforma'}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            {isEn
              ? 'One reading of the site: who we are, what we do, the value, how to join and how to use each area.'
              : 'Uma leitura do site: quem somos, o que fazemos, o valor, como entrar e como usar cada área.'}
          </p>
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-5">
          {steps.map((step) => (
            <li key={step.n} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <span className="text-sm font-semibold text-primary-700">{step.n}</span>
              <h3 className="mt-2 font-heading text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.text}</p>
              <Link href={step.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800">
                {step.label} <ArrowRight size={14} />
              </Link>
            </li>
          ))}
        </ol>

        <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {figures.map((item) => (
            <div key={item.label} className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-4 text-center">
              <dt className="text-sm text-primary-800">{item.label}</dt>
              <dd className="mt-1 font-heading text-2xl font-bold text-gray-900">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div id="usar" className="scroll-mt-28 mt-12">
          <h3 className="text-center font-heading text-2xl font-bold text-gray-900">
            {isEn ? 'Where to go next' : 'Por onde começar'}
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {paths.map((item) => (
              <Link key={item.title} href={item.href} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <item.icon className="text-primary-600" size={22} />
                <h4 className="mt-4 font-heading text-lg font-semibold text-gray-900">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-700">
                  {item.label} <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <Link href="/servicos" className="inline-flex items-center gap-1 font-medium text-primary-700 hover:text-primary-800">
              <GraduationCap size={16} /> {isEn ? 'Training lives with the services' : 'A formação está nos serviços'}
            </Link>
            <Link href="/colaboradores" className="font-medium text-primary-700 hover:text-primary-800">
              {isEn ? 'Partners and leadership' : 'Parceiros e liderança'}
            </Link>
            <Link href="/juridico-legal" className="font-medium text-primary-700 hover:text-primary-800">
              {isEn ? 'Institutional information' : 'Informação institucional'}
            </Link>
            <Link href="/contato" className="font-medium text-primary-700 hover:text-primary-800">
              {isEn ? 'Contact' : 'Contacto'}
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default HomeGuide
