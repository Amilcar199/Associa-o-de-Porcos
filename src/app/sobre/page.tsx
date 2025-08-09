import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quem Somos',
  description: 'Associação de Porcos em Angola: missão, valores e história.'
}

export default function SobrePage() {
  return (
    <section className="container-custom py-12">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-6">Quem Somos</h1>
      <div className="prose max-w-none">
        <p>
          A Associação de Porcos é uma organização angolana dedicada à promoção da suinocultura sustentável,
          conectando produtores, fomentando conhecimento técnico e valorizando práticas responsáveis.
        </p>
        <h2>Missão</h2>
        <p>
          Impulsionar o desenvolvimento do setor suíno em Angola através de capacitação, parcerias e qualidade.
        </p>
        <h2>Valores</h2>
        <ul>
          <li>Sustentabilidade</li>
          <li>Qualidade</li>
          <li>Colaboração</li>
          <li>Transparência</li>
        </ul>
      </div>
    </section>
  )
}