'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import pt from '@/lib/i18n/dictionaries/pt';
import en from '@/lib/i18n/dictionaries/en';
import Link from 'next/link';

export default function RegisterPage() {
  const { locale } = useLanguage();
  const dict = locale.startsWith('en') ? en : pt;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    description: '',
    accountType: '' as '' | 'cliente' | 'membro'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const passwordHasNumber = /\d/.test(formData.password)
  const passwordHasLength = formData.password.length >= 6

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validações
    if (!formData.accountType) {
      setError(dict.auth.errorSelectAccountType);
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(dict.auth.errorPasswordsMismatch);
      setLoading(false);
      return;
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
      setError(locale.startsWith('en')
        ? 'Weak password: minimum 6 characters, at least one number, and no numeric sequences (e.g., 123, 321)'
        : 'Senha fraca: mínimo 6 caracteres, ao menos um número e sem sequências numéricas (ex.: 123, 321)')
      setLoading(false)
      return
    }
    if (formData.accountType === 'membro' && !formData.description.trim()) {
      setError(dict.auth.errorMemberDescriptionRequired);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          company: formData.company,
          bio: formData.description,
          role: formData.accountType === 'membro' ? 'member' : 'visitor'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || dict.auth.errorRegister);
      } else {
        setSuccess(dict.auth.successRegister);
        await signIn('credentials', { email: formData.email, password: formData.password, redirect: false });
        if (formData.accountType === 'membro') {
          router.push('/membros');
        } else {
          router.push('/perfil');
        }
      }
    } catch (error) {
      setError(dict.auth.errorRegister + '.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-xl font-bold text-white shadow-lg shadow-primary-600/20">AS</div>
          <h2 className="text-3xl font-heading font-bold text-gray-900">
            {dict.auth.registerTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {dict.auth.registerSubtitle}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-white/80 bg-white/95 py-8 px-4 shadow-xl shadow-gray-900/5 backdrop-blur sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label id="account-type-label" className="block text-sm font-medium text-gray-700">
                {dict.auth.accountType}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="account-type-label">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, accountType: 'cliente', company: '' }))}
                  aria-pressed={formData.accountType === 'cliente'}
                  className={`rounded-xl border p-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${formData.accountType === 'cliente' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700 hover:border-primary-300'}`}
                >
                  {dict.auth.accountTypeClient}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, accountType: 'membro' }))}
                  aria-pressed={formData.accountType === 'membro'}
                  className={`rounded-xl border p-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${formData.accountType === 'membro' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700 hover:border-primary-300'}`}
                >
                  {dict.auth.accountTypeMember}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">{dict.auth.accountTypeHint}</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {dict.auth.name}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field pl-10 pr-3"
                  placeholder={dict.auth.name}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {dict.auth.email}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field pl-10 pr-3"
                  placeholder={dict.auth.placeholderEmail}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {dict.auth.phoneOptional}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field pl-10 pr-3"
                  placeholder="(+244) 9xx xxx xxx"
                />
              </div>
            </div>

            {formData.accountType === 'membro' && (
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                {dict.auth.companyOptional}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="input-field pl-10 pr-3"
                  placeholder={dict.auth.companyOptional}
                />
              </div>
            </div>
            )}

            {formData.accountType === 'membro' && (
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                {dict.auth.description}
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field pr-3"
                  placeholder={dict.auth.description}
                />
              </div>
            </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {dict.auth.password}
              </label>
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
                  className="input-field pl-10 pr-10"
                  placeholder={dict.auth.passwordMin}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-live="polite">
                <span className={passwordHasLength ? 'text-green-700' : 'text-gray-500'}>{passwordHasLength ? '✓' : '•'} {locale.startsWith('en') ? '6+ characters' : '6+ caracteres'}</span>
                <span className={passwordHasNumber ? 'text-green-700' : 'text-gray-500'}>{passwordHasNumber ? '✓' : '•'} {locale.startsWith('en') ? 'One number' : 'Um número'}</span>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {dict.auth.confirmPassword}
              </label>
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
                  placeholder={dict.auth.confirmPassword}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? dict.auth.creatingAccount : dict.auth.createAccount}
              </button>
            </div>
          </form>

          {/* Seção de registro social removida */}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {dict.auth.haveAccount}{' '}
              <Link href="/login" className="font-medium text-primary-700 hover:text-primary-800">
                {dict.auth.loginHere}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
