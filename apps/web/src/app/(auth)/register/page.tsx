'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { Button, Input, Card, CardContent, CardHeader } from '@oustadi/ui';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'STUDENT', language: 'ar' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const t = useTranslations('auth');
  const c = useTranslations('common');
  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(form);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || c('error'));
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold text-gray-900">{t('createAccount')}</h1>
          <p className="mt-1 text-center text-sm text-gray-500">{t('joinPlatform')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <Input id="fullName" label={t('fullName')} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            <Input id="email" label={t('email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input id="password" label={t('password')} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t('role')}</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="STUDENT">{t('student')}</option>
                <option value="TEACHER">{t('teacher')}</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? c('loading') : t('registerButton')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            {t('hasAccount')} <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">{c('login')}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
