'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, Button } from '@oustadi/ui';
import { MessageSquare, CheckCircle, XCircle, Clock, RefreshCw, X, Star } from 'lucide-react';

export default function TeacherRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState<string | null>(null);
  const [proposeDate, setProposeDate] = useState('');
  const [proposeTime, setProposeTime] = useState('');
  const d = useTranslations('dashboard');
  const c = useTranslations('common');

  useEffect(() => {
    apiRequest<{ received: any[] }>('/requests').then((res) => {
      if (res.success && res.data) setRequests((res.data as any).received || []);
      setLoading(false);
    });
  }, []);

  async function handleAction(requestId: string, action: 'accept' | 'reject' | 'complete' | 'cancel') {
    await apiRequest(`/requests/${requestId}/${action}`, { method: 'PATCH' });
    const res = await apiRequest<{ received: any[] }>('/requests');
    if (res.success && res.data) setRequests((res.data as any).received || []);
  }

  async function handlePropose(requestId: string) {
    if (!proposeDate || !proposeTime) return;
    await apiRequest(`/requests/${requestId}/propose`, {
      method: 'PATCH',
      body: JSON.stringify({ proposedDate: proposeDate, proposedTime: proposeTime }),
    });
    setProposing(null);
    setProposeDate('');
    setProposeTime('');
    const res = await apiRequest<{ received: any[] }>('/requests');
    if (res.success && res.data) setRequests((res.data as any).received || []);
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

  function bookingBadge(bookingStatus: string) {
    if (bookingStatus === 'waiting_student_confirmation') {
      return <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">{d('waitingStudentConfirmation')}</span>;
    }
    return null;
  }

  if (loading) return <p className="text-gray-500">{c('loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{d('requests')}</h1>
      <div className="mt-6 space-y-3">
        {requests.map((req: any) => (
          <Card key={req.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{req.student?.fullName}</p>
                  {req.subject && <p className="text-xs text-primary-600">{req.subject.nameAr || req.subject.nameFr}</p>}
                  {req.message && <p className="mt-1 text-sm text-gray-500">{req.message}</p>}
                  {(req.bookedDate || req.bookedTime || req.lessonType) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                      {req.bookedDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(req.bookedDate).toLocaleDateString('ar-MA')} {req.bookedTime}</span>}
                      {req.lessonType && <span className="rounded bg-gray-100 px-1.5 py-0.5">{req.lessonType === 'ONLINE' ? 'عن بعد' : 'حضوري'}</span>}
                    </div>
                  )}
                  {req.bookingStatus === 'waiting_student_confirmation' && req.proposedDate && req.proposedTime && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-purple-600">
                      <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> {d('proposedTime')}: {new Date(req.proposedDate).toLocaleDateString('ar-MA')} {req.proposedTime}</span>
                    </div>
                  )}
                  {req.teacherNotes && <p className="mt-1 text-xs text-gray-400">{d('rejectionReason')} {req.teacherNotes}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex gap-1.5">
                    {statusBadge(req.status)}
                    {bookingBadge(req.bookingStatus)}
                  </div>
                  <div className="flex gap-1.5">
                    {req.status === 'PENDING' && req.bookingStatus !== 'waiting_student_confirmation' && (
                      <>
                        <Button size="sm" onClick={() => handleAction(req.id, 'accept')}>{d('accept')}</Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction(req.id, 'reject')}>{d('reject')}</Button>
                      </>
                    )}
                    {req.status === 'ACCEPTED' && (
                      <>
                        <Button size="sm" onClick={() => handleAction(req.id, 'complete')}><CheckCircle className="ml-1 h-3 w-3" /> {d('complete')}</Button>
                        <Button size="sm" variant="outline" onClick={() => setProposing(req.id)}><RefreshCw className="ml-1 h-3 w-3" /> {d('propose')}</Button>
                        <Button size="sm" variant="outline" onClick={() => router.push('/chat')}><MessageSquare className="ml-1 h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleAction(req.id, 'cancel')}><XCircle className="h-3 w-3" /></Button>
                      </>
                    )}
                    {req.status === 'COMPLETED' && (
                      <Button size="sm" variant="outline" onClick={() => router.push('/chat')}><MessageSquare className="ml-1 h-3 w-3" /></Button>
                    )}
                  </div>
                </div>
              </div>
              {proposing === req.id && (
                <div className="mt-4 flex items-end gap-3 border-t pt-4">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">{d('date')}</label>
                    <input type="date" value={proposeDate} onChange={(e) => setProposeDate(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">{d('time')}</label>
                    <input type="time" value={proposeTime} onChange={(e) => setProposeTime(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                  </div>
                  <Button size="sm" onClick={() => handlePropose(req.id)} disabled={!proposeDate || !proposeTime}>{d('propose')}</Button>
                  <button onClick={() => setProposing(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && <p className="py-8 text-center text-sm text-gray-400">{d('noRequests')}</p>}
      </div>
    </div>
  );
}
