'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function ResetPasswordClient() {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tokenValid, setTokenValid] = useState(false)
  const [token, setToken] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      validateToken(tokenParam)
    } else {
      setError(isEn ? 'Invalid recovery token' : 'Token de recuperação inválido')
    }
  }, [searchParams])

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (response.ok) setTokenValid(true)
      else setError(isEn ? 'Invalid or expired token' : 'Token inválido ou expirado')
    } catch (error) {
      setError(isEn ? 'Error validating token' : 'Erro ao validar token')
    }
  }

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

    if (formData.password.length < 6) {
      setError(isEn ? 'Password must be at least 6 characters' : 'A senha deve ter pelo menos 6 caracteres')
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
        setSuccess(isEn ? 'Password reset successfully! Redirecting...' : 'Senha redefinida com sucesso! Redirecionando...')
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch (error) {
      setError(isEn ? 'Error resetting password. Please try again.' : 'Erro ao redefinir senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{isEn ? 'Invalid Token' : 'Token Inválido'}</h2>
          <p className="mt-2 text-gray-600">{isEn ? 'The recovery link is invalid or has expired.' : 'O link de recuperação é inválido ou expirou.'}</p>
          <Link href="/esqueci-senha" className="mt-4 inline-flex items-center text-green-600 hover:text-green-500">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {isEn ? 'Request new link' : 'Solicitar novo link'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{isEn ? 'Reset Password' : 'Redefinir Senha'}</h2>
          <p className="mt-2 text-sm text-gray-600">{isEn ? 'Enter your new password' : 'Digite sua nova senha'}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!tokenValid ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
              <p className="mt-2 text-sm text-gray-600">{isEn ? 'Validating token...' : 'Validando token...'}</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm text-green-800">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">{isEn ? 'New Password' : 'Nova Senha'}</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder={isEn ? 'Minimum 6 characters' : 'Mínimo 6 caracteres'}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">{isEn ? 'Confirm New Password' : 'Confirmar Nova Senha'}</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder={isEn ? 'Confirm your new password' : 'Confirme sua nova senha'}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (isEn ? 'Resetting...' : 'Redefinindo...') : (isEn ? 'Reset Password' : 'Redefinir Senha')}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center text-sm text-green-600 hover:text-green-500">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {isEn ? 'Back to login' : 'Voltar para o login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}