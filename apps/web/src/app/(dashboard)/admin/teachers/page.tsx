'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { Button, Card, CardContent } from '@oustadi/ui';
import { BadgeCheck, Badge as BadgeIcon } from 'lucide-react';

export default function AdminTeachersPage() {
  const t = useTranslations('admin');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTeachers() {
    setLoading(true);
    try {
      const res = await apiRequest<any[]>('/admin/teachers');
      if (res.success && res.data) setTeachers(res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { fetchTeachers(); }, []);

  async function toggleVerify(id: string) {
    try {
      const res = await apiRequest(`/admin/teachers/${id}/verify`, { method: 'PATCH' });
      if (res.success) setTeachers((prev) => prev.map((t) => t.id === id ? { ...t, isVerified: !t.isVerified } : t));
    } catch {}
  }

  async function toggleOfficial(id: string) {
    try {
      const res = await apiRequest(`/admin/teachers/${id}/official`, { method: 'PATCH' });
      if (res.success) setTeachers((prev) => prev.map((t) => t.id === id ? { ...t, isOfficial: !t.isOfficial } : t));
    } catch {}
  }

  if (loading) return <p>{t('loading')}</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t('manageTeachers')}</h1>
      <div className="space-y-3">
        {teachers.map((teacher) => (
          <Card key={teacher.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">{teacher.user?.fullName}</p>
                <p className="text-xs text-gray-500">{teacher.user?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={teacher.isVerified ? 'primary' : 'outline'}
                  onClick={() => toggleVerify(teacher.id)}
                >
                  <BadgeCheck className="ml-1 h-4 w-4" /> {teacher.isVerified ? t('verified') : t('notVerified')}
                </Button>
                <Button
                  size="sm"
                  variant={teacher.isOfficial ? 'primary' : 'outline'}
                  onClick={() => toggleOfficial(teacher.id)}
                >
                  <BadgeIcon className="ml-1 h-4 w-4" /> {teacher.isOfficial ? t('official') : t('notOfficial')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {teachers.length === 0 && <p className="text-sm text-gray-400">{t('noTeachers')}</p>}
      </div>
    </div>
  );
}
