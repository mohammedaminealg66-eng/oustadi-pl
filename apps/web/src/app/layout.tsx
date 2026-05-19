import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { Providers } from '@/providers/providers';
import { NotifierShell } from '@/components/notifier-shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'أستادي - Oustadi | منصة التعليم المغربية',
  description: 'أستادي هي منصة مغربية تربط بين الأساتذة والطلاب. ابحث عن أستاذك المثالي في جميع المدن المغربية.',
  openGraph: {
    title: 'أستادي - Oustadi',
    description: 'منصة مغربية تربط بين الأساتذة والطلاب',
    type: 'website',
    locale: 'ar_MA',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers><NotifierShell>{children}</NotifierShell></Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
