'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (user.role === 'TEACHER') router.replace('/teacher');
      else if (user.role === 'ADMIN') router.replace('/admin');
      else router.replace('/student');
    }
  }, [user, loading, router]);

  if (loading || user) return (
    <>
      <Header />
      <main className="flex min-h-[60vh] items-center justify-center"><p className="text-gray-500">جار التحميل...</p></main>
    </>
  );

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
              ابحث عن <span className="text-primary-600">أستاذك</span> المثالي
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              منصة مغربية تربط بين الأساتذة والطلاب بسهولة. ابحث، تصفح، وتواصل مع أفضل الأساتذة في جميع المدن المغربية.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/teachers"
                className="rounded-xl bg-primary-600 px-8 py-3 text-sm font-medium text-white transition hover:bg-primary-700"
              >
                تصفح الأساتذة
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-gray-300 bg-white px-8 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                إنشاء حساب مجاني
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-center text-2xl font-bold text-gray-900">كيف تعمل المنصة</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                { title: 'للطلاب', desc: 'ابحث عن الأساتذة، تصفح ملفاتهم، وأرسل طلبات الدروس بسهولة.' },
                { title: 'للأساتذة', desc: 'أنشئ ملفك المهني، اعرض خدماتك، وتواصل مع الطلاب المهتمين.' },
                { title: 'تواصل', desc: 'دردش مع أساتذتك أو طلابك عبر المنصة ونسق جلسات التعلم.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
