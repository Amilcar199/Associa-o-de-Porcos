export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import dynamicImport from 'next/dynamic'
const BolsaClient = dynamicImport(() => import('./BolsaClient'), { ssr: false })

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Pig Market' : 'Bolsa de Suínos',
    description: isEn ? 'Price board and indicators' : 'Quadro de preços e indicadores'
  }
}

export default function BolsaPage() {
<<<<<<< HEAD
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  const rows = Array.from({ length: 8 }).map((_, i) => ({
    date: `2025-09-0${i + 1}`,
    region: 'Luanda',
    category: isEn ? 'Fattening' : 'Engorda',
    price: (i + 1) * 1000,
    variation: i % 2 === 0 ? 1.5 : -0.8
  }))
  return (
    <section>
      <div className="bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
        <div className="container-custom py-10">
          <h1 className="text-3xl font-heading font-bold text-primary-800">{isEn ? 'Pig Market' : 'Bolsa de Suínos'}</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">{isEn ? 'Reference prices, trends and indicators for the pig chain.' : 'Preços de referência, tendências e indicadores para a cadeia suinícola.'}</p>
        </div>
      </div>

      <div className="container-custom py-10 space-y-6">
        {/* Gráfico e Download */}
        <ReportClient rows={rows as any} isEn={isEn} />
        {/* Filtros simples */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-5">
            <select className="px-3 py-2 border rounded-lg">
              <option>{isEn ? 'Region (all)' : 'Região (todas)'}</option>
              <option>Luanda</option>
              <option>Bengo</option>
              <option>Benguela</option>
            </select>
            <select className="px-3 py-2 border rounded-lg">
              <option>{isEn ? 'Category (all)' : 'Categoria (todas)'}</option>
              <option>{isEn ? 'Piglets' : 'Leitão'}</option>
              <option>{isEn ? 'Fattening' : 'Engorda'}</option>
              <option>{isEn ? 'Breeders' : 'Reprodutores'}</option>
            </select>
            <select className="px-3 py-2 border rounded-lg">
              <option>{isEn ? 'Unit' : 'Unidade'}</option>
              <option>{isEn ? 'per kg' : 'por kg'}</option>
              <option>{isEn ? 'per head' : 'por cabeça'}</option>
            </select>
            <input className="px-3 py-2 border rounded-lg" placeholder={isEn ? 'Search' : 'Buscar'} />
            <button className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">{isEn ? 'Filter' : 'Filtrar'}</button>
          </div>
        </div>

        {/* Tabela simples */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isEn ? 'Date' : 'Data'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isEn ? 'Region' : 'Região'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isEn ? 'Category' : 'Categoria'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isEn ? 'Price' : 'Preço'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isEn ? 'Variation' : 'Variação'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.region}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">AOA {r.price.toLocaleString('pt-AO')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${r.variation >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.variation >= 0 ? `+${r.variation}%` : `${r.variation}%`}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
=======
  return (
    <section>
      <BolsaClient />
>>>>>>> cfa2197dd3ba3b02355b9a8f68f8a1c31afacbc5
    </section>
  )
}

