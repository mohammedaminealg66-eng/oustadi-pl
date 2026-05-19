'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { subjectName } from '@/lib/subject';
import { Card, CardContent } from '@oustadi/ui';

export default function AdminSubjects() {
  const t = useTranslations('admin');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  useEffect(() => {
    apiRequest('/subjects').then((res) => {
      if (res.success && res.data) setSubjects(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>{t('loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('subjectsTitle')}</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subj: any) => (
          <Card key={subj.id}>
            <CardContent className="p-4">
              <p className="font-medium text-gray-900">{subjectName(subj, locale)}</p>
              <p className="text-xs text-gray-400">{locale === 'fr' ? subj.nameAr : subj.nameFr}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
