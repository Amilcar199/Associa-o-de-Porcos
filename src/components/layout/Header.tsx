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
import { useLanguage } from '@/components/providers/LanguageProvider'
import pt from '@/lib/i18n/dictionaries/pt'
import en from '@/lib/i18n/dictionaries/en'
import HeaderLanguageMenu from '@/components/i18n/HeaderLanguageMenu'
import { BRAND_NAME, BRAND_TITLE_LINE1, BRAND_TITLE_LINE2 } from '@/lib/brand'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [siteConfig, setSiteConfig] = useState<any>(null)
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useLanguage()
  const dict = locale.startsWith('en') ? en : pt

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
    const routesToPrefetch = ['/', '/sobre', '/colaboradores', '/servicos', '/produtos', '/noticias', '/contato', '/login', '/registro']
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
    { name: dict.nav.home, href: '/' },
    // Quem Somos terá dropdown customizado
    { name: dict.nav.about, href: '/sobre' },
    { name: dict.nav.services, href: '/servicos' },
    { name: dict.nav.products, href: '/produtos' },
    { name: dict.nav.news, href: '/noticias' },
    { name: dict.nav.contact, href: '/contato' },
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
      <div className="bg-primary-800 text-white py-1 hidden md:block">
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
              {/* Language switcher always visible on desktop top bar */}
              <HeaderLanguageMenu />
              {status === 'loading' ? (
                <div className="animate-pulse">{dict.user.loading}</div>
              ) : session ? (
                <div className="flex items-center space-x-2">
                  <span>{dict.user.greeting}, {session.user?.name}</span>
                  {session.user?.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="text-primary-200 hover:text-white transition-colors"
                    >
                      {dict.user.admin}
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
                    {dict.user.login}
                  </Link>
                  <Link 
                    href="/registro" 
                    prefetch
                    className="btn-primary"
                  >
                    {dict.user.signup}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <header 
        className={`sticky top-0 z-50 bg-primary-800 transition-all duration-300 ${
          isScrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20 lg:h-36">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 lg:space-x-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 relative">
                {siteConfig?.publicLogoUrl || siteConfig?.logoUrl ? (
                  <img src={siteConfig.publicLogoUrl || siteConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Image
                    src={LogoPng}
                    alt={BRAND_NAME}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 144px"
                    priority
                  />
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-3xl font-heading font-bold text-white leading-tight">

                  Associação de Suinocultores
                  <span className="block">do Norte</span>

                </h1>
                <p className="text-xs lg:text-base text-primary-100">{dict.site?.tagline || 'Criação Sustentável'}</p>
              </div>
            </Link>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex items-center gap-10 xl:gap-12">
              {navItems.map((item) => {
                if (item.name === dict.nav.about) {
                  return (
                    <div
                      key={item.name}
                      className="relative"
                      onMouseEnter={() => setIsAboutMenuOpen(true)}
                      onMouseLeave={() => setIsAboutMenuOpen(false)}
                    >
                      <button
                        className={`font-medium lg:text-lg transition-colors relative flex items-center gap-1 ${
                          isActiveLink(item.href)
                            ? 'text-white'
                            : 'text-white/80 hover:text-white'
                        }`}
                        onClick={() => setIsAboutMenuOpen((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={isAboutMenuOpen}
                      >
                        {item.name}
                        <span className={`transition-transform ${isAboutMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                        {isActiveLink(item.href) && (
                          <motion.div
                            layoutId="activeLink"
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-300"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                      <AnimatePresence>
                        {isAboutMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                          >
                            <Link
                              href="/sobre"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                              {dict.nav.about}
                            </Link>
                            <Link
                              href="/colaboradores"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                              {dict.nav.team}
                            </Link>
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
                    prefetch
                    className={`font-medium lg:text-lg transition-colors relative ${
                      isActiveLink(item.href)
                        ? 'text-white'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {item.name}
                    {isActiveLink(item.href) && (
                      <motion.div
                        layoutId="activeLink"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-300"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* User Menu Desktop */}
            <div className="hidden lg:flex items-center gap-5 lg:ml-8 xl:ml-10 text-white">
              {session ? (
                <div className="flex items-center gap-5">
                  <HeaderLanguageMenu />
                  <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
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
                    <span className="font-medium">
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
                          <span>{dict.user.profile}</span>
                        </Link>
                        
                        {(session.user?.role === 'member' || session.user?.role === 'admin') && (
                          <Link
                            href="/membros"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Users size={16} />
                            <span>{dict.user.members}</span>
                          </Link>
                        )}
                        
                        {session.user?.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Settings size={16} />
                            <span>{dict.user.admin}</span>
                          </Link>
                        )}
                        
                        <hr className="my-2" />
                        
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut size={16} />
                          <span>{dict.user.logout}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-5">
                  <Link
                    href="/login"
                    className="text-white/90 hover:text-white font-medium transition-colors"
                  >
                    {dict.user.login}
                  </Link>
                  <Link
                    href="/registro"
                    className="btn-primary"
                  >
                    {dict.user.signup}
                  </Link>
                  <HeaderLanguageMenu />
                </div>
              )}
            </div>

            {/* Botão Menu Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
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
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        className={`block py-2 font-medium transition-colors ${
                          isActiveLink(item.href)
                            ? 'text-primary-600'
                            : 'text-gray-700 hover:text-primary-600'
                        }`}
                      >
                        {item.name}
                      </Link>
                      {item.name === 'Quem Somos' && (
                        <div className="ml-4 border-l border-gray-200 pl-4 space-y-1">
                          <Link href="/sobre" className="block py-1 text-sm text-gray-600 hover:text-primary-600">Sobre a Associação</Link>
                          <Link href="/colaboradores" className="block py-1 text-sm text-gray-600 hover:text-primary-600">Colaboradores</Link>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {session ? (
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      <div>
                        <HeaderLanguageMenu />
                      </div>
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
                        <span>{dict.user.profile}</span>
                      </Link>
                      
                      {session.user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                        >
                          <Settings size={20} />
                          <span>{dict.user.admin}</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 py-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <LogOut size={20} />
                        <span>{dict.user.logout}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      <Link
                        href="/login"
                        className="block py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                      >
                        {dict.user.login}
                      </Link>
                      <Link
                        href="/registro"
                        className="btn-primary"
                      >
                        {dict.user.signup}
                      </Link>
                      <div>
                        <HeaderLanguageMenu />
                      </div>
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
