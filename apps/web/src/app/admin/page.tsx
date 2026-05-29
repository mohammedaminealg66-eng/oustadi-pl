'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, Button, Badge, Skeleton, cn } from '@oustadi/ui';
import {
  Users, GraduationCap, BookOpen, FileText, AlertTriangle, 
  BarChart3, TrendingUp, TrendingDown, Activity, Zap, 
  ShieldCheck, Bell, ChevronRight, Plus, Search,
  ArrowUpRight, Clock, MoreHorizontal, Globe, Smartphone,
  Shield, Server, MessageSquare
} from 'lucide-react';

interface DashboardData {
  users: number;
  teachers: number;
  students: number;
  requests: number;
  pendingDocuments: number;
  pendingReports: number;
}

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const d = useTranslations('dashboard');
  const c = useTranslations('common');
  const locale = useLocale();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<DashboardData>('/admin/dashboard').then((res) => {
      if (res.success && res.data) setData(res.data as DashboardData);
      setLoading(false);
    });
  }, []);

  // Mock data for analytics
  const revenue = { total: 45800, growth: 15.4, data: [40, 45, 42, 50, 55, 48, 60] };
  const userGrowth = { total: 1250, growth: 12.1, data: [100, 110, 105, 120, 130, 125, 140] };
  const health = { latency: 45, uptime: 99.9, sockets: 842 };

  const systemAlerts = [
    { id: 1, type: 'critical', title: 'Nouveau litige ouvert', desc: 'Commande #842 par Student X', time: 'il y a 5 min' },
    { id: 2, type: 'warning', title: 'Vérification en attente', desc: '5 nouveaux certificats à réviser', time: 'il y a 1h' },
  ];

  const activityPulse = [
    { id: 1, user: 'Ahmed Y.', action: 'inscrit comme professeur', time: 'il y a 2 min' },
    { id: 2, user: 'Sara K.', action: 'a réservé un cours de Math', time: 'il y a 12 min' },
    { id: 3, user: 'Youssef B.', action: 'a complété son profil', time: 'il y a 25 min' },
  ];

  if (loading) return <AdminDashboardSkeleton locale={locale} />;
  if (!data) return <div className="p-10 text-center"><p className="text-gray-500 font-black">{t('errorLoading')}</p></div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 lg:text-4xl">
            {t('dashboardTitle')}
          </h1>
          <p className="mt-1 text-gray-500 font-medium">
             {locale === 'fr' ? 'Aperçu global de la plateforme Oustadi' : 'نظرة عامة شاملة على منصة أستادي'}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/admin/users">
              <Button variant="outline" className="rounded-xl border-gray-200 font-black">
                 <Users className="mr-2 h-4 w-4" />
                 {t('users')}
              </Button>
           </Link>
           <Button className="rounded-xl font-black shadow-lg shadow-primary-200">
              <Zap className="mr-2 h-4 w-4" />
              {locale === 'fr' ? 'Maintenance' : 'صيانة'}
           </Button>
        </div>
      </div>

      {/* KPI Center Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {/* Revenue KPI */}
        <Card className="group border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-none font-black">+{revenue.growth}%</Badge>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{d('totalRevenue')}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <h3 className="text-3xl font-black text-gray-900">{revenue.total.toLocaleString()}</h3>
              <span className="text-xs font-bold text-gray-400">DH</span>
            </div>
            <div className="mt-4 flex items-end gap-1 h-10">
               {revenue.data.map((v, i) => (
                 <div key={i} className="flex-1 bg-emerald-100 rounded-t-sm transition-all group-hover:bg-emerald-500" style={{ height: `${(v / 60) * 100}%` }} />
               ))}
            </div>
          </CardContent>
        </Card>

        {/* User Growth KPI */}
        <Card className="group border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-transform group-hover:scale-110">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-primary-100 text-primary-700 border-none font-black">+{userGrowth.growth}%</Badge>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{d('userGrowth')}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <h3 className="text-3xl font-black text-gray-900">{userGrowth.total.toLocaleString()}</h3>
              <span className="text-xs font-bold text-gray-400">{c('all')}</span>
            </div>
            <div className="mt-4 flex items-end gap-1 h-10">
               {userGrowth.data.map((v, i) => (
                 <div key={i} className="flex-1 bg-primary-100 rounded-t-sm transition-all group-hover:bg-primary-500" style={{ height: `${(v / 140) * 100}%` }} />
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Requests KPI */}
        <Card className="group border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
                <MessageSquare className="h-6 w-6" />
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-none font-black">Active</Badge>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('requests')}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <h3 className="text-3xl font-black text-gray-900">{data.requests}</h3>
            </div>
            <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d('last24h')}</p>
          </CardContent>
        </Card>

        {/* Platform Health KPI */}
        <Card className="group border-none bg-gray-900 text-white shadow-xl shadow-gray-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                <Activity className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">99.9% Uptime</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{d('platformHealth')}</p>
            <div className="mt-3 space-y-4">
               <div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase mb-1">
                     <span className="text-gray-500">{d('serverLatency')}</span>
                     <span className="text-white">{health.latency}ms</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                     <div className="h-full w-[15%] rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
               </div>
               <div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase mb-1">
                     <span className="text-gray-500">{d('socketConnections')}</span>
                     <span className="text-white">{health.sockets}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                     <div className="h-full w-[65%] rounded-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main Content: Queues & Activity */}
        <div className="lg:col-span-2 space-y-10">
           {/* Verification & Reports Queues */}
           <section className="grid gap-6 sm:grid-cols-2">
              <Card className="border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary-600" />
                          {d('verificationQueue')}
                       </h3>
                       <Badge className="bg-red-50 text-red-600 border-none font-black">{data.pendingDocuments}</Badge>
                    </div>
                    <div className="space-y-3">
                       {[1,2,3].map(i => (
                         <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center font-black text-xs text-primary-600 border border-gray-100">T</div>
                               <span className="text-xs font-black text-gray-900 truncate max-w-[120px]">Prof. Teacher {i}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-600 transition-colors" />
                         </div>
                       ))}
                    </div>
                    <Link href="/admin/documents" className="mt-6 block">
                       <Button variant="outline" className="w-full rounded-xl border-gray-100 font-black h-10 text-xs">
                          {c('viewAll')}
                       </Button>
                    </Link>
                 </CardContent>
              </Card>

              <Card className="border-none bg-white shadow-xl shadow-gray-900/5 ring-1 ring-gray-100">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                          {d('disputeCenter')}
                       </h3>
                       <Badge className="bg-amber-50 text-amber-600 border-none font-black">{data.pendingReports}</Badge>
                    </div>
                    <div className="space-y-3">
                       {[1,2].map(i => (
                         <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-amber-600 border border-gray-100"><Zap className="h-4 w-4" /></div>
                               <span className="text-xs font-black text-gray-900 truncate max-w-[120px]">Dispute #{840+i}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-amber-600 transition-colors" />
                         </div>
                       ))}
                    </div>
                    <Link href="/admin/disputes" className="mt-6 block">
                       <Button variant="outline" className="w-full rounded-xl border-gray-100 font-black h-10 text-xs">
                          {c('viewAll')}
                       </Button>
                    </Link>
                 </CardContent>
              </Card>
           </section>

           {/* System Pulse Feed */}
           <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gray-900 flex items-center justify-center"><Activity className="h-4 w-4 text-white" /></div>
                  {d('systemPulse')}
                </h2>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black flex items-center gap-2">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   {d('realTimeActivity')}
                </Badge>
              </div>

              <div className="space-y-4">
                 {activityPulse.map((activity) => (
                   <div key={activity.id} className="group flex items-center justify-between p-5 bg-white rounded-3xl ring-1 ring-gray-100 shadow-lg shadow-gray-900/5 hover:ring-primary-100 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                            <User className="h-5 w-5 text-gray-400" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-gray-900">
                               {activity.user} <span className="text-gray-400 font-medium">{activity.action}</span>
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{activity.time}</p>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-primary-600">
                         <MoreHorizontal className="h-5 w-5" />
                      </Button>
                   </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Sidebar Sidebar: Alerts & Shortcuts */}
        <div className="space-y-10">
           {/* Critical Alerts Widget */}
           <section>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">{d('systemAlerts')}</h3>
              <div className="space-y-4">
                 {systemAlerts.map((alert) => (
                   <div key={alert.id} className={cn(
                     "p-5 rounded-[2rem] border-none shadow-xl shadow-gray-900/5 ring-1 transition-all",
                     alert.type === 'critical' ? "bg-red-50 ring-red-100" : "bg-amber-50 ring-amber-100"
                   )}>
                      <div className="flex items-center justify-between mb-2">
                         <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shadow-sm", alert.type === 'critical' ? "bg-red-500 text-white" : "bg-amber-500 text-white")}>
                            <Bell className="h-4 w-4" />
                         </div>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{alert.time}</span>
                      </div>
                      <p className="text-sm font-black text-gray-900 leading-tight">{alert.title}</p>
                      <p className="text-xs font-medium text-gray-500 mt-1">{alert.desc}</p>
                   </div>
                 ))}
              </div>
           </section>

           {/* Moderation Shortcuts */}
           <section>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">{d('moderationShortcuts')}</h3>
              <div className="grid grid-cols-2 gap-3">
                 <Link href="/admin/users" className="group p-4 bg-white rounded-3xl ring-1 ring-gray-100 shadow-md hover:ring-primary-100 transition-all text-center">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                       <Shield className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-gray-900">Suspendre User</span>
                 </Link>
                 <Link href="/admin/subjects" className="group p-4 bg-white rounded-3xl ring-1 ring-gray-100 shadow-md hover:ring-primary-100 transition-all text-center">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                       <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-gray-900">Add Subject</span>
                 </Link>
              </div>
           </section>

           {/* System Resources Mini-Card */}
           <Card className="rounded-[2.5rem] border-none bg-gray-900 text-white shadow-2xl shadow-gray-900/20">
              <CardContent className="p-8">
                 <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                    <Server className="h-6 w-6 text-primary-400" />
                 </div>
                 <h3 className="text-xl font-black tracking-tight">System Resources</h3>
                 <p className="mt-2 text-sm font-medium text-gray-400 leading-relaxed">
                    Database, Cache and Storage are operating normally. 
                 </p>
                 <div className="mt-6 flex items-center gap-4">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500">S{i}</div>)}
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">3 Nodes Online</span>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardSkeleton({ locale }: { locale: string }) {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
       <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
             <Skeleton className="h-10 w-64 rounded-xl" />
             <Skeleton className="h-4 w-48 rounded-xl" />
          </div>
          <div className="flex gap-3">
             <Skeleton className="h-11 w-32 rounded-xl" />
             <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
       </div>
       <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-44 rounded-[2rem]" />)}
       </div>
       <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
             <div className="grid gap-6 sm:grid-cols-2">
                <Skeleton className="h-64 rounded-[2rem]" />
                <Skeleton className="h-64 rounded-[2rem]" />
             </div>
             <Skeleton className="h-96 rounded-[2rem]" />
          </div>
          <div className="space-y-10">
             <Skeleton className="h-64 rounded-[2rem]" />
             <Skeleton className="h-48 rounded-[2rem]" />
          </div>
       </div>
    </div>
  );
}
