'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'

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
  const [tokenValid, setTokenValid] = useState(false)
  const [token, setToken] = useState('')
  const [questions, setQuestions] = useState<{ id: string; label: string }[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const router = useRouter()
  

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const tokenParam = params?.get('token') || ''
    if (tokenParam) {
      setToken(tokenParam)
      validateToken(tokenParam)
      fetch(`/api/auth/reset-security-questions?token=${encodeURIComponent(tokenParam)}`)
        .then((r) => r.json())
        .then((d) => Array.isArray(d.questions) ? setQuestions(d.questions) : setQuestions([]))
        .catch(() => setQuestions([]))
    } else {
      setError(isEn ? 'Invalid recovery token' : 'Token de recuperação inválido')
    }
  }, [])

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

    const hasNumber = /\d/.test(formData.password)
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
    if (formData.password.length < 6 || !hasNumber || hasSeq) {
      setError(isEn
        ? 'Weak password: minimum 6 characters, at least one number, and no numeric sequences (e.g., 123, 321)'
        : 'Senha fraca: mínimo 6 caracteres, ao menos um número e sem sequências numéricas (ex.: 123, 321)')
      setLoading(false)
      return
    }

    // Verificar respostas simples (se houver)
    if (questions.length > 0) {
      try {
        const res = await fetch('/api/auth/verify-security-answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, answers }),
        })
        if (!res.ok) {
          setError(isEn ? 'Incorrect answers. Please try again.' : 'Respostas incorretas. Tente novamente.')
          setLoading(false)
          return
        }
      } catch {
        setError(isEn ? 'Error validating answers' : 'Erro ao validar respostas')
        setLoading(false)
        return
      }
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
          <span className="mx-auto h-12 w-12 text-red-400" aria-hidden>⚠️</span>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{isEn ? 'Invalid Token' : 'Token Inválido'}</h2>
          <p className="mt-2 text-gray-600">{isEn ? 'The recovery link is invalid or has expired.' : 'O link de recuperação é inválido ou expirou.'}</p>
          <Link href="/esqueci-senha" className="mt-4 inline-flex items-center text-green-600 hover:text-green-500">
            <span className="w-4 h-4 mr-1" aria-hidden>←</span>
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
              {questions.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">{isEn ? 'Answer a few questions to continue:' : 'Responda a algumas perguntas para continuar:'}</p>
                  {questions.map((q) => (
                    <div key={q.id}>
                      <label className="block text-sm font-medium text-gray-700">{q.label}</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <span className="h-5 w-5 text-red-400 mr-2" aria-hidden>⚠️</span>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <span className="h-5 w-5 text-green-400 mr-2" aria-hidden>✅</span>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">{isEn ? 'New Password' : 'Nova Senha'}</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden>🔒</div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData((prev: ResetForm) => ({ ...prev, password: e.target.value }))}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder={isEn ? 'Minimum 6 characters' : 'Mínimo 6 caracteres'}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)} aria-label={isEn ? (showPassword ? 'Hide password' : 'Show password') : (showPassword ? 'Ocultar senha' : 'Mostrar senha')}>
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-6 0-10-8-10-8a21.8 21.8 0 0 1 5.06-6.94"></path>
                        <path d="M1 1l22 22"></path>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">{isEn ? 'Confirm New Password' : 'Confirmar Nova Senha'}</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden>🔒</div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev: ResetForm) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder={isEn ? 'Confirm your new password' : 'Confirme sua nova senha'}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={isEn ? (showConfirmPassword ? 'Hide confirm password' : 'Show confirm password') : (showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação')}>
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-6 0-10-8-10-8a21.8 21.8 0 0 1 5.06-6.94"></path>
                        <path d="M1 1l22 22"></path>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"></path>
                      </svg>
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
              <span className="w-4 h-4 mr-1" aria-hidden>←</span>
              {isEn ? 'Back to login' : 'Voltar para o login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}