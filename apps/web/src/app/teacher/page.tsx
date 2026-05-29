'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, Button, Badge } from '@oustadi/ui';
import {
  Inbox, CheckCircle, Clock, MessageCircle,
  User, Calendar, Settings, Sparkles, X, Check,
  ExternalLink, ArrowUpRight, GraduationCap, BookOpen
} from 'lucide-react';
import { subjectName } from '@/lib/subject';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any>({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [rejecting, setRejecting] = useState<Record<string, boolean>>({});
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

  async function handleAction(requestId: string, action: 'accept' | 'reject') {
    const notes = action === 'reject' ? rejectNotes[requestId] : undefined;
    await apiRequest(`/requests/${requestId}/${action}`, {
      method: 'PATCH',
      body: notes ? JSON.stringify({ notes }) : undefined,
    });
    const res = await apiRequest('/requests');
    if (res.success && res.data) setRequests(res.data);
  }

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent shadow-xl" />
      <p className="text-sm font-bold text-gray-400 animate-pulse">{c('loading')}...</p>
    </div>
  );

  const stats = [
    { label: d('incomingRequests'), value: requests.received?.length || 0, icon: Inbox, color: 'bg-primary-50 text-primary-600', border: 'border-primary-100' },
    { label: d('accepted'), value: requests.received?.filter((r: any) => r.status === 'ACCEPTED').length || 0, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: d('pending'), value: requests.received?.filter((r: any) => r.status === 'PENDING').length || 0, icon: Clock, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
  ];

  const quickActions = [
    { label: t('myProfile'), icon: User, href: `/teachers/${user?.userId}`, color: 'bg-primary-600 text-white shadow-primary-200' },
    { label: d('availability') || 'الجدول', icon: Calendar, href: '/teacher/settings', color: 'bg-white text-gray-700 border border-gray-200' },
    { label: d('settings'), icon: Settings, href: '/teacher/settings', color: 'bg-white text-gray-700 border border-gray-200' },
  ];

  return (
    <div className="space-y-10 py-4 pb-12">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 p-8 text-white shadow-2xl lg:p-12">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between text-right">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
              {d('teacherDashboard')}
            </div>
            <h1 className="text-4xl font-black tracking-tight lg:text-5xl">
              {locale === 'fr' ? 'Bienvenue,' : 'أهلاً بك،'} <span className="text-primary-400">{user?.fullName?.split(' ')[0]}</span>!
            </h1>
            <p className="mt-3 text-lg font-medium text-gray-400">
              {requests.received?.filter((r: any) => r.status === 'PENDING').length > 0
                ? (locale === 'fr' ? `Vous avez ${requests.received?.filter((r: any) => r.status === 'PENDING').length} nouvelles demandes.` : `لديك ${requests.received?.filter((r: any) => r.status === 'PENDING').length} طلبات جديدة.`)
                : (locale === 'fr' ? 'Tout est à jour !' : 'كل شيء محدث!')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label} className={`border-2 ${item.border} shadow-sm transition-all hover:shadow-md`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.color} shadow-inner`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900 leading-none">{item.value}</p>
                  <p className="mt-1 text-xs font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-12 text-right">
        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{d('incomingRequests')}</h2>
            <Link href="/teacher/requests" className="text-sm font-bold text-primary-600 hover:underline">{c('viewAll')}</Link>
          </div>

          <div className="space-y-4">
            {requests.received?.slice(0, 10).map((req: any) => (
              <Card key={req.id} className="group overflow-hidden border-2 border-transparent bg-white shadow-sm transition-all hover:border-primary-100 hover:shadow-xl hover:shadow-primary-900/5">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-primary-600 border border-gray-100 group-hover:scale-110 transition-transform shadow-sm">
                        {req.student?.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-black text-gray-900 leading-tight">{req.student?.fullName}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter justify-end">
                           {subjectName(req.subject, locale)}
                           <BookOpen className="h-3 w-3" />
                        </div>
                        {req.bookedDate && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase justify-end">
                            {req.bookedTime} - {new Date(req.bookedDate).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'ar-MA', { day: 'numeric', month: 'short' })}
                            <Calendar className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      {req.status === 'PENDING' && (
                        <div className="flex flex-col items-end gap-3">
                          {rejecting[req.id] ? (
                            <div className="flex flex-col items-end gap-2 animate-in slide-in-from-top-2 duration-300">
                              <textarea
                                value={rejectNotes[req.id] || ''}
                                onChange={(e) => setRejectNotes((r) => ({ ...r, [req.id]: e.target.value }))}
                                placeholder={d('confirmReject')}
                                className="w-64 rounded-2xl border-2 border-red-100 bg-red-50/30 px-4 py-3 text-sm font-medium focus:border-red-500 outline-none transition-all text-right shadow-inner"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" className="rounded-xl px-4 font-black" onClick={() => handleAction(req.id, 'accept')}>
                                  <Check className="ml-1.5 h-4 w-4" /> {d('accept')}
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-xl px-4 font-black text-red-600 border-red-200 hover:bg-red-50" onClick={() => { handleAction(req.id, 'reject'); setRejecting((r) => ({ ...r, [req.id]: false })); }}>
                                  <X className="ml-1.5 h-4 w-4" /> {d('reject')}
                                </Button>
                                <button onClick={() => setRejecting((r) => ({ ...r, [req.id]: false }))} className="text-xs font-black text-gray-400 hover:text-gray-600 transition-colors mr-2">{c('cancel')}</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button size="sm" className="h-11 rounded-xl px-6 font-black shadow-lg shadow-primary-200 transition-transform active:scale-95" onClick={() => handleAction(req.id, 'accept')}>
                                <Check className="ml-1.5 h-4 w-4" /> {d('accept')}
                              </Button>
                              <Button size="sm" variant="outline" className="h-11 rounded-xl px-6 font-black border-2 transition-transform active:scale-95" onClick={() => setRejecting((r) => ({ ...r, [req.id]: true }))}>
                                <X className="ml-1.5 h-4 w-4" /> {d('reject')}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {req.status === 'ACCEPTED' && (
                        <div className="flex items-center gap-3">
                          <Link href="/teacher/chat">
                            <Button size="sm" className="h-11 rounded-xl px-6 font-black shadow-lg shadow-primary-200 transition-transform active:scale-95">
                              <MessageCircle className="ml-1.5 h-4 w-4" />
                              {d('message')}
                            </Button>
                          </Link>
                          <Badge variant="success" className="px-5 py-2 font-black uppercase tracking-widest text-[10px]">
                            {d('accepted')}
                          </Badge>
                        </div>
                      )}

                      {req.status === 'REJECTED' && (
                        <Badge variant="destructive" className="px-5 py-2 font-black uppercase tracking-widest text-[10px]">
                          {d('rejected')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] bg-gray-50 p-5 border border-gray-100 shadow-inner group-hover:bg-white group-hover:shadow-sm transition-colors">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{locale === 'fr' ? 'Message du candidat' : 'رسالة المترشح'}</p>
                    <p className="text-gray-600 font-medium leading-relaxed italic">"{req.message}"</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {requests.received?.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-gray-100 py-20 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gray-50 text-gray-200">
                  <Inbox className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-black text-gray-400 tracking-tight">{d('noIncomingRequests')}</h3>
                <p className="mt-2 max-w-xs text-sm font-medium text-gray-400 leading-relaxed">
                  {locale === 'fr'
                    ? "C'est un peu calme ici. Partagez votre profil pour attirer plus d'étudiants !"
                    : "الأمور هادئة هنا. شارك ملفك الشخصي لجذب المزيد من الطلاب!"}
                </p>
                <Link href={`/teachers/${user?.userId}`} className="mt-8">
                  <Button className="rounded-2xl px-8 py-6 font-black shadow-xl shadow-primary-200">
                    <ExternalLink className="ml-2 h-5 w-5" /> {locale === 'fr' ? 'Voir mon profil' : 'عرض ملفي الشخصي'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="mt-12 space-y-8 lg:mt-0">
           {/* Profile Performance Widget */}
           <Card className="rounded-[2.5rem] border-0 bg-gradient-to-br from-gray-800 to-black p-2 shadow-2xl shadow-gray-900/20 text-white text-right">
              <CardContent className="p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                  <ArrowUpRight className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">{locale === 'fr' ? 'Performance' : 'الأداء'}</h3>
                <p className="mt-2 text-sm font-medium text-gray-400 leading-relaxed">
                  {locale === 'fr'
                    ? "Votre profil a été vu 124 fois cette semaine. Continuez comme ça !"
                    : "تمت مشاهدة ملفك الشخصي 124 مرة هذا الأسبوع. واصل العمل الجيد!"}
                </p>
                <div className="mt-6 space-y-3">
                   <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-500">
                      <span className="text-emerald-400">+12%</span>
                      <span>{locale === 'fr' ? 'Visibilité' : 'الظهور'}</span>
                   </div>
                   <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-[75%] rounded-full bg-primary-500 shadow-[0_0_10px_rgba(var(--primary-500-rgb),0.5)]" />
                   </div>
                </div>
              </CardContent>
           </Card>

           {/* Tips for Teachers Widget */}
           <div className="p-8 rounded-[2.5rem] border-2 border-gray-100 bg-white text-right">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">{locale === 'fr' ? 'Conseils Pro' : 'نصائح مهنية'}</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <p className="text-sm font-bold text-gray-600 leading-snug">
                    {locale === 'fr' ? "Répondez aux demandes en moins de 2h pour augmenter votre visibilité." : "رد على الطلبات في أقل من ساعتين لزيادة ظهورك."}
                  </p>
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Sparkles className="h-5 w-5" /></div>
                </li>
                <li className="flex gap-4">
                  <p className="text-sm font-bold text-gray-600 leading-snug">
                    {locale === 'fr' ? "Un profil complet avec vidéo convertit 3x plus d'étudiants." : "الملف الشخصي الكامل مع فيديو يجذب 3 مرات أكثر من الطلاب."}
                  </p>
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><GraduationCap className="h-5 w-5" /></div>
                </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
