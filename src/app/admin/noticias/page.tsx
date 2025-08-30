import { Metadata } from 'next'
import { BRAND_NAME } from '@/lib/brand'
import NewsManager from '@/components/admin/NewsManager'

export const metadata: Metadata = {
  title: 'Gerenciar Notícias - Painel Administrativo',
  description: `Gerenciamento de notícias da ${BRAND_NAME}`,
}

export default function AdminNewsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Gerenciar Notícias
        </h1>
        <p className="text-gray-600 mt-1">
          Gerencie todas as notícias e artigos da plataforma
        </p>
      </div>

      {/* News Manager */}
      <NewsManager />
    </div>
  )
}
