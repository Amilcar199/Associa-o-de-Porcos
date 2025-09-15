import LegalManager from '@/components/admin/LegalManager'

export default function AdminLegalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jurídico & Legal</h1>
        <p className="text-gray-600">Gerencie documentos e sessões do Jurídico & Legal</p>
      </div>

      <LegalManager />
    </div>
  )
}

