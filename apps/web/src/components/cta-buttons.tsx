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
        className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-gray-100"
      >
        {h('browseTeachers')}
      </Link>
      {!isAuthenticated && (
        <Link
          href="/register"
          className="rounded-xl border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          {c('freeRegister')}
        </Link>
      )}
    </>
  );
}
