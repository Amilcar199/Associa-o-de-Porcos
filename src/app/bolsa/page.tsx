export const dynamic = 'force-dynamic'

export default function BolsaPage() {
  return (
    <section>
      <div className="container-custom py-8">
        <h1 className="text-2xl font-heading font-bold text-primary-800">Bolsa de Suínos</h1>
        <p className="text-gray-600">Selecione filtros para visualizar os indicadores (em breve).</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select className="px-3 py-2 border rounded-lg">
            <option>Forma: carcaça (AOA/kg)</option>
            <option>Forma: vivo (AOA/cabeça)</option>
          </select>
          <select className="px-3 py-2 border rounded-lg">
            <option>Região: todas</option>
          </select>
          <select className="px-3 py-2 border rounded-lg">
            <option>Período: 30 dias</option>
            <option>Período: 90 dias</option>
            <option>Período: 180 dias</option>
            <option>Período: 365 dias</option>
            <option>Personalizado…</option>
          </select>
          <select className="px-3 py-2 border rounded-lg">
            <option>Raça (apenas autenticados)</option>
          </select>
        </div>
      </div>
    </section>
  )
}

