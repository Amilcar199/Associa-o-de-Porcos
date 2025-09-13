export const dynamic = 'force-dynamic'

export default function BolsaPage() {
  return (
    <section>
      <div className="container-custom py-8">
        <h1 className="text-2xl font-heading font-bold text-primary-800">Bolsa de Suínos</h1>
        <p className="text-gray-600">Selecione filtros para visualizar os indicadores.</p>
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

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500">Preço médio atual — média geral</div>
            <div className="text-3xl font-bold mt-1">—</div>
            <div className="text-xs text-gray-500 mt-1">Base 0 registos</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500">Variação diária</div>
            <div className="mt-1 text-sm text-gray-500">—</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-gray-500">Variação semanal</div>
                <div className="mt-1 text-sm text-gray-500">—</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Variação mensal</div>
                <div className="mt-1 text-sm text-gray-500">—</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Série histórica</h3>
            <div className="text-xs text-gray-500">Exportar: <button className="underline">SVG</button> · <button className="underline">PNG</button></div>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Gráfico será exibido aqui</div>
        </div>
        <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Comparação entre regiões</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Gráfico de comparação (2 regiões) será exibido aqui</div>
        </div>
      </div>
    </section>
  )
}

