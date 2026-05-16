'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Card, CardContent } from '@oustadi/ui';

interface DashboardData {
  users: number;
  teachers: number;
  students: number;
  requests: number;
  pendingDocuments: number;
  pendingReports: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<DashboardData>('/admin/dashboard').then((res) => {
      if (res.success && res.data) setData(res.data as DashboardData);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>جار التحميل...</p>;
  if (!data) return <p>خطأ في تحميل البيانات</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {[
          { label: 'إجمالي المستخدمين', value: data.users, color: 'text-primary-600' },
          { label: 'الأساتذة', value: data.teachers, color: 'text-emerald-600' },
          { label: 'الطلاب', value: data.students, color: 'text-blue-600' },
          { label: 'الطلبات', value: data.requests, color: 'text-purple-600' },
          { label: 'الوثائق غير الموثقة', value: data.pendingDocuments, color: 'text-yellow-600' },
          { label: 'البلاغات المفتوحة', value: data.pendingReports, color: 'text-red-600' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-6">
              <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              <p className="mt-1 text-sm text-gray-500">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
