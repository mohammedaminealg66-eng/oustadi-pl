import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500">{t('common.notFound')}</p>
      <Link href="/" className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700">
        {t('common.backToHome')}
      </Link>
    </div>
  );
}
