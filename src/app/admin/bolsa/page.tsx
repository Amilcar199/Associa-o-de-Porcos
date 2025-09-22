export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import AdminBolsaClient from './AdminBolsaClient'

export default function AdminBolsaPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{isEn ? 'Market (Admin)' : 'Bolsa (Admin)'}</h1>
        <p className="text-gray-600">{isEn ? 'Visualize and correct market data.' : 'Visualize e corrija os dados da bolsa.'}</p>
      </div>
      <AdminBolsaClient />
    </section>
  )
}

