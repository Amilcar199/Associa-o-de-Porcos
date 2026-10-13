'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import ContactBadge from './ContactBadge'
import { adminMenuItems, isAdminRouteActive, type AdminMenuItem } from './adminMenu'

const activeClasses = 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
const idleClasses = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'

export default function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || ''
  const [expandedItems, setExpandedItems] = useState<string[]>(['produtos', 'conteudo'])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((item) => item !== itemName) : [...prev, itemName]
    )
  }

  const renderItem = (item: AdminMenuItem, level = 0) => {
    const hasChildren = !!item.children?.length
    const active = hasChildren
      ? item.children!.some((child) => isAdminRouteActive(pathname, child.href))
      : isAdminRouteActive(pathname, item.href)

    if (hasChildren) {
      const isExpanded = expandedItems.includes(item.name.toLowerCase())
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name.toLowerCase())}
            aria-expanded={isExpanded}
            className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium rounded-lg transition-all duration-200 ${
              active ? activeClasses : idleClasses
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon size={20} className={active ? 'text-primary-600' : 'text-gray-500'} />
              <span>{item.name}</span>
            </div>
            {isExpanded ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-4 mt-1 space-y-1 overflow-hidden"
              >
                {item.children!.map((child) => renderItem(child, level + 1))}
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
        onClick={onNavigate}
        className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          level > 0 ? 'ml-4' : ''
        } ${active ? activeClasses : idleClasses}`}
      >
        <div className="flex items-center space-x-3">
          <item.icon size={20} className={active ? 'text-primary-600' : 'text-gray-500'} />
          <span>{item.name}</span>
        </div>
        {item.badge === 'custom' ? <ContactBadge /> : null}
      </Link>
    )
  }

  return <nav className="p-4 space-y-2">{adminMenuItems.map((item) => renderItem(item))}</nav>
}
