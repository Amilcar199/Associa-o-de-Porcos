'use client';

import { useState } from 'react';
 
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function ForgotPasswordPage() {
  const { locale } = useLanguage();
  const isEn = locale.startsWith('en');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || (isEn ? 'Something went wrong. Please try again.' : 'Algo correu mal. Tente novamente.'));
      } else {
        setSent(true);
      }
    } catch {
      setError(isEn ? 'Something went wrong. Please try again.' : 'Algo correu mal. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{isEn ? 'Recover Password' : 'Recuperar Senha'}</h2>
          <p className="mt-2 text-sm text-gray-600">{isEn ? 'Enter your email to receive recovery instructions' : 'Digite seu email para receber instruções de recuperação'}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">
                {isEn
                  ? 'If that email exists in our system, you will receive recovery instructions shortly. Check your inbox (and spam folder).'
                  : 'Se esse email existir no nosso sistema, receberá instruções de recuperação em breve. Verifique a sua caixa de entrada (e o spam).'}
              </p>
            </div>
          ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden>📧</div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder={isEn ? 'your@email.com' : 'seu@email.com'}
                />
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (isEn ? 'Sending...' : 'Enviando...') : (isEn ? 'Continue' : 'Continuar')}
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isEn ? "Don't have an account?" : 'Não tem uma conta?'}{' '}
              <Link href="/registro" className="font-medium text-green-600 hover:text-green-500">
                {isEn ? 'Register here' : 'Registre-se aqui'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
