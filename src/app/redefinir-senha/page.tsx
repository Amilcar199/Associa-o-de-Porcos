export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient'
import { cookies } from 'next/headers'

export function generateMetadata(): Metadata {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Reset Password' : 'Redefinir Senha',
    description: isEn ? 'Set a new password for your account' : 'Defina uma nova senha para sua conta'
  }
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}

