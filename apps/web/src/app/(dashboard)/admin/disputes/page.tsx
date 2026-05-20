'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, Button } from '@oustadi/ui';
import { AlertTriangle, Eye, Calendar, Clock } from 'lucide-react';

export default function AdminDisputes() {
  const t = useTranslations('admin');
  const c = useTranslations('common');
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDisputes() {
    const res = await apiRequest<any[]>('/admin/disputes');
    if (res.success && Array.isArray(res.data)) setDisputes(res.data);
    setLoading(false);
  }

  useEffect(() => { fetchDisputes(); }, []);

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      open: 'bg-red-100 text-red-700',
      reviewing: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      rejected: 'bg-gray-100 text-gray-500',
    };
    const labels: Record<string, string> = {
      open: t('disputeOpen'),
      reviewing: t('disputeReviewing'),
      resolved: t('disputeResolved'),
      rejected: t('disputeRejected'),
    };
    return <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] || ''}`}>{labels[status] || status}</span>;
  }

  if (loading) return <p className="text-gray-500">{c('loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('disputesTitle')}</h1>
      <p className="mt-1 text-sm text-gray-500">{t('disputesDesc')}</p>
      <div className="mt-6 space-y-3">
        {disputes.map((dispute: any) => (
          <Card key={dispute.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="font-medium text-gray-900">
                      {dispute.teacher?.fullName} <span className="text-gray-400">↔</span> {dispute.student?.fullName}
                    </p>
                  </div>
                  {dispute.booking?.subject && (
                    <p className="mt-0.5 text-xs text-primary-600">{dispute.booking.subject.nameAr || dispute.booking.subject.nameFr}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-600">{dispute.reason}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-400">
                    {dispute.booking?.bookedDate && (
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(dispute.booking.bookedDate).toLocaleDateString('ar-MA')}</span>
                    )}
                    {dispute.booking?.bookedTime && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {dispute.booking.bookedTime}</span>
                    )}
                    <span>{new Date(dispute.createdAt).toLocaleDateString('ar-MA')}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {statusBadge(dispute.status)}
                  <Link href={`/admin/disputes/${dispute.id}`}>
                    <Button size="sm" variant="outline"><Eye className="ml-1 h-3 w-3" /> {t('view')}</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {disputes.length === 0 && <p className="py-8 text-center text-sm text-gray-400">{t('noDisputes')}</p>}
      </div>
    </div>
  );
}
