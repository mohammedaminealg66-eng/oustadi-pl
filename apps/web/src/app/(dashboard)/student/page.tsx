'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { subjectName } from '@/lib/subject';
import { Card, CardContent, Button } from '@oustadi/ui';

export default function StudentDashboard() {
  const [requests, setRequests] = useState<any>({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const locale = useLocale();
  const d = useTranslations('dashboard');
  const c = useTranslations('common');

  useEffect(() => {
    apiRequest('/requests').then((res) => {
      if (res.success && res.data) setRequests(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-gray-500">{c('loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{d('studentDashboard')}</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-4">
        <Card><CardContent className="p-6"><p className="text-2xl font-bold text-primary-600">{requests.sent?.length}</p><p className="text-sm text-gray-500">{d('sentRequests')}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-2xl font-bold text-emerald-600">{requests.sent?.filter((r: any) => r.status === 'ACCEPTED').length}</p><p className="text-sm text-gray-500">{d('accepted')}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-2xl font-bold text-yellow-600">{requests.sent?.filter((r: any) => r.status === 'PENDING').length}</p><p className="text-sm text-gray-500">{d('pending')}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-2xl font-bold text-red-600">{requests.sent?.filter((r: any) => r.status === 'REJECTED').length}</p><p className="text-sm text-gray-500">{d('rejected')}</p></CardContent></Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">{d('myRequests')}</h2>
        <div className="mt-4 space-y-3">
          {requests.sent?.map((req: any) => (
            <Card key={req.id}>
              <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{req.teacher?.fullName}</p>
                      <p className="text-sm text-gray-500">{subjectName(req.subject, locale)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        req.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{req.status === 'ACCEPTED' ? d('accepted') : req.status === 'REJECTED' ? d('rejected') : d('pending')}</span>
                      {req.status === 'ACCEPTED' && (
                        <Link href="/chat"><Button size="sm" variant="outline">{d('message')}</Button></Link>
                      )}
                    </div>
                  </div>
                {req.status === 'REJECTED' && req.teacherNotes && (
                  <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg p-2">{d('rejectionReason')} {req.teacherNotes}</p>
                )}
              </CardContent>
            </Card>
          ))}
          {requests.sent?.length === 0 && <p className="text-sm text-gray-400 text-center py-8">{d('noRequests')}</p>}
        </div>
      </div>
    </div>
  );
}
