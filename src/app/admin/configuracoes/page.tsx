import { Metadata } from 'next'
import SettingsClient from './SettingsClient'

export const metadata: Metadata = {
  title: 'Configurações - Painel Administrativo',
  description: 'Preferências e configurações'
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Ajuste preferências da plataforma</p>
      </div>

      <SettingsClient />
    </div>
  )
}