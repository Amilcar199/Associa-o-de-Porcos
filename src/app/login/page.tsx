'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import pt from '@/lib/i18n/dictionaries/pt';
import en from '@/lib/i18n/dictionaries/en';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';

export default function LoginPage() {
  const { locale } = useLanguage();
  const dict = locale.startsWith('en') ? en : pt;
  type LoginForm = { email: string; password: string };
  const [formData, setFormData] = useState({ email: '', password: '' } as LoginForm);
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
        redirect: false,
        email: formData.email,
        password: formData.password
      });
      if (!result || result.error) {
        setError(dict.auth.errorWrongCredentials);
        return;
      }
      const session = await getSession();
      const role = session?.user?.role as string | undefined;
      if (role === 'admin') router.push('/admin');
      else if (role === 'member') router.push('/membros');
      else router.push('/perfil');
    } catch (error) {
      setError(dict.auth.errorLogin);
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
            {dict.auth.loginTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {dict.auth.loginSubtitle}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-white/80 bg-white/95 py-8 px-4 shadow-xl shadow-gray-900/5 backdrop-blur sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <div className="ml-1">
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
                  onChange={(e) => setFormData((prev: LoginForm) => ({ ...prev, email: e.target.value }))}
                  className="input-field pl-10 pr-3"
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
                  onChange={(e) => setFormData((prev: LoginForm) => ({ ...prev, password: e.target.value }))}
                  className="input-field pl-10 pr-10"
                  placeholder={dict.auth.placeholderPassword}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
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
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {dict.auth.rememberMe}
                </label>
              </div>

              <div className="text-sm">
                <Link href="/esqueci-senha" className="font-medium text-primary-700 hover:text-primary-800">
                  {dict.auth.forgotPassword}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? dict.auth.loggingIn : dict.auth.login}
              </button>
            </div>
          </form>
          

          {/* Seção de login social removida */}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {dict.auth.noAccount}{' '}
              <Link href="/registro" className="font-medium text-primary-700 hover:text-primary-800">
                {dict.auth.registerHere}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
