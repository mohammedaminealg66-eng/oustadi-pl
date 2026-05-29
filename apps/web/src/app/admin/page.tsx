'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { Card, CardContent } from '@oustadi/ui';
import { Users, GraduationCap, BookOpen, FileText, AlertTriangle, BarChart3 } from 'lucide-react';

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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<DashboardData>('/admin/dashboard').then((res) => {
      if (res.success && res.data) setData(res.data as DashboardData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  if (!data) return <p className="text-gray-500">{t('errorLoading')}</p>;

  const stats = [
    { label: t('totalUsers'), value: data.users, icon: Users, color: 'bg-primary-50 text-primary-600', href: '/admin/users' },
    { label: t('teachers'), value: data.teachers, icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600', href: '/admin/teachers' },
    { label: t('students'), value: data.students, icon: BookOpen, color: 'bg-blue-50 text-blue-600', href: '/admin/users' },
    { label: t('requests'), value: data.requests, icon: BarChart3, color: 'bg-purple-50 text-purple-600', href: '/admin' },
    { label: t('pendingDocuments'), value: data.pendingDocuments, icon: FileText, color: 'bg-amber-50 text-amber-600', href: '/admin/documents' },
    { label: t('openReports'), value: data.pendingReports, icon: AlertTriangle, color: 'bg-red-50 text-red-600', href: '/admin/reports' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('dashboardTitle')}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="transition hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-sm text-gray-500">{item.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
