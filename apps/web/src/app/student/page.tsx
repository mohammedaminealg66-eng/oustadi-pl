'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { subjectName } from '@/lib/subject';
import { getAvatarUrl } from '@/lib/asset';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, Button, Badge, Skeleton, cn } from '@oustadi/ui';
import {
  Send, CheckCircle, Clock, XCircle, MessageCircle,
  Search, Heart, Settings, Sparkles, ChevronLeft,
  Calendar, BookOpen, GraduationCap, Flame, Target,
  TrendingUp, ArrowRight, Star, Plus, MoreHorizontal,
  ChevronRight, Play, History, Users
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any>({ sent: [], received: [] });
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();
  const d = useTranslations('dashboard');
  const c = useTranslations('common');
  const t = useTranslations('teacher');

  useEffect(() => {
    async function fetchData() {
      const [reqRes, favRes] = await Promise.all([
        apiRequest('/requests'),
        apiRequest('/students/favorites')
      ]);
      
      if (reqRes.success && reqRes.data) setRequests(reqRes.data);
      if (favRes.success && favRes.data) setFavorites(favRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Mock data for student-specific features
  const streak = 5;
  const weeklyGoal = { current: 3.5, total: 5 };
  const hoursLearned = 24;
  const lessonsLearned = 12;

  const nextLesson = useMemo(() => {
    return (requests.sent || [])
      .filter((r: any) => r.status === 'ACCEPTED')
      .sort((a: any, b: any) => new Date(a.bookedDate).getTime() - new Date(b.bookedDate).getTime())[0];
  }, [requests.sent]);

  const recentActivity = useMemo(() => {
    // Combine some events for the timeline
    return [
      { id: 1, type: 'lesson', title: 'Cours avec Prof. Leila', date: 'il y a 2h', icon: CheckCircle, color: 'text-emerald-500' },
      { id: 2, type: 'favorite', title: 'Vous avez ajouté Prof. Ahmed aux favoris', date: 'Hier', icon: Heart, color: 'text-red-500' },
      { id: 3, type: 'message', title: 'Nouveau message de Prof. Youssef', date: 'Hier', icon: MessageSquare, color: 'text-blue-500' },
    ];
  }, []);

  if (loading) return <DashboardSkeleton locale={locale} />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 lg:text-4xl">
            {locale === 'fr' ? 'Mon Espace Apprentissage' : 'مساحة التعلم الخاصة بي'}
          </h1>
          <p className="mt-1 text-gray-500 font-medium">
            {locale === 'fr' 
              ? `Heureux de vous revoir, ${user?.fullName?.split(' ')[0]} !` 
              : `سعداء برؤيتك مجدداً، ${user?.fullName?.split(' ')[0]}!`}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/teachers">
              <Button className="rounded-xl font-black shadow-lg shadow-primary-200 px-6">
                 <Search className="mr-2 h-4 w-4" />
                 {t('findTeacher')}
              </Button>
           </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content: Hero & Engagement */}
        <div className="lg:col-span-2 space-y-8">
           {/* Priority Hero Card: Next Lesson */}
           {nextLesson ? (
             <Card className="group relative overflow-hidden border-none bg-primary-600 text-white shadow-2xl shadow-primary-900/20 transition-all hover:scale-[1.01]">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary-400/20 blur-2xl" />
                
                <CardContent className="relative z-10 p-8 lg:p-10">
                   <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-4">
                         <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                            <Clock className="h-3.5 w-3.5" />
                            {d('nextLesson')}
                         </div>
                         <h2 className="text-3xl font-black tracking-tight lg:text-4xl">
                            {subjectName(nextLesson.subject, locale)}
                         </h2>
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white/30">
                               {nextLesson.teacher?.avatarKey 
                                 ? <img src={getAvatarUrl(nextLesson.teacher.avatarKey)} alt="" className="h-full w-full object-cover" />
                                 : <div className="flex h-full w-full items-center justify-center bg-white/10 font-black">{nextLesson.teacher?.fullName?.charAt(0)}</div>
                               }
                            </div>
                            <span className="text-lg font-bold opacity-90">{nextLesson.teacher?.fullName}</span>
                         </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 min-w-[180px]">
                         <p className="text-sm font-black uppercase tracking-[0.2em] opacity-70">{d('today')}</p>
                         <p className="text-4xl font-black">{nextLesson.bookedTime}</p>
                         <Button variant="secondary" className="w-full rounded-xl font-black shadow-lg">
                            <Play className="mr-2 h-4 w-4 fill-current" />
                            {locale === 'fr' ? 'Rejoindre' : 'انضمام'}
                         </Button>
                      </div>
                   </div>
                </CardContent>
             </Card>
           ) : (
             <Card className="border-none bg-gradient-to-br from-indigo-500 to-primary-600 text-white shadow-xl shadow-primary-900/10">
                <CardContent className="p-8 lg:p-10 flex flex-col items-center text-center gap-6">
                   <div className="h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                      <GraduationCap className="h-10 w-10 text-white" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black tracking-tight">{locale === 'fr' ? 'Prêt à apprendre ?' : 'جاهز للتعلم؟'}</h2>
                      <p className="mt-2 text-primary-50 opacity-80 font-medium">{locale === 'fr' ? 'Réservez votre prochain cours avec les meilleurs professeurs.' : 'احجز درسك القادم مع أفضل الأساتذة.'}</p>
                   </div>
                   <Link href="/teachers">
                      <Button variant="secondary" className="rounded-xl px-8 font-black shadow-xl">
                         {t('browseTeachers')}
                      </Button>
                   </Link>
                </CardContent>
             </Card>
           )}

           {/* Stats & Engagement Grid */}
           <div className="grid gap-6 sm:grid-cols-3">
              {/* Streak Widget */}
              <Card className="border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100">
                 <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                       <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900 leading-none">{streak}</p>
                    <p className="mt-1 text-xs font-black text-gray-400 uppercase tracking-widest">{d('streak')} ({d('days')})</p>
                 </CardContent>
              </Card>

              {/* Learning Progress Widget */}
              <Card className="sm:col-span-2 border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">{d('weeklyGoal')}</h3>
                       <Badge className="bg-primary-50 text-primary-600 border-none font-black">{weeklyGoal.current}/{weeklyGoal.total} {d('hours')}</Badge>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                       <div 
                         className="h-full rounded-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000" 
                         style={{ width: `${(weeklyGoal.current / weeklyGoal.total) * 100}%` }} 
                       />
                    </div>
                    <p className="mt-4 text-xs font-bold text-gray-500">{d('learningStreakDesc')}</p>
                 </CardContent>
              </Card>
           </div>

           {/* Favorites Section */}
           <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center"><Heart className="h-4 w-4 text-red-500 fill-red-500" /></div>
                  {d('favoriteTeachers')}
                </h2>
                <Link href="/student/favorites" className="group flex items-center gap-1 text-sm font-black text-primary-600 hover:underline">
                   {c('viewAll')}
                   <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", locale === 'ar' && "rotate-180 group-hover:-translate-x-1")} />
                </Link>
              </div>

              {favorites.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                   {favorites.map((fav: any) => (
                     <Link key={fav.id} href={`/teachers/${fav.teacherId}`} className="shrink-0 group">
                        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-[2.5rem] shadow-lg shadow-gray-900/5 ring-1 ring-gray-100 transition-all hover:ring-primary-200 hover:shadow-xl w-36">
                           <div className="relative">
                              <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-white shadow-md">
                                 {fav.teacher?.user?.avatarKey 
                                   ? <img src={getAvatarUrl(fav.teacher.user.avatarKey)} alt="" className="h-full w-full object-cover" />
                                   : <div className="flex h-full w-full items-center justify-center bg-primary-50 font-black text-primary-600">{fav.teacher?.user?.fullName?.charAt(0)}</div>
                                 }
                              </div>
                              {fav.teacher?.user?.isOnline && (
                                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm" />
                              )}
                           </div>
                           <p className="text-sm font-black text-gray-900 truncate w-full text-center">{fav.teacher?.user?.fullName?.split(' ')[0]}</p>
                        </div>
                     </Link>
                   ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                   <Heart className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                   <p className="font-black text-gray-400">{d('noFavorites')}</p>
                </div>
              )}
           </section>
        </div>

        {/* Sidebar Sidebar: Activity & Recommended */}
        <div className="space-y-10">
           {/* Summary Stats Card */}
           <div className="grid grid-cols-2 gap-4">
              <Card className="border-none bg-white shadow-lg shadow-gray-900/5 ring-1 ring-gray-100">
                 <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
                       <BookOpen className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black text-gray-900">{lessonsLearned}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d('lessonsLearned')}</p>
                 </CardContent>
              </Card>
              <Card className="border-none bg-white shadow-lg shadow-gray-900/5 ring-1 ring-gray-100">
                 <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
                       <Clock className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black text-gray-900">{hoursLearned}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d('hoursLearned')}</p>
                 </CardContent>
              </Card>
           </div>

           {/* Recent Activity Timeline */}
           <section>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-4">{d('recentActivity')}</h3>
              <div className="space-y-6 ml-4 border-l-2 border-gray-100 pl-8 relative">
                 {recentActivity.map((activity) => (
                   <div key={activity.id} className="relative">
                      <div className={cn("absolute -left-[41px] top-0 h-8 w-8 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center", activity.color)}>
                         <activity.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-sm font-black text-gray-900">{activity.title}</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activity.date}</p>
                      </div>
                   </div>
                 ))}
                 <Link href="/student/requests" className="inline-block pt-2">
                    <span className="text-xs font-black text-primary-600 hover:underline">{c('viewAll')}</span>
                 </Link>
              </div>
           </section>

           {/* Recommended Section (Carousel Mock) */}
           <section>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-4">{d('recommendedTeachers')}</h3>
              </div>
              <Card className="border-none bg-gradient-to-br from-gray-50 to-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100 group">
                 <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                       <div className="h-16 w-16 shrink-0 rounded-2xl bg-gray-100 overflow-hidden group-hover:scale-105 transition-transform">
                          <div className="flex h-full w-full items-center justify-center bg-primary-50 font-black text-primary-600 text-2xl">L</div>
                       </div>
                       <div className="min-w-0">
                          <p className="font-black text-gray-900 truncate">Prof. Leila B.</p>
                          <div className="flex items-center gap-1.5 mt-1">
                             <div className="flex text-amber-400"><Star className="h-3 w-3 fill-current" /></div>
                             <span className="text-[10px] font-black text-gray-400">4.9 (124 avis)</span>
                          </div>
                          <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-2">{locale === 'fr' ? 'Anglais / TOEFL' : 'الإنجليزية / طوفل'}</p>
                       </div>
                    </div>
                    <Button variant="outline" className="w-full mt-6 rounded-xl font-black group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all">
                       {locale === 'fr' ? 'Réserver' : 'حجز'}
                    </Button>
                 </CardContent>
              </Card>
           </section>

           {/* Support Mini-Card */}
           <Card className="rounded-[2.5rem] border-none bg-gray-900 text-white shadow-2xl shadow-gray-900/20">
              <CardContent className="p-8">
                 <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                       <Plus className="h-6 w-6 text-primary-400" />
                    </div>
                 </div>
                 <h3 className="text-xl font-black tracking-tight">{locale === 'fr' ? 'Nouvelle Matière ?' : 'مادة جديدة؟'}</h3>
                 <p className="mt-2 text-sm font-medium text-gray-400 leading-relaxed">
                    {locale === 'fr' 
                      ? 'Explorez de nouveaux horizons avec nos professeurs certifiés.' 
                      : 'استكشف آفاقاً جديدة مع أساتذتنا المعتمدين.'}
                 </p>
                 <Link href="/teachers" className="mt-6 block">
                    <Button variant="outline" className="w-full rounded-2xl border-white/10 text-white hover:bg-white/10 font-black py-6">
                       {t('browseTeachers')}
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
             <Skeleton className="h-10 w-64 rounded-xl" />
             <Skeleton className="h-4 w-48 rounded-xl" />
          </div>
          <Skeleton className="h-11 w-36 rounded-xl" />
       </div>
       <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
             <Skeleton className="h-64 rounded-[2.5rem]" />
             <div className="grid gap-6 sm:grid-cols-3">
                <Skeleton className="h-32 rounded-[2rem]" />
                <Skeleton className="h-32 col-span-2 rounded-[2rem]" />
             </div>
             <div className="space-y-4">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <div className="flex gap-4 overflow-hidden">
                   {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-32 shrink-0 rounded-[2.5rem]" />)}
                </div>
             </div>
          </div>
          <div className="space-y-10">
             <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-28 rounded-3xl" />
                <Skeleton className="h-28 rounded-3xl" />
             </div>
             <Skeleton className="h-64 rounded-[2.5rem]" />
             <Skeleton className="h-48 rounded-[2.5rem]" />
          </div>
       </div>
    </div>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
