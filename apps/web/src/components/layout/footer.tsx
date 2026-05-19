'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-t bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
        <p>{t('copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
