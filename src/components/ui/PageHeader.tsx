import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  backHref?: string
  backLabel?: ReactNode
  className?: string
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  backHref,
  backLabel,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`border-b border-gray-200 bg-white ${className}`.trim()}>
      <div className="container-custom py-6 md:py-8">
        {backHref && (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-primary-700"
          >
            <ArrowLeft size={16} />
            {backLabel || 'Voltar'}
          </Link>
        )}
        <div className="md:flex md:items-end md:justify-between md:gap-6">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{eyebrow}</p>
            )}
            <h1 className={`font-heading text-2xl md:text-3xl font-bold text-gray-900 ${eyebrow ? 'mt-2' : ''}`.trim()}>
              {title}
            </h1>
            {description && <p className="mt-2 max-w-2xl text-gray-600">{description}</p>}
          </div>
          {actions && (
            <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-0 md:shrink-0 md:justify-end">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
