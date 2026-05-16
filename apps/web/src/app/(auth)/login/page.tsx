'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button, Input, Card, CardContent, CardHeader } from '@oustadi/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'فشل تسجيل الدخول');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold text-gray-900">تسجيل الدخول</h1>
          <p className="mt-1 text-center text-sm text-gray-500">أهلاً بك مجدداً في أستادي</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <Input id="email" label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input id="password" label="كلمة السر" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'جار التحميل...' : 'تسجيل الدخول'}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            ليس لديك حساب؟ <Link href="/register" className="font-medium text-primary-600 hover:text-primary-700">إنشاء حساب</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
