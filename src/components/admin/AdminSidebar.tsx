'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Newspaper,
  UsersRound,
  MessageSquare,
  Settings,
  BarChart3,
  Upload,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import ContactBadge from './ContactBadge'

interface MenuItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: number | 'custom'
  children?: MenuItem[]
}

const AdminSidebar = () => {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['produtos', 'conteudo'])
  
  // Garantir que 'conteudo' esteja sempre expandido inicialmente
  useEffect(() => {
    if (!expandedItems.includes('conteudo')) {
      setExpandedItems(prev => [...prev, 'conteudo'])
    }
  }, [])

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard
    },
    {
      name: 'Solicitações',
      href: '/admin/solicitacoes',
      icon: UsersRound
    },
    {
      name: 'Usuários',
      href: '/admin/usuarios',
      icon: Users
    },
    {
      name: 'Produtos',
      href: '#',
      icon: ShoppingCart,
      children: [
        { name: 'Todos os Produtos', href: '/admin/produtos', icon: ShoppingCart },
        { name: 'Adicionar Produto', href: '/admin/produtos/novo', icon: ShoppingCart },
        { name: 'Categorias', href: '/admin/produtos/categorias', icon: FileText }
      ]
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
        { name: 'Novo Conteúdo', href: '/admin/conteudo-membros/novo', icon: FileText }
      ]
    },
    {
      name: 'Contatos',
      href: '/admin/contatos',
      icon: MessageSquare,
      badge: 'custom'
    },
    {
      name: 'Mídia',
      href: '/admin/imagens',
      icon: Upload
    },
    {
      name: 'Relatórios',
      href: '/admin/relatorios',
      icon: BarChart3
    },
    {
      name: 'Configurações',
      href: '/admin/configuracoes',
      icon: Settings
    }
  ]

  const toggleExpanded = (itemName: string) => {
    console.log('Toggle expanded:', itemName, 'Current:', expandedItems)
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const isParentActive = (children: MenuItem[]) => {
    return children.some(child => isActive(child.href))
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name.toLowerCase())
    const active = hasChildren ? isParentActive(item.children!) : isActive(item.href)

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name.toLowerCase())}
            className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium rounded-lg transition-all duration-200 ${
              active
                ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon 
                size={20} 
                className={active ? 'text-primary-600' : 'text-gray-500'} 
              />
              <span>{item.name}</span>
              {item.badge === 'custom' ? (
                <ContactBadge />
              ) : item.badge ? (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </div>
            {isExpanded ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-4 mt-1 space-y-1 overflow-hidden"
              >
                {item.children!.map(child => renderMenuItem(child, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    }

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
          level > 0 ? 'ml-4' : ''
        } ${
          active
            ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center space-x-3">
          <item.icon 
            size={20} 
            className={active ? 'text-primary-600' : 'text-gray-500'} 
          />
          <span>{item.name}</span>
        </div>
        {item.badge === 'custom' ? (
          <ContactBadge />
        ) : item.badge ? (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
            {item.badge}
          </span>
        ) : null}
      </Link>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </aside>

      {/* Mobile Sidebar - implementar quando necessário */}
    </>
  )
}

export default AdminSidebar
