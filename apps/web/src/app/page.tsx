import { getTranslations, getLocale } from 'next-intl/server';
import { Footer } from '@/components/layout/footer';
import { CtaButtons } from '@/components/cta-buttons';
import { Search, Users, GraduationCap, MessageCircle, Star, Shield, ArrowRight, Zap, Play, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function HomePage() {
  const t = await getTranslations('home');
  const locale = await getLocale();

  return (
    <>
      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative bg-white pt-16 pb-20 lg:pt-24 lg:pb-32">
          <div className="absolute inset-0 z-0 opacity-30">
            <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary-100 blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-secondary-100 blur-[100px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 text-center lg:text-right">
            <div className="mx-auto mb-8 inline-flex items-center gap-3 rounded-full border border-primary-100 bg-primary-50/50 px-5 py-2 text-sm font-black text-primary-700 backdrop-blur-sm lg:mx-0">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white"><Zap className="h-3 w-3 fill-current" /></span>
              {t('heroBadge')}
            </div>
            
            <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <h1 className="text-5xl font-black leading-[1.1] text-gray-900 tracking-tighter md:text-7xl lg:text-7xl">
                  {t.rich('heroTitle', { span: (chunks) => <span className="text-primary-600">{chunks}</span> })}
                </h1>
                <p className="mt-8 text-xl font-medium leading-relaxed text-gray-500 md:text-2xl">
                  {t('heroSubtitle')}
                </p>
                <div className="mt-12 flex flex-col items-center gap-5 sm:flex-row lg:justify-start">
                  <CtaButtons />
                  <Link href="/teachers" className="group flex items-center gap-2 text-lg font-black text-gray-900 hover:text-primary-600 transition-colors">
                    {locale === 'fr' ? 'Découvrir les profs' : 'اكتشف الأساتذة'}
                    <ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${locale === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </Link>
                </div>

                <div className="mt-16 flex items-center justify-center gap-8 border-t border-gray-100 pt-10 lg:justify-start">
                   <div className="flex -space-x-3 rtl:space-x-reverse">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 shadow-sm" />
                      ))}
                   </div>
                   <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-black text-gray-900">4.9/5</span>
                      </div>
                      <p className="text-xs font-bold text-gray-400">{locale === 'fr' ? 'Par plus de 2000 élèves' : 'من قبل أكثر من 2000 طالب'}</p>
                   </div>
                </div>
              </div>

              <div className="mt-16 lg:mt-0 relative">
                <div className="relative aspect-square overflow-hidden rounded-[4rem] bg-gray-50 shadow-2xl ring-1 ring-gray-100">
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/10 to-transparent" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[120%] w-[120%] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,transparent_70%)]" />
                  
                  {/* Placeholder for dynamic visual/Illustration */}
                  <div className="flex h-full w-full items-center justify-center p-12">
                     <div className="grid grid-cols-2 gap-4 w-full h-full">
                        <div className="bg-primary-100 rounded-[2rem] animate-pulse" />
                        <div className="bg-secondary-100 rounded-[2rem] animate-pulse delay-100" />
                        <div className="bg-indigo-100 rounded-[2rem] animate-pulse delay-200" />
                        <div className="bg-emerald-100 rounded-[2rem] animate-pulse delay-300" />
                     </div>
                  </div>

                  {/* Trust Card overlay */}
                  <div className="absolute bottom-10 left-10 right-10 rounded-3xl bg-white/80 p-6 shadow-2xl backdrop-blur-xl border border-white/50">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white"><Play className="h-6 w-6 fill-current" /></div>
                      <div className="text-right flex-1">
                        <p className="text-sm font-black text-gray-900">{locale === 'fr' ? 'Vidéos de présentation' : 'فيديوهات تعريفية'}</p>
                        <p className="text-xs font-bold text-gray-500">{locale === 'fr' ? 'Apprenez à connaître votre prof' : 'تعرف على أستاذك مباشرة'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="bg-gray-50 py-12 border-y border-gray-100">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { icon: Users, value: '500+', label: t('statTeachers'), color: 'text-primary-600' },
                { icon: GraduationCap, value: '2000+', label: t('statStudents'), color: 'text-secondary-600' },
                { icon: Star, value: '4.8', label: t('statRating'), color: 'text-yellow-600' },
                { icon: Globe, value: '100%', label: locale === 'fr' ? 'Marocain' : 'مغربي 100%', color: 'text-indigo-600' },
              ].map((s) => (
                <div key={s.label} className="text-center group">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 group-hover:scale-110 transition-transform">
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{s.value}</p>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works with modern cards */}
        <section className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-20 text-center">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight md:text-5xl">{t('howItWorks')}</h2>
              <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-primary-600" />
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              {[
                { title: 'cardStudentTitle', desc: 'cardStudentDesc', icon: Search, color: 'bg-primary-600', step: '01' },
                { title: 'cardTeacherTitle', desc: 'cardTeacherDesc', icon: GraduationCap, color: 'bg-secondary-500', step: '02' },
                { title: 'cardConnectTitle', desc: 'cardConnectDesc', icon: MessageCircle, color: 'bg-indigo-600', step: '03' },
              ].map((item) => (
                <div key={item.title} className="group relative rounded-[3rem] border border-gray-100 bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-primary-900/5 hover:-translate-y-2">
                  <div className="absolute top-8 left-8 text-6xl font-black text-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">{item.step}</div>
                  <div className={`relative z-10 mb-8 flex h-16 w-16 items-center justify-center rounded-2xl ${item.color} text-white shadow-lg shadow-primary-200 transition-transform group-hover:rotate-6 group-hover:scale-110`}>
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="relative z-10 text-2xl font-black text-gray-900 tracking-tight">{t(item.title)}</h3>
                  <p className="relative z-10 mt-4 text-base font-medium leading-relaxed text-gray-500">{t(item.desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="bg-primary-900 py-24 text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/logo.png')] bg-[length:200px] opacity-[0.02] rotate-12" />
          <div className="mx-auto max-w-7xl px-4 relative z-10">
            <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-20">
              <div className="text-right">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary-400">
                   {locale === 'fr' ? 'Qualité Garantie' : 'جودة مضمونة'}
                </div>
                <h2 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                  {locale === 'fr' ? 'La plateforme de confiance' : 'المنصة الموثوقة'} <br />
                  {locale === 'fr' ? 'pour le soutien scolaire.' : 'للدعم المدرسي.'}
                </h2>
                <div className="mt-12 space-y-8">
                  {[
                    { icon: Shield, title: locale === 'fr' ? 'Profils vérifiés' : 'ملفات موثقة', desc: locale === 'fr' ? 'Tous nos professeurs passent par un processus de validation strict.' : 'كل الأساتذة يمرون بعملية تدقيق صارمة لشهاداتهم.' },
                    { icon: MessageCircle, title: locale === 'fr' ? 'Messagerie instantanée' : 'تواصل فوري', desc: locale === 'fr' ? 'Discutez directement avec votre prof avant de réserver.' : 'تحدث مباشرة مع أستاذك قبل الحجز.' },
                    { icon: Zap, title: locale === 'fr' ? 'Sans commission' : 'بدون عمولة', desc: locale === 'fr' ? 'Payez votre prof directement. Aucun frais caché.' : 'ادفع لأستاذك مباشرة. لا توجد رسوم خفية.' },
                  ].map((feat) => (
                    <div key={feat.title} className="flex gap-6 items-start justify-start text-right">
                       <div className="flex-1 order-first sm:order-none">
                          <h4 className="text-xl font-black text-white">{feat.title}</h4>
                          <p className="mt-2 text-primary-200 font-medium opacity-80">{feat.desc}</p>
                       </div>
                       <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0"><feat.icon className="h-6 w-6 text-primary-400" /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-20 lg:mt-0">
                 <div className="relative p-8 rounded-[3rem] bg-gradient-to-br from-primary-800 to-primary-700 shadow-2xl border border-white/10">
                    <div className="space-y-4">
                       {[1,2,3].map(i => (
                         <div key={i} className={`h-24 w-full rounded-3xl bg-white/5 border border-white/5 flex items-center gap-4 px-6 ${i === 2 ? 'translate-x-6' : ''}`}>
                            <div className="h-12 w-12 rounded-2xl bg-white/10 animate-pulse" />
                            <div className="flex-1 space-y-2">
                               <div className="h-3 w-1/3 bg-white/20 rounded-full" />
                               <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA with refined design */}
        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-5xl px-4">
            <div className="relative overflow-hidden rounded-[4rem] bg-primary-600 px-8 py-16 text-center text-white shadow-[0_40px_100px_rgba(var(--primary-600-rgb),0.3)] lg:py-24">
              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
              
              <h2 className="relative z-10 text-4xl font-black tracking-tight md:text-5xl">{t('ctaTitle')}</h2>
              <p className="relative z-10 mx-auto mt-6 max-w-xl text-xl font-medium text-primary-50 opacity-90">{t('ctaSubtitle')}</p>
              <div className="relative z-10 mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
                <CtaButtons />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
