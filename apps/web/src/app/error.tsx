'use client';

import { useTranslations } from 'next-intl';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('common.errorOccurred')}</h1>
      <p className="text-gray-500">{error.message || t('common.error')}</p>
      <button onClick={reset} className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700">
        {t('common.retry')}
      </button>
    </div>
  );
}
