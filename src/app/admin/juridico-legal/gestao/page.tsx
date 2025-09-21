import LegalManager from '@/components/admin/LegalManager'
import { cookies } from 'next/headers'

export default function AdminLegalManagementPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEn ? 'Legal & Compliance — Management' : 'Jurídico & Legal — Gestão'}</h1>
        <p className="text-gray-600">{isEn ? 'Add, edit and organize legal sections and documents.' : 'Adicione, edite e organize seções e documentos legais.'}</p>
      </div>

      <LegalManager showUploader={false} />
    </div>
  )
}

