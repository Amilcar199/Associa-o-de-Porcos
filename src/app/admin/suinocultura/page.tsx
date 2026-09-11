import type { Metadata } from 'next'
import FarmsManager from '@/components/admin/FarmsManager'

export const metadata: Metadata = {
  title: 'Suinocultura (Mapa) - Painel Administrativo',
  description: 'Revisão e aprovação de cadastros de fazendas para o Mapa Interativo de Suinocultura',
}

export default function AdminSuinoculturaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suinocultura — Mapa Interativo</h1>
        <p className="text-gray-600 mt-1">
          Revise, aprove ou rejeite os cadastros de fazendas enviados pelos produtores. Apenas cadastros
          aprovados aparecem no mapa público da página &quot;Sobre&quot;.
        </p>
      </div>
      <FarmsManager />
    </div>
  )
}
