import type { ElementType, ReactNode } from 'react'

interface SurfaceCardProps {
  as?: ElementType
  padding?: 'none' | 'sm' | 'md'
  interactive?: boolean
  className?: string
  children: ReactNode
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-6',
} as const

export default function SurfaceCard({
  as,
  padding = 'md',
  interactive = false,
  className = '',
  children,
}: SurfaceCardProps) {
  const Component = as || 'div'
  const classes = [
    'rounded-2xl border border-gray-200 bg-white shadow-sm',
    paddingMap[padding],
    interactive ? 'transition-shadow hover:shadow-md' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <Component className={classes}>{children}</Component>
}
