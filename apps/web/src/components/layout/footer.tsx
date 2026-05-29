'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-t bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <Link href="/" className="text-lg font-bold text-primary-600">Oustadi</Link>
            <p className="mt-1 text-sm text-gray-500">{t('tagline')}</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/teachers" className="hover:text-primary-600">{t('teachers')}</Link>
            <Link href="/login" className="hover:text-primary-600">{t('login')}</Link>
            <Link href="/register" className="hover:text-primary-600">{t('register')}</Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-gray-400">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
