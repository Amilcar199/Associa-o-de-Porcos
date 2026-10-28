import type { ReactNode } from 'react'
import SurfaceCard from '@/components/ui/SurfaceCard'

interface AuthShellProps {
  title: ReactNode
  subtitle?: ReactNode
  logo?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export default function AuthShell({ title, subtitle, logo, footer, children }: AuthShellProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6">
      <div className="w-full max-w-md text-center">
        {logo || (
          <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-base font-bold text-white">
            AS
          </div>
        )}
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
      </div>

      <SurfaceCard className="mt-8 w-full max-w-md" padding="none">
        <div className="p-6 sm:p-8">{children}</div>
      </SurfaceCard>

      {footer && <div className="mt-6 w-full max-w-md text-center text-sm text-gray-600">{footer}</div>}
    </div>
  )
}
