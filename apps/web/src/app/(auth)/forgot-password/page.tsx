'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { Button, Input, Card, CardContent, CardHeader } from '@oustadi/ui';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const t = useTranslations('auth');
  const c = useTranslations('common');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }), skipAuth: true });
    if (res.success) {
      setSent(true);
    } else {
      setError(res.error || c('error'));
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold text-gray-900">{t('forgotPassword')}</h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            {sent ? t('checkEmail') : t('enterEmail')}
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <p className="text-sm text-gray-600">{t('resetSent')}</p>
              <Link href="/login" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {c('login')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
              <Input id="email" label={t('email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? c('loading') : t('sendResetLink')}
              </Button>
              <p className="text-center text-sm text-gray-500">
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">{c('login')}</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
