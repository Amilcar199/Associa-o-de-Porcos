'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LogoPng from '@/components/assets/Logo.png'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  User, 
  Users,
  LogOut, 
  Settings,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [siteConfig, setSiteConfig] = useState<any>(null)
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  // Detectar scroll para adicionar sombra ao header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(()=>{
    const load = async () => {
      try { const res = await fetch('/api/admin/config', { cache: 'no-store' }); if (res.ok){ const j = await res.json(); setSiteConfig(j?.data || null) } } catch {}
    }
    load()
  },[])

  // Prefetch programático das rotas mais acessadas
  useEffect(() => {
    const routesToPrefetch = ['/', '/sobre', '/produtos', '/noticias', '/contato', '/login', '/registro']
    routesToPrefetch.forEach((route) => {
      try { router.prefetch(route) } catch {}
    })
  }, [router])

  // Fechar menus ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [pathname])

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Quem Somos', href: '/sobre' },
    { name: 'Produtos', href: '/produtos' },
    { name: 'Notícias', href: '/noticias' },
    { name: 'Contato', href: '/contato' },
  ]

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <>
      {/* Top Bar com informações de contato */}
      <div className="bg-primary-800 text-white py-2 hidden md:block">
        <div className="container-custom">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone size={14} />
                <span>+244 928 476 427</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={14} />
                <span>contato@associacaodeporcos.ao</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={14} />
                <span>Luanda, Angola</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {status === 'loading' ? (
                <div className="animate-pulse">Carregando...</div>
              ) : session ? (
                <div className="flex items-center space-x-2">
                  <span>Olá, {session.user?.name}</span>
                  {session.user?.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="text-primary-200 hover:text-white transition-colors"
                    >
                      Painel Admin
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/login" 
                    prefetch
                    className="text-primary-200 hover:text-white transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link 
                    href="/registro" 
                    prefetch
                    className="bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded transition-colors"
                  >
                    Cadastre-se
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <header 
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-32 lg:h-32">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-16 h-16 lg:w-24 lg:h-24 relative border-spacing-x-1">
                {siteConfig?.logoUrl ? (
                  <img src={siteConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Image
                    src={LogoPng}
                    alt="Associação de Porcos"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 48px, 56px"
                    priority
                  />
                )}
              </div>
              <div className="hidden sm:block mt-6">
                <h1 className="text-xl lg:text-3xl font-heading font-bold text-primary-800 bg-primary">
                  Associação de Suinocultores
                </h1>
                <h1 className="text-xl lg:text-xl font-heading font-bold text-primary-800" > do Norte</h1>
                <p className="text-xs lg:text-sm text-gray-600">
                  Criação Sustentável
                </p>
              </div>
            </Link>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
                  className={`font-medium transition-colors relative ${
                    isActiveLink(item.href)
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                  {isActiveLink(item.href) && (
                    <motion.div
                      layoutId="activeLink"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* User Menu Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                      {session.user?.avatar ? (
                        <Image
                          src={session.user.avatar}
                          alt={session.user.name || 'Avatar'}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        session.user?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="font-medium text-gray-700">
                      {session.user?.name}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                      >
                        <Link
                          href="/perfil"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User size={16} />
                          <span>Meu Perfil</span>
                        </Link>
                        
                        {(session.user?.role === 'member' || session.user?.role === 'admin') && (
                          <Link
                            href="/membros"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Users size={16} />
                            <span>Área de Membros</span>
                          </Link>
                        )}
                        
                        {session.user?.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Settings size={16} />
                            <span>Painel Admin</span>
                          </Link>
                        )}
                        
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
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/registro"
                    className="btn-primary"
                  >
                    Faça Parte
                  </Link>
                </div>
              )}
            </div>

            {/* Botão Menu Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200"
            >
              <div className="container-custom py-4">
                <nav className="space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block py-2 font-medium transition-colors ${
                        isActiveLink(item.href)
                          ? 'text-primary-600'
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {session ? (
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                          {session.user?.avatar ? (
                            <Image
                              src={session.user.avatar}
                              alt={session.user.name || 'Avatar'}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            session.user?.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {session.user?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      
                      <Link
                        href="/perfil"
                        className="flex items-center space-x-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        <User size={20} />
                        <span>Meu Perfil</span>
                      </Link>
                      
                      {session.user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                        >
                          <Settings size={20} />
                          <span>Painel Admin</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 py-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <LogOut size={20} />
                        <span>Sair</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      <Link
                        href="/login"
                        className="block py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                      >
                        Entrar
                      </Link>
                      <Link
                        href="/registro"
                        className="btn-primary inline-block"
                      >
                        Faça Parte
                      </Link>
                    </div>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}

export default Header
