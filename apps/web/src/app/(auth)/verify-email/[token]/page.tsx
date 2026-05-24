'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const t = useTranslations('auth');

  useEffect(() => {
    apiRequest('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }), skipAuth: true }).then((res) => {
      setStatus(res.success ? 'success' : 'error');
      if (res.success) setTimeout(() => router.push('/login'), 3000);
    });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {status === 'loading' && <p className="text-gray-500">{t('verifying')}</p>}
        {status === 'success' && (
          <div className="space-y-2">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            <p className="text-lg font-semibold text-gray-900">{t('emailVerified')}</p>
            <p className="text-sm text-gray-500">{t('redirectToLogin')}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="space-y-2">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="text-lg font-semibold text-gray-900">{t('verificationFailed')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
