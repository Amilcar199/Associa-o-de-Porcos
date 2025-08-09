'use client'

import Link from 'next/link'
import Image from 'next/image'
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

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Início', href: '/' },
    { name: 'Quem Somos', href: '/sobre' },
    { name: 'Produtos', href: '/produtos' },
    { name: 'Notícias', href: '/noticias' },
    { name: 'Colaboradores', href: '/colaboradores' },
    { name: 'Contato', href: '/contato' },
  ]

  const legalLinks = [
    { name: 'Política de Privacidade', href: '/privacidade' },
    { name: 'Termos de Uso', href: '/termos' },
    { name: 'Cookies', href: '/cookies' },
  ]

  const productCategories = [
    { name: 'Suínos Reprodutores', href: '/produtos?categoria=reprodutores' },
    { name: 'Leitões', href: '/produtos?categoria=leitoes' },
    { name: 'Suínos de Engorda', href: '/produtos?categoria=engorda' },
    { name: 'Matrizes', href: '/produtos?categoria=matrizes' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-primary-700">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-heading font-semibold mb-2">
                Fique por dentro das novidades
              </h3>
              <p className="text-primary-100">
                Receba as últimas notícias e atualizações do setor suinícola
              </p>
            </div>
            
            <div className="flex w-full max-w-md">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <button className="bg-primary-800 hover:bg-primary-900 px-6 py-3 rounded-r-lg transition-colors flex items-center">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo.png"
                  alt="Associação de Porcos"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%2316a34a'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='white' font-size='30' font-weight='bold'%3EP%3C/text%3E%3C/svg%3E"
                  }}
                />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold">
                  Associação de Porcos
                </h2>
                <p className="text-sm text-gray-400">
                  Criação Sustentável
                </p>
              </div>
            </Link>
            
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Promovendo a criação sustentável e responsável de suínos, 
              conectando criadores e oferecendo produtos de alta qualidade 
              para o agronegócio angolano.
            </p>
            
            {/* Redes Sociais */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/associacaodeporcos"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com/associacaodeporcos"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com/company/associacaodeporcos"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">
              Links Rápidos
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Produtos */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">
              Nossos Produtos
            </h3>
            <ul className="space-y-3">
              {productCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">
              Entre em Contato
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
                <a
                  href="tel:+5511999999999"
                  className="text-sm text-gray-300 hover:text-primary-400 transition-colors"
                >
                  (222) 123-456
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-primary-400 flex-shrink-0" />
                <a
                  href="mailto:contato@associacaodeporcos.ao"
                  className="text-sm text-gray-300 hover:text-primary-400 transition-colors"
                >
                  contato@associacaodeporcos.ao
                </a>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-6">
              <a
                href="https://wa.me/244222123456"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Phone size={16} />
                <span>WhatsApp</span>
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
                © {currentYear} Associação de Porcos. Todos os direitos reservados.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="flex items-center space-x-4 text-sm">
                {legalLinks.map((link, index) => (
                  <span key={link.name} className="flex items-center">
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                    {index < legalLinks.length - 1 && (
                      <span className="text-gray-600 ml-4">•</span>
                    )}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center text-sm text-gray-400">
                <span>Feito com</span>
                <Heart size={14} className="text-red-500 mx-1" />
                <span>para o agronegócio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
