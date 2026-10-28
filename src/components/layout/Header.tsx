'use client'
// @ts-nocheck

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
  LayoutGrid,
  ShoppingBag,
  LogOut, 
  Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/components/providers/LanguageProvider'
import pt from '@/lib/i18n/dictionaries/pt'
import en from '@/lib/i18n/dictionaries/en'
import HeaderLanguageMenu from '@/components/i18n/HeaderLanguageMenu'
import { BRAND_NAME, BRAND_SHORT, BRAND_TITLE_LINE1, BRAND_TITLE_LINE2 } from '@/lib/brand'
import { useSiteConfig } from '@/hooks/useSiteConfig'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false)
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false)
  const [isKnowledgeMenuOpen, setIsKnowledgeMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { config: siteConfig } = useSiteConfig()
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const dict = isEn ? en : pt
  const joinLabel = isEn ? 'Become a member' : 'Tornar-se associado'

  // Detectar scroll para adicionar sombra ao header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  // Prefetch programático das rotas mais acessadas
  useEffect(() => {
    const routesToPrefetch = ['/', '/sobre', '/colaboradores', '/servicos', '/produtos', '/produtores', '/bolsa', '/conhecimento', '/noticias', '/contato', '/login', '/registro']
    routesToPrefetch.forEach((route) => {
      try { router.prefetch(route) } catch {}
    })
  }, [router])

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    try {
      if (isMenuOpen) {
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
      } else {
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
      }
    } catch {}
    return () => {
      try {
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
      } catch {}
    }
  }, [isMenuOpen])

  // Fechar menus ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
    setIsProductsMenuOpen(false)
    setIsKnowledgeMenuOpen(false)
    setIsAboutMenuOpen(false)
  }, [pathname])

  const navItems = [
    { name: dict.nav.home, href: '/' },
    // Quem Somos terá dropdown customizado
    { name: dict.nav.about, href: '/sobre' },
    { name: dict.nav.services, href: '/servicos' },
    { name: dict.nav.products, href: '/produtos' },
    { name: dict.nav.market, href: '/bolsa' },
    { name: dict.nav.knowledge, href: '/conhecimento' },
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
      <header 
        className={`sticky top-0 z-[210] bg-primary-800 transition-all duration-300 overflow-visible ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="absolute right-1.5 top-1 z-10">
          <HeaderLanguageMenu tone="dark" compact />
        </div>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[4.5rem] items-center justify-between gap-6 md:h-20">
            <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 md:h-16 md:w-16">
                {siteConfig?.publicLogoUrl || siteConfig?.logoUrl ? (
                  <img
                    src={siteConfig.publicLogoUrl || siteConfig.logoUrl}
                    alt={BRAND_NAME}
                    className="w-full h-full object-contain"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = LogoPng.src
                    }}
                  />
                ) : (
                  <Image
                    src={LogoPng}
                    alt={BRAND_NAME}
                    fill
                    className="object-contain"
                    sizes="64px"
                    priority
                  />
                )}
              </div>
              <div className="hidden min-w-0 sm:block lg:hidden">
                <p className="font-heading text-sm font-bold leading-tight text-white">
                  {BRAND_TITLE_LINE1}
                  <span className="block">{BRAND_TITLE_LINE2}</span>
                </p>
              </div>
              <p className="hidden max-w-[10rem] truncate font-heading text-sm font-bold text-white xl:max-w-none xl:overflow-visible xl:whitespace-normal lg:block">
                <span className="xl:hidden">{BRAND_SHORT}</span>
                <span className="hidden xl:inline">
                  {BRAND_TITLE_LINE1}
                  <span className="block">{BRAND_TITLE_LINE2}</span>
                </span>
              </p>
            </Link>

            <nav className="hidden flex-1 items-center justify-center gap-4 lg:flex xl:gap-6">
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
                        className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${
                          isActiveLink(item.href)
                            ? 'text-white'
                            : 'text-white/80 hover:text-white'
                        }`}
                        onClick={() => setIsAboutMenuOpen((v: boolean) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={isAboutMenuOpen}
                      >
                        {item.name}
                        <span className={`transition-transform ${isAboutMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                        {isActiveLink(item.href) && (
                          <motion.span
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
                            <Link
                              href="/juridico-legal"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                              {dict.footer.legal}
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }
                if (item.name === dict.nav.products) {
                  const productsActive = pathname.includes('/produtos') || pathname.includes('/produtores')
                  return (
                    <div
                      key={item.name}
                      className="relative"
                      onMouseEnter={() => setIsProductsMenuOpen(true)}
                      onMouseLeave={() => setIsProductsMenuOpen(false)}
                    >
                      <button
                        className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${
                          productsActive ? 'text-white' : 'text-white/80 hover:text-white'
                        }`}
                        onClick={() => setIsProductsMenuOpen((v: boolean) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={isProductsMenuOpen}
                      >
                        {item.name}
                        <span className={`transition-transform ${isProductsMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                        {productsActive && (
                          <motion.span
                            layoutId="activeLink"
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-300"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                      <AnimatePresence>
                        {isProductsMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                          >
                            <Link href="/produtos" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">{dict.nav.products}</Link>
                            <Link href="/produtores" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">{dict.nav.producers}</Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }
                if (item.name === dict.nav.knowledge) {
                  const knowledgeActive = pathname.includes('/conhecimento') || pathname.includes('/noticias')
                  return (
                    <div
                      key={item.name}
                      className="relative"
                      onMouseEnter={() => setIsKnowledgeMenuOpen(true)}
                      onMouseLeave={() => setIsKnowledgeMenuOpen(false)}
                    >
                      <button
                        className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${
                          knowledgeActive ? 'text-white' : 'text-white/80 hover:text-white'
                        }`}
                        onClick={() => setIsKnowledgeMenuOpen((v: boolean) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={isKnowledgeMenuOpen}
                      >
                        {item.name}
                        <span className={`transition-transform ${isKnowledgeMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                        {knowledgeActive && (
                          <motion.span
                            layoutId="activeLink"
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-300"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                      <AnimatePresence>
                        {isKnowledgeMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                          >
                            <Link href="/conhecimento" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">{locale.startsWith('en') ? 'Knowledge centre' : 'Centro de conhecimento'}</Link>
                            <Link href="/noticias" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">{dict.nav.news}</Link>
                            <Link href="/membros" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">{locale.startsWith('en') ? 'Member content' : 'Conteúdos de membros'}</Link>
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
                    className={`relative text-sm font-medium transition-colors ${
                      isActiveLink(item.href)
                        ? 'text-white'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {item.name}
                    {isActiveLink(item.href) && (
                      <motion.span
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

            <div className="ml-auto hidden shrink-0 items-center gap-3 text-white lg:flex">
              {session ? (
                <div className="flex items-center gap-5">
                  <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-sm font-medium text-white">
                      {session.user?.avatar ? (
                        <Image
                          src={session.user.avatar}
                          alt={session.user.name || 'Avatar'}
                          fill
                          className="rounded-full object-cover"
                          sizes="36px"
                        />
                      ) : (
                        session.user?.name?.charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className="max-w-[8rem] truncate text-sm font-medium">
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
                          href="/painel"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <LayoutGrid size={16} />
                          <span>{locale.startsWith('en') ? 'Producer area' : 'Área do produtor'}</span>
                        </Link>
                        <Link
                          href="/comprador"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <ShoppingBag size={16} />
                          <span>{locale.startsWith('en') ? 'Buyer area' : 'Área do comprador'}</span>
                        </Link>
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
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-white/90 transition-colors hover:text-white"
                  >
                    {dict.user.login}
                  </Link>
                  <Link
                    href="/registro"
                    className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-primary-800 transition-colors hover:bg-primary-50"
                  >
                    {joinLabel}
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-4 flex shrink-0 items-center lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {/* Backdrop overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-x-0 top-[4.5rem] bottom-0 z-40 bg-black/40 md:top-20"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="lg:hidden fixed top-[4.5rem] md:top-20 left-0 right-0 z-50 bg-white border-t border-gray-200 max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain shadow-lg"
            >
              <div className="container-custom py-4">
                <nav className="space-y-1">
                  {!session ? (
                    <div className="mb-3 flex gap-2 border-b border-gray-100 pb-3">
                      <Link href="/login" className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-800">
                        {dict.user.login}
                      </Link>
                      <Link href="/registro" className="flex-1 rounded-lg bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white">
                        {joinLabel}
                      </Link>
                    </div>
                  ) : null}
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
                      {item.name === dict.nav.about && (
                        <div className="ml-4 border-l border-gray-200 pl-4 space-y-1">
                          <Link href="/sobre" className="block py-1 text-sm text-gray-600 hover:text-primary-600">{dict.nav.about}</Link>
                          <Link href="/colaboradores" className="block py-1 text-sm text-gray-600 hover:text-primary-600">{dict.nav.team}</Link>
                          <Link href="/juridico-legal" className="block py-1 text-sm text-gray-600 hover:text-primary-600">{dict.footer.legal}</Link>
                        </div>
                      )}
                      {item.name === dict.nav.products && (
                        <div className="ml-4 border-l border-gray-200 pl-4 space-y-1">
                          <Link href="/produtos" className="block py-1 text-sm text-gray-600 hover:text-primary-600">{dict.nav.products}</Link>
                          <Link href="/produtores" className="block py-1 text-sm text-gray-600 hover:text-primary-600">{dict.nav.producers}</Link>
                        </div>
                      )}
                      {item.name === dict.nav.knowledge && (
                        <div className="ml-4 border-l border-gray-200 pl-4 space-y-1">
                          <Link href="/conhecimento" className="block py-1 text-sm text-gray-600 hover:text-primary-600">{locale.startsWith('en') ? 'Knowledge centre' : 'Centro de conhecimento'}</Link>
                          <Link href="/noticias" className="block py-1 text-sm text-gray-600 hover:text-primary-600">{dict.nav.news}</Link>
                          <Link href="/membros" className="block py-1 text-sm text-gray-600 hover:text-primary-600">{locale.startsWith('en') ? 'Member content' : 'Conteúdos de membros'}</Link>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {session ? (
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium overflow-hidden relative">
                          {session.user?.avatar ? (
                            <Image
                              src={session.user.avatar}
                              alt={session.user.name || 'Avatar'}
                              fill
                              className="rounded-full object-cover"
                              sizes="56px"
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
                        href="/painel"
                        className="flex items-center space-x-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        <LayoutGrid size={20} />
                        <span>{locale.startsWith('en') ? 'Producer area' : 'Área do produtor'}</span>
                      </Link>
                      <Link
                        href="/comprador"
                        className="flex items-center space-x-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        <ShoppingBag size={20} />
                        <span>{locale.startsWith('en') ? 'Buyer area' : 'Área do comprador'}</span>
                      </Link>
                      <Link
                        href="/perfil"
                        className="flex items-center space-x-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        <User size={20} />
                        <span>{dict.user.profile}</span>
                      </Link>
                      {(session.user?.role === 'member' || session.user?.role === 'admin') && (
                        <Link
                          href="/membros"
                          className="flex items-center space-x-2 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                        >
                          <Users size={20} />
                          <span>{dict.user.members}</span>
                        </Link>
                      )}
                      
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
                  ) : null}

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
