'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { 
  LayoutDashboard, MessageSquare, Settings, Users, 
  FileText, Menu, X, ChevronLeft, ChevronRight, 
  BookOpen, Calendar, HelpCircle, LifeBuoy, LogOut,
  Bell, Search, User, AlertTriangle, ShieldCheck,
  BarChart3, Activity, Zap
} from 'lucide-react';
import { Button, cn } from '@oustadi/ui';
import { getAvatarUrl } from '@/lib/asset';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') router.replace('/' + user.role.toLowerCase());
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
    </div>
  );

  const navGroups = [
    {
      title: t('dashboard.overview') || (locale === 'fr' ? 'Aperçu' : 'نظرة عامة'),
      items: [
        { href: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard },
        { href: '/admin/chat', label: t('dashboard.messages'), icon: MessageSquare, badge: 12 },
      ]
    },
    {
      title: t('admin.users') || (locale === 'fr' ? 'Utilisateurs' : 'المستخدمون'),
      items: [
        { href: '/admin/users', label: t('admin.usersTitle') || (locale === 'fr' ? 'Gestion Users' : 'إدارة المستخدمين'), icon: Users },
        { href: '/admin/teachers', label: t('admin.manageTeachers'), icon: ShieldCheck },
        { href: '/admin/subjects', label: t('admin.subjects'), icon: BookOpen },
      ]
    },
    {
      title: t('dashboard.support') || (locale === 'fr' ? 'Opérations' : 'العمليات'),
      items: [
        { href: '/admin/documents', label: t('admin.documents'), icon: FileText, badge: 5 },
        { href: '/admin/reports', label: t('admin.reports'), icon: AlertTriangle, badge: 3 },
        { href: '/admin/disputes', label: t('admin.disputes'), icon: Zap },
      ]
    },
    {
      title: t('dashboard.account') || (locale === 'fr' ? 'Système' : 'النظام'),
      items: [
        { href: '/admin/settings', label: t('dashboard.settings'), icon: Settings },
        { href: '/help', label: t('dashboard.help'), icon: HelpCircle },
      ]
    }
  ];

  const isActive = (href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(href));

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white transition-all duration-300 lg:static",
          isCompact ? "w-20" : "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-20 items-center justify-between px-6">
          <Link href="/" className={cn("flex items-center gap-3 transition-all", isCompact && "justify-center w-full")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-lg shadow-gray-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
            {!isCompact && <span className="text-xl font-black tracking-tighter text-gray-900">أستادي <span className="text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded ml-1 uppercase">Admin</span></span>}
          </Link>
          <button 
            onClick={() => setIsCompact(!isCompact)}
            className="hidden h-8 w-8 items-center justify-center rounded-lg border bg-gray-50 text-gray-400 hover:text-gray-900 lg:flex"
          >
            {isCompact ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4">
          <nav className="space-y-8">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-3">
                {!isCompact && (
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200",
                          active 
                            ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20" 
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                          isCompact && "justify-center px-0"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-gray-400 group-hover:text-gray-900")} />
                        {!isCompact && <span>{item.label}</span>}
                        {!isCompact && item.badge && (
                          <span className={cn(
                            "absolute right-4 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                            active ? "bg-white/20 text-white" : "bg-red-50 text-red-600"
                          )}>
                            {item.badge}
                          </span>
                        )}
                        {isCompact && active && (
                          <div className="absolute left-0 h-8 w-1.5 rounded-r-full bg-gray-900" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t p-4">
          {!isCompact ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-white shadow-sm">
                  {user.avatarKey ? (
                    <img src={getAvatarUrl(user.avatarKey)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-900 font-black text-white uppercase">
                      {user.fullName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-gray-900">{user.fullName}</p>
                  <p className="truncate text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Admin Root
                  </p>
                </div>
                <button 
                  onClick={() => logout()}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => logout()}
              className="flex w-full justify-center rounded-xl p-3 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b bg-white px-6 lg:px-10">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg border p-2 text-gray-500">
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-lg font-black tracking-tighter text-gray-900">أستادي Admin</span>
          </div>

          <div className="hidden flex-1 lg:flex max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={t('common.search') || (locale === 'fr' ? 'Actions, utilisateurs, docs...' : 'بحث...')}
                className="w-full rounded-2xl border-none bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-primary-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{t('dashboard.online')}</span>
             </div>
            <button className="relative rounded-xl border bg-white p-2.5 text-gray-500 hover:bg-gray-50 transition-all active:scale-95">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-600 ring-2 ring-white" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6 lg:p-10">
             {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t bg-white/80 p-2 backdrop-blur-xl lg:hidden">
        {[navGroups[0].items[0], navGroups[2].items[0], navGroups[2].items[1], navGroups[1].items[0]].map((item) => {
          const active = isActive(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all",
                active ? "text-primary-600" : "text-gray-400"
              )}
            >
              <item.icon className={cn("h-6 w-6", active && "animate-pulse")} />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
