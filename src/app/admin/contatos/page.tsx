import { Metadata } from 'next'
import ContactsManager from '@/components/admin/ContactsManager'

export const metadata: Metadata = {
  title: 'Gerenciar Contatos - Painel Administrativo',
  description: 'Gerenciamento de contatos da Associação de Porcos',
}

export default function AdminContactsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Gerenciar Contatos
        </h1>
        <p className="text-gray-600 mt-1">
          Visualize e gerencie todas as mensagens de contato recebidas
        </p>
      </div>

      {/* Contacts Manager */}
      <ContactsManager />
    </div>
  )
}
