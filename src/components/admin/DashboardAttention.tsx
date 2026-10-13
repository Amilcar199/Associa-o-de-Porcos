'use client'

import Link from 'next/link'
import { AlertCircle, ClipboardList, MapPin, MessageSquare, Newspaper, Plus, ShoppingCart, Users } from 'lucide-react'
import { reportValue, useAdminStats } from './useAdminStats'

const queues = [
  { title: 'Fazendas por aprovar', group: 'Produtores', label: 'Fazendas pendentes', href: '/admin/suinocultura', icon: MapPin },
  { title: 'Anúncios por rever', group: 'Produtos', label: 'Anúncios pendentes', href: '/admin/produtos', icon: ShoppingCart },
  { title: 'Cotações abertas', group: 'Pedidos de cotação', label: 'Abertos', href: '/admin/cotacoes', icon: ClipboardList },
  { title: 'Contactos novos', group: 'Contactos', label: 'Novos', href: '/admin/contatos', icon: MessageSquare },
]

const shortcuts = [
  { name: 'Novo produto', href: '/admin/produtos/novo', icon: Plus },
  { name: 'Nova notícia', href: '/admin/noticias/nova', icon: Newspaper },
  { name: 'Solicitações', href: '/admin/solicitacoes', icon: Users },
  { name: 'Relatórios', href: '/admin/relatorios', icon: AlertCircle },
]

export default function DashboardAttention() {
  const { stats, loading } = useAdminStats()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {shortcuts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <item.icon size={16} />
            </span>
            {item.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {queues.map((item) => {
          const value = reportValue(stats, item.group, item.label)
          const needsAction = value > 0
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${needsAction ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500'}`}>
                  <item.icon size={16} />
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? '–' : value}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-800">{item.title}</p>
              <p className="text-xs text-gray-500">{needsAction ? 'Precisa de atenção' : 'Nada pendente'}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
