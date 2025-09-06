'use client'

import Link from 'next/link'
import Image from 'next/image'
import LogoPng from '@/components/assets/Logo.png'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Linkedin,
  Heart,
  ArrowRight
} from 'lucide-react'
import { useTransition } from 'react'
import { useEffect, useState } from 'react'
import { useCookieConsent } from '@/components/cookies/CookieConsentProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import pt from '@/lib/i18n/dictionaries/pt'
import en from '@/lib/i18n/dictionaries/en'
import { BRAND_NAME } from '@/lib/brand'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [siteConfig, setSiteConfig] = useState<any>(null)
  const { openPreferences } = useCookieConsent()
  const { locale } = useLanguage()
  const dict = locale.startsWith('en') ? en : pt
  const isEn = locale.startsWith('en')

  useEffect(()=>{
    const load = async () => {
      try { const res = await fetch('/api/admin/config', { cache: 'no-store' }); if (res.ok){ const j = await res.json(); setSiteConfig(j?.data || null) } } catch {}
    }
    load()
  }, [])

  const quickLinks = [
    { name: dict.nav.home, href: '/' },
    { name: dict.nav.about, href: '/sobre' },
    { name: dict.nav.products, href: '/produtos' },
    { name: dict.nav.news, href: '/noticias' },
    { name: dict.nav.contact, href: '/contato' },
  ]

  const legalLinks = [
    { name: dict.footer.privacy, href: '/privacidade' },
    { name: dict.footer.terms, href: '/termos' },
    { name: dict.footer.cookies, href: '/cookies' },
  ]

  const productCategories = [
    { name: dict.categories?.breeders || 'Suínos Reprodutores', href: '/produtos?categoria=reprodutores' },
    { name: dict.categories?.piglets || 'Leitões', href: '/produtos?categoria=leitoes' },
    { name: dict.categories?.fattening || 'Suínos de Engorda', href: '/produtos?categoria=engorda' },
    { name: dict.categories?.sows || 'Matrizes', href: '/produtos?categoria=matrizes' },
  ]

  const NewsletterForm = () => {
    const [email, setEmail] = useState('')
    const [sending, setSending] = useState(false)
    const [done, setDone] = useState<string | null>(null)
    const [err, setErr] = useState<string | null>(null)

    const submit = async () => {
      setSending(true)
      setDone(null)
      setErr(null)
      try {
        const res = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        if (res.ok) {
          setDone(isEn ? 'Subscribed! We will keep you updated.' : 'Inscrição feita! Vamos te manter atualizado.')
          setEmail('')
        } else {
          const j = await res.json().catch(() => ({}))
          setErr(j?.error || (isEn ? 'Failed, please try again.' : 'Falha, tente novamente.'))
        }
      } catch {
        setErr(isEn ? 'Network error.' : 'Erro de rede.')
      } finally {
        setSending(false)
      }
    }

    return (
      <div className="w-full max-w-md">
        <div className="flex">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={dict.footer.emailPlaceholder}
            className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <button
            onClick={submit}
            disabled={sending || !email}
            className="bg-primary-800 hover:bg-primary-900 disabled:opacity-60 px-6 py-3 rounded-r-lg transition-colors flex items-center"
          >
            <ArrowRight size={20} />
          </button>
        </div>
        {done && <div className="mt-2 text-green-300 text-sm">{done}</div>}
        {err && <div className="mt-2 text-red-300 text-sm">{err}</div>}
      </div>
    )
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-primary-700">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-heading font-semibold mb-2">
                {dict.footer.newsletterTitle}
              </h3>
              <p className="text-primary-100">
                {dict.footer.newsletterDesc}
              </p>
            </div>
            
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 relative">
                {siteConfig?.publicLogoUrl || siteConfig?.logoUrl ? (
                  <img src={siteConfig.publicLogoUrl || siteConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Image
                    src={LogoPng}
                    alt={BRAND_NAME}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 64px, 80px"
                  />
                )}
              </div>
              <div>

                <h2 className="text-xl font-heading font-bold">
                  Associação de suínocultores do norte

                </h2>
                <p className="text-sm text-gray-400">
                  {dict.site?.tagline || 'Criação Sustentável'}
                </p>
              </div>
            </Link>
            
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              {isEn ? 'Promoting sustainable and responsible pig farming, connecting farmers and offering high-quality products for Angola’s agribusiness.' : 'Promovendo a criação sustentável e responsável de suínos, conectando criadores e oferecendo produtos de alta qualidade para o agronegócio angolano.'}
            </p>
            
            {/* Redes Sociais */}
            <div className="flex space-x-4">
              <a href={siteConfig?.facebookUrl || 'https://facebook.com/associacaodeporcos'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                <Facebook size={20} />
              </a>
              <a href={siteConfig?.instagramUrl || 'https://instagram.com/associacaodeporcos'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                <Instagram size={20} />
              </a>
              <a href={siteConfig?.linkedinUrl || 'https://linkedin.com/company/associacaodeporcos'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                <Linkedin size={20} />
              </a>
              {siteConfig?.youtubeUrl && (
                <a href={siteConfig.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.108-2.12C19.633 3.5 12 3.5 12 3.5s-7.633 0-9.39.566A2.994 2.994 0 0 0 .502 6.186 31.37 31.37 0 0 0 0 12a31.37 31.37 0 0 0 .502 5.814 2.994 2.994 0 0 0 2.108 2.12C4.367 20.5 12 20.5 12 20.5s7.633 0 9.39-.566a2.994 2.994 0 0 0 2.108-2.12A31.37 31.37 0 0 0 24 12a31.37 31.37 0 0 0-.502-5.814ZM9.75 15.5v-7l6 3.5-6 3.5Z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">
              {dict.footer.quickLinksTitle}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} prefetch className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Produtos */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">
              {dict.footer.ourProductsTitle}
            </h3>
            <ul className="space-y-3">
              {productCategories.map((category) => (
                <li key={category.name}>
                  <Link href={category.href} className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">
              {dict.footer.contactTitle}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-primary-400 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>Rua da Associação, 123</p>
                  <p>Centro - Luanda, Angola</p>
                  <p>CEP: 1000</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-primary-400 flex-shrink-0" />
                <a href={`tel:${siteConfig?.contactPhone || '+244928476427'}`} className="text-sm text-gray-300 hover:text-primary-400 transition-colors">
                  {siteConfig?.contactPhone || '+244 928 476 427'}
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-primary-400 flex-shrink-0" />
                <a href={`mailto:${siteConfig?.contactEmail || 'contato@associacaodeporcos.ao'}`} className="text-sm text-gray-300 hover:text-primary-400 transition-colors">
                  {siteConfig?.contactEmail || 'contato@associacaodeporcos.ao'}
                </a>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-6">
              <a href={`https://wa.me/${siteConfig?.whatsappNumber || '244928476427'}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Phone size={16} />
                <span>{dict.footer.whatsapp}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              <p>
                © {currentYear} {BRAND_NAME}. Todos os direitos reservados.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="flex items-center space-x-4 text-sm">
                {legalLinks.map((link, index) => (
                  <span key={link.name} className="flex items-center">
                    <Link href={link.href} className="text-gray-400 hover:text-primary-400 transition-colors">
                      {link.name}
                    </Link>
                    {index < legalLinks.length - 1 && (
                      <span className="text-gray-600 ml-4">•</span>
                    )}
                  </span>
                ))}
                <button onClick={openPreferences} className="text-gray-400 hover:text-primary-400 transition-colors">
                  {dict.footer.cookiePreferences}
                </button>
              </div>
              
              <div className="flex items-center text-sm text_gray-400">
                <span>{dict.footer.madeWith}</span>
                <Heart size={14} className="text-red-500 mx-1" />
                <span>{dict.footer.forAgribusiness}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
