'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import pt from '@/lib/i18n/dictionaries/pt';
import en from '@/lib/i18n/dictionaries/en';
import Link from 'next/link';

export default function LoginPage() {
  const { locale } = useLanguage();
  const dict = locale.startsWith('en') ? en : pt;
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        if (result.error.toLowerCase().includes('verificado')) {
          setError('Email não verificado. Verifique seu email ou reenviar código.');
        } else {
          setError(dict.auth.errorWrongCredentials);
        }
      } else {
        // Verificar se o login foi bem-sucedido
        const session = await getSession();
        if (session) {
          // Redirecionar baseado no role do usuário
          if (session.user?.role === 'admin') {
            router.push('/admin');
          } else if (session.user?.role === 'member') {
            router.push('/membros');
          } else {
            router.push('/');
          }
        }
      }
    } catch (error) {
      setError(dict.auth.errorLogin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {dict.auth.loginTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {dict.auth.loginSubtitle}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder={dict.auth.placeholderEmail}
                />
              </div>
            </div>

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
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder={dict.auth.placeholderPassword}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {dict.auth.rememberMe}
                </label>
              </div>

              <div className="text-sm">
                <Link href="/esqueci-senha" className="font-medium text-green-600 hover:text-green-500">
                  {dict.auth.forgotPassword}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? dict.auth.loggingIn : dict.auth.login}
              </button>
            </div>
          </form>
          <div className="mt-4 text-sm text-center">
            <button
              onClick={async ()=>{
                if (!formData.email) { setError('Informe seu email para reenviar o código.'); return }
                setError('');
                await fetch('/api/auth/resend-code',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: formData.email })})
              }}
              className="text-green-600 hover:text-green-700"
            >
              Reenviar código de verificação
            </button>
          </div>

          {/* Seção de login social removida */}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {dict.auth.noAccount}{' '}
              <Link href="/registro" className="font-medium text-green-600 hover:text-green-500">
                {dict.auth.registerHere}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
