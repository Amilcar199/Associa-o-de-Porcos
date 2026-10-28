'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useSession } from 'next-auth/react'

const CallToAction = () => {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const { data: session } = useSession()
  const role = (session as { user?: { role?: string } } | null)?.user?.role
  const href = !role ? '/registro' : role === 'admin' ? '/admin' : role === 'member' ? '/membros' : '/perfil'
  const label = !role
    ? (isEn ? 'Become a member' : 'Tornar-se associado')
    : role === 'admin'
      ? (isEn ? 'Go to Admin' : 'Ir ao Painel')
      : role === 'member'
        ? (isEn ? 'Members area' : 'Área de membros')
        : (isEn ? 'My profile' : 'O meu perfil')

  return (
    <section className="bg-primary-800 py-10 md:py-14">
      <div className="container-custom flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">
            {isEn ? 'Ready to take part?' : 'Pronto para participar?'}
          </h2>
          <p className="mt-2 text-sm text-primary-100 md:text-base">
            {isEn
              ? 'Join the association, follow the market and reach the animals for sale.'
              : 'Entre na associação, acompanhe a bolsa e chegue aos animais à venda.'}
          </p>
        </div>
        <Link href={href} className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary-800 hover:bg-primary-50">
          {label}
          <ArrowRight size={16} className="ml-1.5" />
        </Link>
      </div>
    </section>
  )
}

export default CallToAction
