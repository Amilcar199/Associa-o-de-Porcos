'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import AuthShell from '@/components/ui/AuthShell'

export default function ResetPasswordClient() {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  type ResetForm = { password: string; confirmPassword: string }
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' } as ResetForm)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid'>('checking')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenStatus('invalid')
        return
      }
      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        setTokenStatus(response.ok ? 'valid' : 'invalid')
      } catch {
        setTokenStatus('invalid')
      }
    }
    checkToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError(isEn ? "Passwords don't match" : 'As senhas não coincidem')
      setLoading(false)
      return
    }

    const hasNumber = /\d/.test(formData.password)
    const hasLower = /[a-z]/.test(formData.password)
    const hasUpper = /[A-Z]/.test(formData.password)
    const hasSpecial = /[^A-Za-z0-9]/.test(formData.password)
    const hasSeq = (() => {
      let inc = 1, dec = 1
      for (let i = 1; i < formData.password.length; i++) {
        const a = formData.password.charCodeAt(i - 1)
        const b = formData.password.charCodeAt(i)
        const ad = a >= 48 && a <= 57
        const bd = b >= 48 && b <= 57
        if (ad && bd && b - a === 1) inc++; else inc = 1
        if (ad && bd && a - b === 1) dec++; else dec = 1
        if (inc >= 3 || dec >= 3) return true
      }
      return false
    })()
    if (formData.password.length < 8 || !hasNumber || !hasLower || !hasUpper || !hasSpecial || hasSeq) {
      setError(isEn
        ? 'Weak password: minimum 8 characters, with at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character (e.g., !@#$%), and no numeric sequences (e.g., 123, 321)'
        : 'Senha fraca: mínimo 8 caracteres, com pelo menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial (ex.: !@#$%), e sem sequências numéricas (ex.: 123, 321)')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: formData.password }),
      })
      const data = await response.json()
      if (!response.ok) setError(data.message || (isEn ? 'Error resetting password' : 'Erro ao redefinir senha'))
      else {
        setSuccess(isEn ? 'Password reset successfully! Redirecting...' : 'Senha redefinida com sucesso! A redirecionar...')
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch (error) {
      setError(isEn ? 'Error resetting password. Please try again.' : 'Erro ao redefinir senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title={isEn ? 'Reset Password' : 'Redefinir Senha'}
      subtitle={isEn ? 'Confirm your identity and set a new password' : 'Confirme a sua identidade e defina uma nova senha'}
    >
      {tokenStatus === 'checking' && (
        <p className="text-center text-sm text-gray-600">{isEn ? 'Validating link...' : 'A validar link...'}</p>
      )}

      {tokenStatus === 'invalid' && (
        <div className="space-y-4">
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              {isEn
                ? 'This link is invalid or has expired. Please request a new password recovery email.'
                : 'Este link é inválido ou expirou. Solicite um novo email de recuperação de senha.'}
            </p>
          </div>
          <Link href="/esqueci-senha" className="block text-center text-sm font-medium text-primary-700 hover:text-primary-800">
            {isEn ? 'Request new link' : 'Solicitar novo link'}
          </Link>
        </div>
      )}

      {tokenStatus === 'valid' && (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div role="status" className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {isEn ? 'New Password' : 'Nova Senha'}
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => setFormData((prev: ResetForm) => ({ ...prev, password: e.target.value }))}
                className="input-field pl-10 pr-10"
                placeholder={isEn ? 'Minimum 8 characters' : 'Mínimo 8 caracteres'}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={isEn ? (showPassword ? 'Hide password' : 'Show password') : (showPassword ? 'Ocultar senha' : 'Mostrar senha')}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              {isEn ? 'Confirm New Password' : 'Confirmar Nova Senha'}
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev: ResetForm) => ({ ...prev, confirmPassword: e.target.value }))}
                className="input-field pl-10 pr-10"
                placeholder={isEn ? 'Confirm your new password' : 'Confirme a sua nova senha'}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={isEn ? (showConfirmPassword ? 'Hide confirm password' : 'Show confirm password') : (showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação')}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (isEn ? 'Resetting...' : 'A redefinir...') : (isEn ? 'Reset Password' : 'Redefinir Senha')}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-primary-700">
          <ArrowLeft size={16} />
          {isEn ? 'Back to login' : 'Voltar ao login'}
        </Link>
      </div>
    </AuthShell>
  )
}
