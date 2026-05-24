'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [msg, setMsg] = useState('Completing sign-in...');

  useEffect(() => {
    const accessToken = sp.get('accessToken');
    const refreshToken = sp.get('refreshToken');
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      window.location.href = '/';
    } else {
      setMsg('Sign-in failed. Redirecting...');
      setTimeout(() => router.push('/login'), 2000);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">{msg}</p>
    </div>
  );
}
