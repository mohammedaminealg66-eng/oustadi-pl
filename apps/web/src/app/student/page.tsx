'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { subjectName } from '@/lib/subject';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, Button, Badge } from '@oustadi/ui';
import {
  Send, CheckCircle, Clock, XCircle, MessageCircle,
  Search, Heart, Settings, Sparkles, ChevronLeft,
  Calendar, BookOpen, GraduationCap
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any>({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const locale = useLocale();
  const d = useTranslations('dashboard');
  const c = useTranslations('common');
  const t = useTranslations('teacher');

  useEffect(() => {
    apiRequest('/requests').then((res) => {
      if (res.success && res.data) setRequests(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent shadow-xl" />
      <p className="text-sm font-bold text-gray-400 animate-pulse">{c('loading')}...</p>
    </div>
  );

  const stats = [
    { label: d('sentRequests'), value: requests.sent?.length || 0, icon: Send, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
    { label: d('accepted'), value: requests.sent?.filter((r: any) => r.status === 'ACCEPTED').length || 0, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: d('pending'), value: requests.sent?.filter((r: any) => r.status === 'PENDING').length || 0, icon: Clock, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
    { label: d('rejected'), value: requests.sent?.filter((r: any) => r.status === 'REJECTED').length || 0, icon: XCircle, color: 'bg-red-50 text-red-600', border: 'border-red-100' },
  ];

  const quickActions = [
    { label: t('findTeacher'), icon: Search, href: '/teachers', color: 'bg-primary-600 text-white shadow-primary-200' },
    { label: d('favorites') || 'المفضلة', icon: Heart, href: '/student/favorites', color: 'bg-white text-gray-700 border border-gray-200' },
    { label: d('settings'), icon: Settings, href: '/student/settings', color: 'bg-white text-gray-700 border border-gray-200' },
  ];

  return (
    <div className="space-y-10 py-4 pb-12">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary-600 p-8 text-white shadow-2xl shadow-primary-900/20 lg:p-12">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary-400/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              {d('studentDashboard')}
            </div>
            <h1 className="text-4xl font-black tracking-tight lg:text-5xl">
              {locale === 'fr' ? 'Bonjour,' : 'مرحباً،'} <span className="text-primary-100">{user?.fullName?.split(' ')[0]}</span>!
            </h1>
            <p className="mt-3 text-lg font-medium text-primary-50 opacity-90">
              {requests.sent?.filter((r: any) => r.status === 'PENDING').length > 0
                ? (locale === 'fr' ? `Vous avez ${requests.sent?.filter((r: any) => r.status === 'PENDING').length} demandes en attente.` : `لديك ${requests.sent?.filter((r: any) => r.status === 'PENDING').length} طلبات قيد الانتظار.`)
                : (locale === 'fr' ? 'Prêt pour votre prochaine leçon ?' : 'هل أنت مستعد لدرسك القادم؟')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <button className={`flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-black transition-all hover:scale-105 active:scale-95 ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                  {action.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className={`border-2 ${item.border} shadow-sm transition-all hover:shadow-md`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.color} shadow-inner`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-900 leading-none">{item.value}</p>
                  <p className="mt-1 text-xs font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-12">
        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{d('myRequests')}</h2>
            <Link href="/student/requests" className="text-sm font-bold text-primary-600 hover:underline">{c('viewAll')}</Link>
          </div>

          <div className="space-y-4">
            {requests.sent?.slice(0, 10).map((req: any) => (
              <Card key={req.id} className="group overflow-hidden border-2 border-transparent bg-white shadow-sm transition-all hover:border-primary-100 hover:shadow-xl hover:shadow-primary-900/5">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-primary-600 border border-gray-100 group-hover:scale-110 transition-transform">
                        {req.teacher?.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-black text-gray-900 leading-tight">{req.teacher?.fullName}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                          <BookOpen className="h-3 w-3" />
                          {subjectName(req.subject, locale)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {req.bookedDate && (
                        <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-1.5 text-[10px] font-black text-gray-500 border border-gray-100">
                          <Calendar className="h-3 w-3" />
                          {new Date(req.bookedDate).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'ar-MA', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                      <Badge variant={
                        req.status === 'ACCEPTED' ? 'success' :
                        req.status === 'REJECTED' ? 'destructive' : 'warning'
                      } className="px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                        {req.status === 'ACCEPTED' ? d('accepted') : req.status === 'REJECTED' ? d('rejected') : d('pending')}
                      </Badge>
                      {req.status === 'ACCEPTED' && (
                        <Link href="/student/chat">
                          <Button size="sm" className="h-10 rounded-xl px-4 font-black shadow-lg shadow-primary-200">
                            <MessageCircle className="ml-1.5 h-4 w-4" />
                            {d('message')}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {req.status === 'REJECTED' && req.teacherNotes && (
                    <div className="mt-4 rounded-2xl bg-red-50 p-4 border border-red-100">
                      <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">{d('rejectionReason')}</p>
                      <p className="text-sm font-bold text-red-700 leading-relaxed italic">"{req.teacherNotes}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {requests.sent?.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-gray-100 py-20 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gray-50 text-gray-200">
                  <GraduationCap className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-black text-gray-400 tracking-tight">{d('noRequests')}</h3>
                <p className="mt-2 max-w-xs text-sm font-medium text-gray-400 leading-relaxed">
                  {locale === 'fr'
                    ? "Commencez votre voyage d'apprentissage en trouvant l'enseignant idéal."
                    : "ابدأ رحلتك التعليمية بالعثور على الأستاذ المثالي."}
                </p>
                <Link href="/teachers" className="mt-8">
                  <Button className="rounded-2xl px-8 py-6 font-black shadow-xl shadow-primary-200">{t('findTeacher')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Sidebar Widgets */}
        <div className="mt-12 space-y-8 lg:mt-0">
           {/* Active Learning Widget */}
           <Card className="rounded-[2.5rem] border-0 bg-gradient-to-br from-indigo-600 to-indigo-800 p-2 shadow-2xl shadow-indigo-900/20 text-white">
              <CardContent className="p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">{locale === 'fr' ? 'Besoin d\'aide ?' : 'تحتاج مساعدة؟'}</h3>
                <p className="mt-2 text-sm font-medium text-indigo-100 opacity-80 leading-relaxed">
                  {locale === 'fr'
                    ? "Notre équipe d'assistance est disponible pour vous aider à trouver le meilleur enseignant."
                    : "فريق الدعم لدينا متاح لمساعدتك في العثور على أفضل أستاذ."}
                </p>
                <Link href="/chat">
                  <Button variant="secondary" className="mt-6 w-full h-12 rounded-xl font-black shadow-lg shadow-indigo-900/40">
                    {d('chatTitle') || 'تواصل معنا'}
                  </Button>
                </Link>
              </CardContent>
           </Card>

           {/* Tips Widget */}
           <div className="p-8 rounded-[2.5rem] border-2 border-gray-100 bg-white">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">{locale === 'fr' ? 'Astuces' : 'نصائح'}</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Sparkles className="h-5 w-5" /></div>
                  <p className="text-sm font-bold text-gray-600 leading-snug">
                    {locale === 'fr' ? "Regardez les vidéos de présentation pour mieux connaître vos professeurs." : "شاهد فيديوهات التعريف للتعرف أكثر على أساتذتك."}
                  </p>
                </li>
                <li className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><CheckCircle className="h-5 w-5" /></div>
                  <p className="text-sm font-bold text-gray-600 leading-snug">
                    {locale === 'fr' ? "Les professeurs avec le badge 'Vérifié' ont des diplômes certifiés." : "الأساتذة الحاصلون على شارة 'موثق' لديهم شهادات معتمدة."}
                  </p>
                </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
