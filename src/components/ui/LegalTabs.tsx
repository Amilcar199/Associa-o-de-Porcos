import Link from 'next/link'

type LegalTabKey = 'geral' | 'constituicao' | 'corpo'

interface LegalTabsProps {
  active: LegalTabKey
  isEn?: boolean
  className?: string
}

const tabs: { key: LegalTabKey; href: string; pt: string; en: string }[] = [
  { key: 'geral', href: '/juridico-legal', pt: 'Geral', en: 'Overview' },
  {
    key: 'constituicao',
    href: '/juridico-legal/documentacao-de-constituicao',
    pt: 'Documentação de constituição',
    en: 'Constitution Documentation',
  },
  {
    key: 'corpo',
    href: '/juridico-legal/corpo-administrativo',
    pt: 'Corpo administrativo',
    en: 'Administrative Body',
  },
]

export default function LegalTabs({ active, isEn = false, className = '' }: LegalTabsProps) {
  return (
    <nav className={`not-prose flex flex-wrap gap-2 ${className}`.trim()} aria-label={isEn ? 'Legal sections' : 'Secções jurídicas'}>
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-600 text-white'
                : 'border border-gray-200 text-gray-600 hover:text-primary-700'
            }`}
          >
            {isEn ? tab.en : tab.pt}
          </Link>
        )
      })}
    </nav>
  )
}
