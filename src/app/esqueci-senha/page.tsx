'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import AuthShell from '@/components/ui/AuthShell';

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
    <AuthShell
      title={isEn ? 'Recover Password' : 'Recuperar Senha'}
      subtitle={isEn ? 'Enter your email to receive recovery instructions' : 'Indique o seu email para receber instruções de recuperação'}
      footer={
        <p>
          {isEn ? "Don't have an account?" : 'Não tem uma conta?'}{' '}
          <Link href="/registro" className="font-medium text-primary-700 hover:text-primary-800">
            {isEn ? 'Register here' : 'Registe-se aqui'}
          </Link>
        </p>
      }
    >
      {sent ? (
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            {isEn
              ? 'If that email exists in our system, you will receive recovery instructions shortly. Check your inbox (and spam folder).'
              : 'Se esse email existir no nosso sistema, receberá instruções de recuperação em breve. Verifique a sua caixa de entrada (e o spam).'}
          </p>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 pr-3"
                placeholder={isEn ? 'your@email.com' : 'seu@email.com'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (isEn ? 'Sending...' : 'A enviar...') : (isEn ? 'Continue' : 'Continuar')}
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
  );
}
