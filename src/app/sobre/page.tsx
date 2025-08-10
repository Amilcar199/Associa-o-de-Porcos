import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quem Somos',
  description: 'Associação de Porcos em Angola: missão, valores e história.'
}

export default function SobrePage() {
  return (
    <section className="container-custom py-12 space-y-10">
      <header>
        <h1 className="text-3xl font-heading font-bold text-primary-800">Quem Somos</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">Promovemos a suinocultura sustentável em Angola, conectando produtores, qualificando profissionais e impulsionando o setor.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Missão</h2>
          <p className="text-gray-700">Impulsionar o desenvolvimento do setor suíno através de capacitação, parcerias e qualidade.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Visão</h2>
          <p className="text-gray-700">Ser referência em suinocultura sustentável em Angola e na região.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Valores</h2>
          <ul className="text-gray-700 list-disc list-inside space-y-1">
            <li>Sustentabilidade</li>
            <li>Qualidade</li>
            <li>Colaboração</li>
            <li>Transparência</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Nossa História</h2>
        <p className="text-gray-700">Desde a fundação, a Associação de Porcos vem unindo esforços para fortalecer a cadeia produtiva, incentivar boas práticas e garantir bem-estar animal, qualidade e competitividade.</p>
      </div>
    </section>
  )
}