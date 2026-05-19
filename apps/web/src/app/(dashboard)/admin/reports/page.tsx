'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, Button } from '@oustadi/ui';

export default function AdminReports() {
  const t = useTranslations('admin');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchReports() {
    const res = await apiRequest<any[]>('/admin/reports');
    if (res.success && Array.isArray(res.data)) setReports(res.data);
    setLoading(false);
  }

  useEffect(() => { fetchReports(); }, []);

  async function resolveReport(id: string) {
    await apiRequest(`/admin/reports/${id}/resolve`, { method: 'PATCH' });
    await fetchReports();
  }

  if (loading) return <p>{t('loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('reportsTitle')}</h1>
      <div className="mt-6 space-y-3">
        {reports.map((report: any) => (
          <Card key={report.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">{report.reason}</p>
                <p className="text-sm text-gray-500">{report.description}</p>
              </div>
              {report.status === 'OPEN' && (
                <Button size="sm" onClick={() => resolveReport(report.id)}>{t('resolve')}</Button>
              )}
            </CardContent>
          </Card>
        ))}
        {reports.length === 0 && <p className="text-center py-8 text-sm text-gray-400">{t('noReports')}</p>}
      </div>
    </div>
  );
}
