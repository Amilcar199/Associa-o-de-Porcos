import {
  Archive,
  BadgeCheck,
  BarChart3,
  Bell,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Newspaper,
  Settings,
  ShoppingCart,
  Upload,
  Users,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface AdminMenuItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: 'custom'
  children?: AdminMenuItem[]
}

export const adminMenuItems: AdminMenuItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Solicitações', href: '/admin/solicitacoes', icon: UsersRound },
  { name: 'Usuários', href: '/admin/usuarios', icon: Users },
  {
    name: 'Produtos',
    href: '#',
    icon: ShoppingCart,
    children: [
      { name: 'Todos os Produtos', href: '/admin/produtos', icon: ShoppingCart },
      { name: 'Adicionar Produto', href: '/admin/produtos/novo', icon: ShoppingCart },
      { name: 'Categorias', href: '/admin/produtos/categorias', icon: FileText },
    ],
  },
  {
    name: 'Conteúdo',
    href: '#',
    icon: FileText,
    children: [
      { name: 'Notícias', href: '/admin/noticias', icon: Newspaper },
      { name: 'Nova Notícia', href: '/admin/noticias/nova', icon: Newspaper },
      { name: 'Colaboradores', href: '/admin/colaboradores', icon: UsersRound },
      { name: 'Conteúdo de Membros', href: '/admin/conteudo-membros', icon: Users },
      { name: 'Novo Conteúdo', href: '/admin/conteudo-membros/novo', icon: FileText },
      { name: 'Bolsa', href: '/admin/bolsa', icon: BarChart3 },
      { name: 'Jurídico & Legal', href: '/admin/juridico-legal', icon: FileText },
      { name: 'Gestão Jurídico & Legal', href: '/admin/juridico-legal/gestao', icon: FileText },
    ],
  },
  { name: 'Cotações', href: '/admin/cotacoes', icon: MessageSquare },
  { name: 'Planos', href: '/admin/planos', icon: BadgeCheck },
  { name: 'Registos', href: '/admin/registos', icon: ClipboardList },
  { name: 'Cópias', href: '/admin/copias', icon: Archive },
  { name: 'Contatos', href: '/admin/contatos', icon: MessageSquare, badge: 'custom' },
  { name: 'Suinocultura', href: '/admin/suinocultura', icon: MapPin },
  { name: 'Notificações', href: '/admin/notificacoes', icon: Bell },
  { name: 'Mídia', href: '/admin/imagens', icon: Upload },
  { name: 'Relatórios', href: '/admin/relatorios', icon: BarChart3 },
  { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
]

export function isAdminRouteActive(pathname: string, href: string) {
  if (href === '#') return false
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href)
}
