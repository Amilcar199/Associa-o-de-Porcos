import LegalManager from '@/components/admin/LegalManager'
import { cookies } from 'next/headers'

export default function AdminLegalPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEn ? 'Legal & Compliance' : 'Jurídico & Legal'}</h1>
        <p className="text-gray-600">{isEn ? 'Manage Legal & Compliance sections and documents' : 'Gerencie documentos e sessões do Jurídico & Legal'}</p>
      </div>

      <LegalManager />
    </div>
  )
}

