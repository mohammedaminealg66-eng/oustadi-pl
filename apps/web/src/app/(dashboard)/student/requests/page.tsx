'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { subjectName } from '@/lib/subject';
import { Card, CardContent, Button } from '@oustadi/ui';
import { MessageSquare, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function StudentRequests() {
  const [requests, setRequests] = useState<any>({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const locale = useLocale();
  const d = useTranslations('dashboard');
  const c = useTranslations('common');

  const fetchRequests = async () => {
    const res = await apiRequest<{ sent: any[]; received: any[] }>('/requests');
    if (res.success && res.data) setRequests(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  async function handleAcceptProposal(requestId: string) {
    await apiRequest(`/requests/${requestId}/accept-proposal`, { method: 'PATCH' });
    await fetchRequests();
  }

  async function handleRejectProposal(requestId: string) {
    await apiRequest(`/requests/${requestId}/reject-proposal`, { method: 'PATCH' });
    await fetchRequests();
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      ACCEPTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
      CANCELLED: 'bg-gray-100 text-gray-500',
    };
    const labels: Record<string, string> = {
      PENDING: d('pending'), ACCEPTED: d('accepted'), REJECTED: d('rejected'),
      COMPLETED: d('completed'), CANCELLED: d('cancelled'),
    };
    return <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] || ''}`}>{labels[status] || status}</span>;
  }

  if (loading) return <p className="text-gray-500">{c('loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{d('myRequests')}</h1>
      <div className="mt-6 space-y-3">
        {requests.sent?.map((req: any) => (
          <Card key={req.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{req.teacher?.fullName}</p>
                  {req.subject && <p className="text-xs text-primary-600">{subjectName(req.subject, locale)}</p>}
                  {req.message && <p className="mt-1 text-sm text-gray-500">{req.message}</p>}
                  {(req.bookedDate || req.bookedTime || req.lessonType) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                      {req.bookedDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(req.bookedDate).toLocaleDateString('ar-MA')} {req.bookedTime}</span>}
                      {req.lessonType && <span className="rounded bg-gray-100 px-1.5 py-0.5">{req.lessonType === 'ONLINE' ? 'عن بعد' : 'حضوري'}</span>}
                    </div>
                  )}
                  {req.bookingStatus === 'waiting_student_confirmation' && req.proposedDate && req.proposedTime && (
                    <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
                      <p className="flex items-center gap-1 text-sm font-medium text-purple-700"><RefreshCw className="h-4 w-4" /> {d('proposedTime')}</p>
                      <p className="mt-1 text-sm text-purple-600">{new Date(req.proposedDate).toLocaleDateString('ar-MA')} {req.proposedTime}</p>
                    </div>
                  )}
                  {req.teacherNotes && <p className="mt-1 text-xs text-gray-400">{d('rejectionReason')} {req.teacherNotes}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {statusBadge(req.status)}
                  <div className="flex gap-1.5">
                    {req.status === 'ACCEPTED' && (
                      <Button size="sm" variant="outline" onClick={() => window.location.href = '/chat'}><MessageSquare className="ml-1 h-3 w-3" /></Button>
                    )}
                  </div>
                </div>
              </div>
              {req.bookingStatus === 'waiting_student_confirmation' && (
                <div className="mt-4 flex gap-2 border-t pt-4">
                  <Button size="sm" onClick={() => handleAcceptProposal(req.id)}>
                    <CheckCircle className="ml-1 h-4 w-4" /> {d('acceptProposal')}
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleRejectProposal(req.id)}>
                    <XCircle className="ml-1 h-4 w-4" /> {d('rejectProposal')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {requests.sent?.length === 0 && <p className="py-8 text-center text-sm text-gray-400">{d('noSentRequests')}</p>}
      </div>
    </div>
  );
}
