import type { Metadata } from 'next';
import { Providers } from '@/providers/providers';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
