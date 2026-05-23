import { getTranslations } from 'next-intl/server';
import { Footer } from '@/components/layout/footer';
import { CtaButtons } from '@/components/cta-buttons';

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <>
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
              {t.rich('heroTitle', { span: (chunks) => <span className="text-primary-600">{chunks}</span> })}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              {t('heroSubtitle')}
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <CtaButtons />
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-center text-2xl font-bold text-gray-900">{t('howItWorks')}</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                { title: 'cardStudentTitle', desc: 'cardStudentDesc' },
                { title: 'cardTeacherTitle', desc: 'cardTeacherDesc' },
                { title: 'cardConnectTitle', desc: 'cardConnectDesc' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900">{t(item.title)}</h3>
                  <p className="mt-2 text-sm text-gray-600">{t(item.desc)}</p>
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
