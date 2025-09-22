export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'

export default async function AdminBolsaPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')

  // Basic fetch to verify API responds
  let summary: any = null
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
    const res = await fetch(`${baseUrl}/api/market/summary`, { cache: 'no-store' })
    if (res.ok) summary = await res.json()
  } catch {}

  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{isEn ? 'Market (Admin)' : 'Bolsa (Admin)'}</h1>
        <p className="text-gray-600">{isEn ? 'Admin view for market data and health checks.' : 'Visão administrativa dos dados de mercado e status.'}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{isEn ? 'API status' : 'Status da API'}</h2>
          {summary ? (
            <div className="text-sm text-gray-700">
              <div className="flex items-center justify-between py-1 border-b">
                <span>{isEn ? 'Response' : 'Resposta'}</span>
                <span className="text-green-700">OK</span>
              </div>
              <div className="py-2">
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-48">{JSON.stringify(summary, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700">
              <div className="flex items-center justify-between py-1 border-b">
                <span>{isEn ? 'Response' : 'Resposta'}</span>
                <span className="text-red-700">{isEn ? 'Unavailable' : 'Indisponível'}</span>
              </div>
              <p className="mt-2 text-gray-600">{isEn ? 'Could not load /api/market/summary' : 'Não foi possível carregar /api/market/summary'}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{isEn ? 'How to populate' : 'Como popular'}</h2>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>{isEn ? 'Ensure market records exist in the database.' : 'Garanta que existam registos de mercado no banco.'}</li>
            <li>{isEn ? 'Use the public Market page to validate trends.' : 'Use a página Bolsa pública para validar as tendências.'}</li>
            <li>{isEn ? 'Check /api/market/meta for regions/breeds.' : 'Confira /api/market/meta para regiões/raças.'}</li>
          </ol>
        </div>
      </div>
    </section>
  )
}

