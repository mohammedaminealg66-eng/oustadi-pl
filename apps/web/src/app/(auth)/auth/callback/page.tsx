'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/lib/api';
import { useTranslations } from 'next-intl';

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const t = useTranslations();
  const [msg, setMsg] = useState(t('common.completingSignIn'));

  useEffect(() => {
    const accessToken = sp.get('accessToken');
    const refreshToken = sp.get('refreshToken');
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      window.location.href = '/';
    } else {
      setMsg(t('common.signInFailed'));
      setTimeout(() => router.push('/login'), 2000);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">{msg}</p>
    </div>
  );
}
