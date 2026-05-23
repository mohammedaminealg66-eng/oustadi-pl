'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

export default function DisputeRedirect() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    const role = user.role === 'TEACHER' ? '/teacher' : user.role === 'ADMIN' ? '/admin' : '/student';
    router.replace(`${role}/disputes/${id}`);
  }, [id, user, loading, router]);

  return <div className="flex min-h-screen items-center justify-center text-gray-500">{loading ? '...' : 'جارٍ التوجيه...'}</div>;
}
