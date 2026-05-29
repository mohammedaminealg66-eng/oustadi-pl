'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, Button, Badge, Skeleton, cn } from '@oustadi/ui';
import {
  Users, Inbox, CheckCircle, Clock, MessageCircle,
  User, Calendar as CalendarIcon, Settings, Sparkles, X, Check,
  ExternalLink, ArrowUpRight, GraduationCap, BookOpen,
  TrendingUp, TrendingDown, MoreHorizontal, ChevronRight,
  Plus, MessageSquare, Star, Zap, Bell, Target, Award
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

  // Mock data for new widgets
  const earnings = { amount: 12450, growth: 12.5, data: [120, 150, 180, 220, 210, 250, 300] };
  const studentGrowth = { count: 48, growth: 8.2, data: [30, 32, 35, 40, 42, 45, 48] };
  const profileCompletion = 85;

  const upcomingLessons: Array<{ id: string; type: string; time: string; date: string; student?: { fullName?: string }; subject?: { nameAr: string; nameFr: string } }> = useMemo(() => {
     // In a real app, this would come from a /lessons or /schedule API
     // For now, we derive from accepted requests
     return (requests.received || [])
       .filter((r: any) => r.status === 'ACCEPTED')
       .slice(0, 3)
       .map((r: any, idx: number) => ({
         ...r,
         time: r.bookedTime || '09:00',
         date: r.bookedDate || new Date().toISOString(),
         type: idx === 0 ? 'active' : 'upcoming'
       }));
  }, [requests.received]);

  if (loading) return <DashboardSkeleton locale={locale} />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 lg:text-4xl">
            {locale === 'fr' ? 'Tableau de Bord' : 'لوحة التحكم'}
          </h1>
          <p className="mt-1 text-gray-500 font-medium text-right">
            {locale === 'fr' 
              ? `Heureux de vous revoir, ${user?.fullName?.split(' ')[0]} !` 
              : `سعداء برؤيتك مجدداً، ${user?.fullName?.split(' ')[0]}!`}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/teacher/settings">
              <Button variant="outline" className="rounded-xl border-gray-200 font-black">
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {d('calendar')}
              </Button>
           </Link>
           <Link href="/teacher/requests">
              <Button className="rounded-xl font-black shadow-lg shadow-primary-200">
                 <Plus className="mr-2 h-4 w-4" />
                 {locale === 'fr' ? 'Nouveau Cours' : 'درس جديد'}
              </Button>
           </Link>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {/* Earnings Card */}
        <Card className="group relative overflow-hidden border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100 transition-all hover:shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-none font-black">
                +{earnings.growth}%
              </Badge>
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400 text-right">{d('earnings')}</p>
            <div className="mt-1 flex items-baseline gap-1 justify-end">
              <h3 className="text-3xl font-black text-gray-900">{earnings.amount}</h3>
              <span className="text-sm font-bold text-gray-400">{t('dh')}</span>
            </div>
            <div className="mt-4 flex items-end gap-1 h-12">
               {earnings.data.map((v, i) => (
                 <div 
                   key={i} 
                   className="flex-1 bg-emerald-100 rounded-t-sm transition-all group-hover:bg-emerald-500" 
                   style={{ height: `${(v / 300) * 100}%` }} 
                 />
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Students Card */}
        <Card className="group relative overflow-hidden border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100 transition-all hover:shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-transform group-hover:scale-110">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-primary-100 text-primary-700 border-none font-black">
                +{studentGrowth.growth}%
              </Badge>
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400 text-right">{d('students')}</p>
            <div className="mt-1 flex items-baseline gap-1 justify-end">
              <h3 className="text-3xl font-black text-gray-900">{studentGrowth.count}</h3>
              <span className="text-sm font-bold text-gray-400">{t('students')}</span>
            </div>
            <div className="mt-4 flex items-end gap-1 h-12">
               {studentGrowth.data.map((v, i) => (
                 <div 
                   key={i} 
                   className="flex-1 bg-primary-100 rounded-t-sm transition-all group-hover:bg-primary-500" 
                   style={{ height: `${(v / 50) * 100}%` }} 
                 />
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Card */}
        <Card className="group relative overflow-hidden border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100 transition-all hover:shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
                <Star className="h-6 w-6 fill-current" />
              </div>
              <div className="flex gap-0.5">
                 {[1,2,3,4,5].map(i => <Star key={i} className={cn("h-3 w-3", i <= 4 ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")} />)}
              </div>
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400 text-right">{d('rating')}</p>
            <div className="mt-1 flex items-baseline gap-1 justify-end">
              <h3 className="text-3xl font-black text-gray-900">4.9</h3>
              <span className="text-sm font-bold text-gray-400">/ 5.0</span>
            </div>
            <p className="mt-2 text-xs font-bold text-emerald-600 text-right">
               {locale === 'fr' ? 'Excellent travail !' : 'عمل ممتاز!'}
            </p>
          </CardContent>
        </Card>

        {/* Profile Completion Card */}
        <Card className="group relative overflow-hidden border-none bg-gray-900 text-white shadow-xl shadow-gray-900/20 transition-all hover:shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                <Target className="h-6 w-6 text-primary-400" />
              </div>
              <span className="text-xl font-black text-primary-400">{profileCompletion}%</span>
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400 text-right">{d('profileCompletion')}</p>
            <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
               <div 
                 className="h-full rounded-full bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                 style={{ width: `${profileCompletion}%` }} 
               />
            </div>
            <p className="mt-4 text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest text-right">
               {locale === 'fr' 
                 ? '+25% de visibilité si complété' 
                 : '+25% زيادة في الظهور عند الإكمال'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main Content: Lessons & Requests */}
        <div className="lg:col-span-2 space-y-10">
          {/* Upcoming Lessons Timeline */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center"><CalendarIcon className="h-4 w-4 text-indigo-600" /></div>
                {d('upcomingLessons')}
              </h2>
              <Link href="/teacher/settings" className="group flex items-center gap-1 text-sm font-black text-primary-600 hover:underline">
                 {c('viewAll')}
                 <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", locale === 'ar' && "rotate-180 group-hover:-translate-x-1")} />
              </Link>
            </div>

            <div className={cn("relative space-y-6 before:absolute before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-gray-100", locale === 'fr' ? "before:left-6" : "before:right-6")}>
               {upcomingLessons.length > 0 ? upcomingLessons.map((lesson) => (
                 <div key={lesson.id} className="relative flex items-start gap-10 group">
                    <div className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-4 border-white shadow-md transition-all group-hover:scale-110 z-10",
                      lesson.type === 'active' ? "bg-primary-600 text-white animate-pulse" : "bg-white text-gray-400 ring-1 ring-gray-100"
                    )}>
                       <Clock className="h-5 w-5" />
                    </div>
                    <Card className="flex-1 border-none bg-white shadow-lg shadow-gray-900/5 ring-1 ring-gray-100 transition-all group-hover:ring-primary-100 group-hover:shadow-xl">
                       <CardContent className="p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-right">
                             <div className="flex items-center gap-4 flex-row-reverse sm:flex-row">
                                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-primary-600">
                                   {lesson.student?.fullName?.charAt(0)}
                                </div>
                                <div className="text-right sm:text-left">
                                   <p className="font-black text-gray-900 leading-none">{lesson.student?.fullName}</p>
                                   <p className="mt-1 text-xs font-bold text-gray-400">{subjectName(lesson.subject, locale)}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3 justify-end">
                                <div className="text-right sm:block hidden">
                                   <p className="text-sm font-black text-gray-900">{lesson.time}</p>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d('today')}</p>
                                </div>
                                <Button size="sm" variant="outline" className="rounded-xl font-black hover:bg-primary-50 hover:text-primary-600 border-gray-100">
                                   <MessageSquare className="mr-2 h-4 w-4" />
                                   {locale === 'fr' ? 'Chat' : 'دردشة'}
                                </Button>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 </div>
               )) : (
                 <div className="p-10 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                    <CalendarIcon className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                    <p className="font-black text-gray-400">{d('noUpcoming')}</p>
                 </div>
               )}
            </div>
          </section>

          {/* Recent Requests Section */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center"><Inbox className="h-4 w-4 text-amber-600" /></div>
                {d('incomingRequests')}
              </h2>
              <Link href="/teacher/requests" className="group flex items-center gap-1 text-sm font-black text-primary-600 hover:underline">
                 {c('viewAll')}
                 <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", locale === 'ar' && "rotate-180 group-hover:-translate-x-1")} />
              </Link>
            </div>

            <div className="space-y-4">
               {requests.received?.filter((r: any) => r.status === 'PENDING').slice(0, 3).map((req: any) => (
                 <Card key={req.id} className="group overflow-hidden border-none bg-white shadow-lg shadow-gray-900/5 ring-1 ring-gray-100 transition-all hover:ring-primary-100">
                    <CardContent className="p-6">
                       <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between text-right">
                          <div className="flex items-center gap-4 flex-row-reverse sm:flex-row">
                             <div className="h-14 w-14 rounded-[1.25rem] bg-gray-50 flex items-center justify-center font-black text-primary-600 group-hover:scale-110 transition-transform shadow-inner">
                                {req.student?.fullName?.charAt(0)}
                             </div>
                             <div className="text-right sm:text-left">
                                <h4 className="text-lg font-black text-gray-900 leading-tight">{req.student?.fullName}</h4>
                                <div className="mt-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter justify-end sm:justify-start">
                                   <BookOpen className="h-3 w-3" />
                                   {subjectName(req.subject, locale)}
                                </div>
                             </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                             <Button size="sm" className="h-10 rounded-xl px-6 font-black shadow-lg shadow-primary-200 transition-all active:scale-95" onClick={() => handleAction(req.id, 'accept')}>
                                <Check className="mr-1.5 h-4 w-4" /> {d('accept')}
                             </Button>
                             <Button size="sm" variant="outline" className="h-10 rounded-xl px-6 font-black border-2 transition-all active:scale-95" onClick={() => setRejecting((r) => ({ ...r, [req.id]: true }))}>
                                <X className="mr-1.5 h-4 w-4" /> {d('reject')}
                             </Button>
                          </div>
                       </div>
                       <p className={cn("mt-4 rounded-2xl bg-gray-50 p-4 text-sm font-medium text-gray-600 leading-relaxed italic border-primary-100 text-right", locale === 'fr' ? "border-l-4" : "border-r-4")}>
                          "{req.message}"
                       </p>
                    </CardContent>
                 </Card>
               ))}

               {requests.received?.filter((r: any) => r.status === 'PENDING').length === 0 && (
                 <div className="p-16 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="font-black text-gray-400">{d('noIncomingRequests')}</p>
                    <Link href={`/teachers/${user?.userId}`} className="mt-6 inline-block">
                       <Button variant="outline" className="rounded-xl font-black">
                          {d('viewProfile')}
                       </Button>
                    </Link>
                 </div>
               )}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-10">
           {/* Interactive Calendar (Compact Mock) */}
           <Card className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100">
              <CardContent className="p-8">
                 <div className="mb-6 flex items-center justify-between text-right">
                    <h3 className="text-lg font-black tracking-tight text-gray-900">{d('calendar')}</h3>
                    <div className="flex gap-1 flex-row-reverse">
                       <button className="h-8 w-8 rounded-lg border flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                       <button className="h-8 w-8 rounded-lg border flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight className={cn("h-4 w-4", locale === 'fr' ? "rotate-180" : "rotate-0")} /></button>
                    </div>
                 </div>
                 <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-gray-400 mb-4">
                    {locale === 'fr' ? ['L','M','M','J','V','S','D'].map(d => <span key={d}>{d}</span>) : ['ح','ن','ث','ر','خ','ج','س'].map(d => <span key={d}>{d}</span>)}
                 </div>
                 <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 31 }, (_, i) => (
                       <button 
                         key={i} 
                         className={cn(
                           "h-8 w-8 rounded-xl text-xs font-black transition-all",
                           i + 1 === new Date().getDate() ? "bg-primary-600 text-white shadow-lg shadow-primary-200" : "text-gray-600 hover:bg-gray-50",
                           [3, 8, 15, 22].includes(i + 1) && i + 1 !== new Date().getDate() ? "relative before:absolute before:bottom-1 before:left-1/2 before:h-1 before:w-1 before:-translate-x-1/2 before:rounded-full before:bg-primary-500" : ""
                         )}
                       >
                          {i + 1}
                       </button>
                    ))}
                 </div>
                 <Link href="/teacher/settings" className="mt-8 block">
                    <Button variant="outline" className="w-full rounded-2xl border-gray-100 font-black py-6">
                       {locale === 'fr' ? 'Gérer les créneaux' : 'تعديل الجدول'}
                    </Button>
                 </Link>
              </CardContent>
           </Card>

           {/* Quick Actions Widget */}
           <section>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-right pr-4">{d('quickActions')}</h3>
              <div className="grid gap-4">
                 <Link href="/teacher/chat">
                    <div className="group flex items-center justify-between rounded-3xl bg-white p-5 shadow-lg shadow-gray-900/5 ring-1 ring-gray-100 transition-all hover:ring-primary-100 hover:shadow-xl text-right flex-row-reverse">
                       <div className="flex items-center gap-4 flex-row-reverse">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                             <MessageSquare className="h-6 w-6" />
                          </div>
                          <span className="font-black text-gray-900">{d('messages')}</span>
                       </div>
                       <Badge className="bg-blue-100 text-blue-700 border-none font-black px-3">3</Badge>
                    </div>
                 </Link>
                 <Link href="/teacher/requests">
                    <div className="group flex items-center justify-between rounded-3xl bg-white p-5 shadow-lg shadow-gray-900/5 ring-1 ring-gray-100 transition-all hover:ring-primary-100 hover:shadow-xl text-right flex-row-reverse">
                       <div className="flex items-center gap-4 flex-row-reverse">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                             <Bell className="h-6 w-6" />
                          </div>
                          <span className="font-black text-gray-900">{locale === 'fr' ? 'Notifications' : 'تنبيهات'}</span>
                       </div>
                       <Badge className="bg-amber-100 text-amber-700 border-none font-black px-3">5</Badge>
                    </div>
                 </Link>
                 <Link href="/teacher/profile">
                    <div className="group flex items-center justify-between rounded-3xl bg-white p-5 shadow-lg shadow-gray-900/5 ring-1 ring-gray-100 transition-all hover:ring-primary-100 hover:shadow-xl text-right flex-row-reverse">
                       <div className="flex items-center gap-4 flex-row-reverse">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                             <Award className="h-6 w-6" />
                          </div>
                          <span className="font-black text-gray-900">{locale === 'fr' ? 'Avis récents' : 'تقييمات جديدة'}</span>
                       </div>
                       <Badge className="bg-indigo-100 text-indigo-700 border-none font-black px-3">2</Badge>
                    </div>
                 </Link>
              </div>
           </section>

           {/* Profile Performance Mini-Card */}
           <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-gray-800 to-black p-1 shadow-2xl shadow-gray-900/20 text-white">
              <CardContent className="p-8">
                 <div className="mb-6 flex items-center justify-between text-right flex-row-reverse">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                       <Zap className="h-6 w-6 text-yellow-400" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400">+{earnings.growth}% {d('growth')}</span>
                 </div>
                 <h3 className="text-xl font-black tracking-tight text-right">{d('performance')}</h3>
                 <p className="mt-2 text-sm font-medium text-gray-400 leading-relaxed text-right">
                    {locale === 'fr' 
                      ? 'Votre visibilité est en hausse. Complétez votre bio pour captiver plus d\'élèves.' 
                      : 'نسبة ظهورك في ارتفاع. أكمل سيرتك الذاتية لجذب المزيد من الطلاب.'}
                 </p>
                 <Link href="/teacher/profile" className="mt-6 block">
                    <Button variant="outline" className="w-full rounded-2xl border-white/10 text-white hover:bg-white/10 font-black py-6">
                       {d('completeProfile')}
                    </Button>
                 </Link>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton({ locale }: { locale: string }) {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
       <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
             <Skeleton className="h-10 w-48 rounded-xl" />
             <Skeleton className="h-4 w-64 rounded-xl" />
          </div>
          <div className="flex gap-3">
             <Skeleton className="h-11 w-32 rounded-xl" />
             <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
       </div>
       <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)}
       </div>
       <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
             <Skeleton className="h-64 rounded-[2.5rem]" />
             <Skeleton className="h-96 rounded-[2.5rem]" />
          </div>
          <div className="space-y-10">
             <Skeleton className="h-80 rounded-[2.5rem]" />
             <Skeleton className="h-64 rounded-[2.5rem]" />
          </div>
       </div>
    </div>
  );
}
