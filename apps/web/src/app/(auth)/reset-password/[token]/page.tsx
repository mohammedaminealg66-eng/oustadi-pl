'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { Button, Input, Card, CardContent, CardHeader } from '@oustadi/ui';
import { CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('auth');
  const c = useTranslations('common');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError(t('passwordsDontMatch')); return; }
    if (password.length < 6) { setError(t('passwordTooShort')); return; }
    setLoading(true);
    const res = await apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }), skipAuth: true });
    if (res.success) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } else {
      setError(res.error || c('error'));
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent>
            <div className="space-y-4 py-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
              <h2 className="text-xl font-bold text-gray-900">{t('resetSuccess')}</h2>
              <p className="text-sm text-gray-500">{t('redirectToLogin')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold text-gray-900">{t('setNewPassword')}</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <Input id="password" label={t('newPassword')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input id="confirm" label={t('confirmPassword')} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? c('loading') : t('resetButton')}
            </Button>
            <p className="text-center text-sm text-gray-500">
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">{c('login')}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
