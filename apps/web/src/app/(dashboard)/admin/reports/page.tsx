'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, Button } from '@oustadi/ui';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ reports: any[] }>('/admin/reports').then((res) => {
      if (res.success && res.data) setReports((res.data as any).reports || []);
      setLoading(false);
    });
  }, []);

  async function resolveReport(id: string) {
    await apiRequest(`/admin/reports/${id}/resolve`, { method: 'PATCH' });
    const res = await apiRequest<{ reports: any[] }>('/admin/reports');
    if (res.success && res.data) setReports((res.data as any).reports || []);
  }

  if (loading) return <p>جار التحميل...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">البلاغات</h1>
      <div className="mt-6 space-y-3">
        {reports.map((report: any) => (
          <Card key={report.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">{report.reason}</p>
                <p className="text-sm text-gray-500">{report.description}</p>
              </div>
              {report.status === 'OPEN' && (
                <Button size="sm" onClick={() => resolveReport(report.id)}>حل</Button>
              )}
            </CardContent>
          </Card>
        ))}
        {reports.length === 0 && <p className="text-center py-8 text-sm text-gray-400">لا توجد بلاغات</p>}
      </div>
    </div>
  );
}
