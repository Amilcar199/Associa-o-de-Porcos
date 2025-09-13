export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'

async function fetchJSON(url: string, init?: RequestInit) {
  const r = await fetch(url, { cache: 'no-store', ...(init||{}) })
  return r.json()
}

export default async function AdminBolsaPage() {
  const base = process.env.NEXTAUTH_URL || ''
  const list = await fetchJSON(`${base}/api/admin/market-quotes`)
  return (
    <section className="container-custom py-8">
      <h1 className="text-2xl font-heading font-bold text-primary-800">Admin · Bolsa</h1>
      <p className="text-gray-600 mb-4">Gerir cotações oficiais semanais, aprovar, ajustar e publicar.</p>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Semana</th>
              <th className="py-2 pr-4">Região</th>
              <th className="py-2 pr-4">Forma</th>
              <th className="py-2 pr-4">Ref AOA/kg</th>
              <th className="py-2 pr-4">Ref AOA/cabeça</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(list?.data?.results || []).map((q: any) => (
              <tr key={q._id}>
                <td className="py-2 pr-4">{q.weekISO}</td>
                <td className="py-2 pr-4">{q.region}</td>
                <td className="py-2 pr-4">{q.saleForm}</td>
                <td className="py-2 pr-4">{q.refPricePerKg ?? '—'}</td>
                <td className="py-2 pr-4">{q.refPricePerHead ?? '—'}</td>
                <td className="py-2 pr-4">{q.status}</td>
                <td className="py-2 pr-4">
                  <form action={`${base}/api/admin/market-quotes/${q._id}`} method="post" className="inline">
                    <input type="hidden" name="_method" value="PATCH" />
                    <input type="hidden" name="approve" value="true" />
                    <button className="px-2 py-1 text-xs border rounded">Aprovar</button>
                  </form>
                  <form action={`${base}/api/admin/market-quotes/adjust`} method="post" className="inline ml-2">
                    <input type="hidden" name="id" value={q._id} />
                    <input type="hidden" name="percent" value="2" />
                    <input type="hidden" name="publish" value="true" />
                    <button className="px-2 py-1 text-xs border rounded">Ajustar +2% e Publicar</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

