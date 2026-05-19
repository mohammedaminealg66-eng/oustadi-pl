'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';

export function CtaButtons() {
  const h = useTranslations('home');
  const c = useTranslations('common');
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Link
        href="/teachers"
        className="rounded-xl bg-primary-600 px-8 py-3 text-sm font-medium text-white transition hover:bg-primary-700"
      >
        {h('browseTeachers')}
      </Link>
      {!isAuthenticated && (
        <Link
          href="/register"
          className="rounded-xl border border-gray-300 bg-white px-8 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {c('freeRegister')}
        </Link>
      )}
    </>
  );
}
