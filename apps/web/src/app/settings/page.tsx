'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations } from 'next-intl';

export default function SettingsRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    const role = user.role === 'TEACHER' ? '/teacher' : user.role === 'ADMIN' ? '/admin' : '/student';
    router.replace(`${role}/settings`);
  }, [user, loading, router]);

  return <div className="flex min-h-screen items-center justify-center text-gray-500">{loading ? '...' : t('common.redirecting')}</div>;
}
