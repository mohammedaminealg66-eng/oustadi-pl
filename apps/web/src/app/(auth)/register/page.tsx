'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button, Input, Card, CardContent, CardHeader } from '@oustadi/ui';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'STUDENT', language: 'ar' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      setError(result.error || 'فشل إنشاء الحساب');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold text-gray-900">إنشاء حساب جديد</h1>
          <p className="mt-1 text-center text-sm text-gray-500">انضم إلى منصة أستادي</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <Input id="fullName" label="الاسم الكامل" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            <Input id="email" label="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input id="password" label="كلمة السر" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">نوع الحساب</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="STUDENT">طالب</option>
                <option value="TEACHER">أستاذ</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'جار التحميل...' : 'إنشاء الحساب'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            لديك حساب بالفعل؟ <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">تسجيل الدخول</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
