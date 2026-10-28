import type { ReactNode } from 'react'

interface SectionHeadingProps {
  label?: ReactNode
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  action?: ReactNode
  className?: string
}

export default function SectionHeading({
  label,
  title,
  description,
  align = 'left',
  action,
  className = '',
}: SectionHeadingProps) {
  const centered = align === 'center'

  return (
    <div
      className={`${centered ? 'text-center' : 'sm:flex sm:items-end sm:justify-between sm:gap-6'} ${className}`.trim()}
    >
      <div className={centered ? 'mx-auto max-w-2xl' : 'min-w-0'}>
        {label && <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>}
        <h2 className={`font-heading text-xl md:text-2xl font-bold text-gray-900 ${label ? 'mt-2' : ''}`.trim()}>
          {title}
        </h2>
        {description && (
          <p className={`mt-2 text-gray-600 ${centered ? '' : 'max-w-2xl'}`.trim()}>{description}</p>
        )}
      </div>
      {action && (
        <div className={centered ? 'mt-5 flex justify-center' : 'mt-4 sm:mt-0 sm:shrink-0'}>{action}</div>
      )}
    </div>
  )
}
