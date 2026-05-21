'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { subjectName } from '@/lib/subject';
import { Card, CardContent, Button } from '@oustadi/ui';
import { MessageSquare, Clock, CheckCircle, XCircle, RefreshCw, AlertTriangle, Star } from 'lucide-react';

export default function StudentRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<any>({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [showReviewPrompt, setShowReviewPrompt] = useState<string | null>(null);
  const locale = useLocale();
  const d = useTranslations('dashboard');
  const t = useTranslations('teacher');
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

  async function handleConfirmCompletion(requestId: string, confirmed: boolean) {
    if (confirmed) {
      await apiRequest(`/requests/${requestId}/confirm-completion`, {
        method: 'PATCH',
        body: JSON.stringify({ confirmed: true }),
      });
      setConfirmModal(null);
      setShowReviewPrompt(requestId);
      await fetchRequests();
    } else {
      if (!disputeReason.trim()) return;
      await apiRequest(`/requests/${requestId}/confirm-completion`, {
        method: 'PATCH',
        body: JSON.stringify({ confirmed: false, reason: disputeReason }),
      });
      setConfirmModal(null);
      setDisputeReason('');
      await fetchRequests();
    }
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
    if (bookingStatus === 'waiting_confirmation') {
      return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">{d('confirmLesson')}</span>;
    }
    if (bookingStatus === 'disputed') {
      return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">{d('lessonDisputed')}</span>;
    }
    if (bookingStatus === 'under_review') {
      return <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">🟡 قيد المراجعة من طرف إدارة المنصة</span>;
    }
    if (bookingStatus === 'resolved') {
      return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">🟢 تم حل النزاع</span>;
    }
    return null;
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
                  {req.bookingStatus === 'disputed' && req.disputeReason && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="flex items-center gap-1 text-sm font-medium text-red-700"><AlertTriangle className="h-4 w-4" /> {d('disputeReason')}</p>
                      <p className="mt-1 text-sm text-red-600">{req.disputeReason}</p>
                    </div>
                  )}
                  {req.bookingStatus === 'under_review' && (
                    <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                      <p className="flex items-center gap-1 text-sm font-medium text-yellow-700"><AlertTriangle className="h-4 w-4" /> 🟡 قيد المراجعة من طرف إدارة المنصة</p>
                      <p className="mt-1 text-sm text-yellow-600">بدأت إدارة المنصة بمراجعة النزاع الخاص بهذه الحصة</p>
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
                    {(req.status === 'ACCEPTED' || req.status === 'COMPLETED') && (
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
              {req.bookingStatus === 'waiting_confirmation' && (
                <div className="mt-4 flex gap-2 border-t pt-4">
                  <Button size="sm" onClick={() => setConfirmModal(req.id)}>
                    <CheckCircle className="ml-1 h-4 w-4" /> {d('confirmLesson')}
                  </Button>
                </div>
              )}
              {req.bookingStatus === 'resolved' && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="flex items-center gap-1 text-sm font-medium text-green-700"><CheckCircle className="h-4 w-4" /> تم حل النزاع</p>
                  <p className="mt-1 text-sm text-green-600">تمت مراجعة النزاع وحل المشكلة من طرف إدارة المنصة</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {requests.sent?.length === 0 && <p className="py-8 text-center text-sm text-gray-400">{d('noSentRequests')}</p>}
      </div>

      {/* Completion confirmation modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-lg font-bold text-gray-900">{d('confirmLessonQuestion')}</h3>
            <p className="mt-2 text-sm text-gray-500">هل تمت الحصة فعلاً؟</p>
            <div className="mt-4 flex gap-3">
              <Button className="flex-1" onClick={() => handleConfirmCompletion(confirmModal, true)}>
                <CheckCircle className="ml-1 h-4 w-4" /> {d('yesCompleted')}
              </Button>
              <Button variant="outline" className="flex-1 text-red-500" onClick={() => handleConfirmCompletion(confirmModal, false)}>
                <XCircle className="ml-1 h-4 w-4" /> {d('noProblem')}
              </Button>
            </div>
            <div className="mt-4">
              <textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}
                placeholder={d('problemReason')} rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Review prompt modal */}
      {showReviewPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-lg font-bold text-gray-900">{d('reviewPrompt')}</h3>
            <div className="mt-4 flex gap-3">
              <Button className="flex-1" onClick={() => { setShowReviewPrompt(null); router.push(`/teachers/${requests.sent?.find((r: any) => r.id === showReviewPrompt)?.teacherId}`); }}>
                <Star className="ml-1 h-4 w-4" /> {t('addReview')}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowReviewPrompt(null)}>
                {c('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
