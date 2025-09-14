'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LogoPng from '@/components/assets/Logo.png'
import { BRAND_NAME } from '@/lib/brand'
import { signOut } from 'next-auth/react'
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  LogOut, 
  User, 
  Settings,
  Home
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminHeaderProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    avatar?: string | null
    role: string
  }
}

const AdminHeader = ({ user }: AdminHeaderProps) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<any[]>([])

  const loadNotifs = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const json = await res.json()
        setNotifs(json.data?.recentActivity?.slice(0, 5) || [])
      }
    } catch {}
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/admin" className="flex items-center space-x-3 ml-4 lg:ml-0">
              <div className="w-10 h-10 relative">
                {/* Admin logo via config (fallback para logo padrão) */}
                <img id="admin-logo" src="/api/admin/config/logo-admin-proxy" alt={BRAND_NAME} className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">
                  Painel Admin
                </h1>
                <p className="text-xs text-gray-500">
                  {BRAND_NAME}
                </p>
              </div>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar em produtos, notícias e contatos..."
                  onKeyDown={async (e) => {
                    const target = e.target as HTMLInputElement
                    if (e.key === 'Enter' && target.value.trim()) {
                      const q = encodeURIComponent(target.value.trim())
                      window.location.href = `/admin?search=${q}`
                    }
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Seletor de idioma removido do header admin conforme solicitação */}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={async ()=>{ if(!isNotifOpen) await loadNotifs(); setIsNotifOpen(!isNotifOpen) }}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full relative"
              >
                <Bell size={20} />
                {notifs.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">Notificações</div>
                    {notifs.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-gray-500">Sem novas notificações</div>
                    ) : notifs.map((n, idx) => (
                      <div key={idx} className="px-4 py-2 text-sm text-gray-700 border-b last:border-b-0">
                        <div className="font-medium text-gray-900">{n.user || 'Sistema'}</div>
                        <div className="text-gray-600">{n.action}</div>
                        <div className="text-xs text-gray-400">{new Date(n.date).toLocaleString('pt-AO')}</div>
                      </div>
                    ))}
                    <div className="px-4 py-2">
                      <Link href="/admin" className="text-sm text-primary-600 hover:text-primary-700">Ver todas</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Back to Site */}
            <Link
              href="/"
              className="hidden sm:inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Home size={16} className="mr-2" />
              Ver Site
            </Link>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || 'Avatar'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Administrador
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    
                    <Link
                      href="/perfil"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User size={16} />
                      <span>Meu Perfil</span>
                    </Link>
                    
                    <Link
                      href="/admin/configuracoes"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings size={16} />
                      <span>Configurações</span>
                    </Link>
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Sair</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  )
}

export default AdminHeader
