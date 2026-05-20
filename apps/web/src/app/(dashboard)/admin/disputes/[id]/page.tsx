'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { getAvatarUrl } from '@/lib/asset';
import { Card, CardContent, Button } from '@oustadi/ui';
import { ArrowRight, AlertTriangle, CheckCircle, Shield, User, Calendar, Clock, MessageSquare, FileText, Send } from 'lucide-react';

export default function AdminDisputeDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations('admin');
  const c = useTranslations('common');
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  async function fetchDispute() {
    const res = await apiRequest<any>(`/admin/disputes/${id}`);
    if (res.success && res.data) setDispute(res.data);
    setLoading(false);
  }

  useEffect(() => { fetchDispute(); }, [id]);

  async function handleAction(action: string) {
    setActing(true);
    setSuccessMsg('');
    const endpoint = action === 'resolved'
      ? `/admin/disputes/${id}/resolve`
      : action === 'reviewing'
        ? `/admin/disputes/${id}/start-review`
        : `/admin/disputes/${id}/close`;
    const res = await apiRequest(endpoint, { method: 'PATCH' });
    setActing(false);
    if (res.success) {
      await fetchDispute();
      if (action === 'resolved') setSuccessMsg(t('disputeResolvedSuccess') || 'تم حل النزاع بنجاح');
      else if (action === 'reviewing') setSuccessMsg(t('reviewStarted') || 'تم بدء المراجعة');
      else setSuccessMsg(t('disputeClosed') || 'تم إغلاق النزاع');
    }
  }

  async function openChat(otherUserId: string, otherRole: string) {
    const body: any = {};
    if (otherRole === 'teacher') body.teacherId = otherUserId;
    else body.studentId = otherUserId;
    const res = await apiRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (res.success && res.data) {
      router.push('/chat');
    }
  }

  if (loading) return <p className="text-gray-500">{c('loading')}</p>;
  if (!dispute) return <p className="text-gray-500">{t('disputeNotFound')}</p>;

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      open: 'bg-red-100 text-red-700',
      under_review: 'bg-yellow-100 text-yellow-700',
      reviewing: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-500',
      rejected: 'bg-gray-100 text-gray-500',
    };
    const labels: Record<string, string> = {
      open: t('disputeOpen'),
      under_review: t('disputeUnderReview'),
      reviewing: t('disputeReviewing'),
      resolved: t('disputeResolved'),
      closed: t('disputeClosed'),
      rejected: t('disputeRejected'),
    };
    return <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] || ''}`}>{labels[status] || status}</span>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
          <ArrowRight className="h-5 w-5 rotate-180" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{t('disputeDetail')}</h1>
        {statusBadge(dispute.status)}
      </div>

      {successMsg && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
          <CheckCircle className="mr-1 inline h-4 w-4" /> {successMsg}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teacher info + message button */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><User className="h-4 w-4" /> {t('teacher')}</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                {dispute.teacher?.avatarKey ? <img src={getAvatarUrl(dispute.teacher.avatarKey)} alt="" className="h-full w-full object-cover" /> : dispute.teacher?.fullName?.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{dispute.teacher?.fullName}</p>
                <p className="text-xs text-gray-500">{dispute.teacher?.email}</p>
                {dispute.teacher?.phone && <p className="text-xs text-gray-500">{dispute.teacher.phone}</p>}
              </div>
              <Button size="sm" onClick={() => openChat(dispute.teacherId, 'teacher')}>
                <MessageSquare className="ml-1 h-4 w-4" /> {t('messageTeacher')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Student info + message button */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><User className="h-4 w-4" /> {t('student')}</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                {dispute.student?.avatarKey ? <img src={getAvatarUrl(dispute.student.avatarKey)} alt="" className="h-full w-full object-cover" /> : dispute.student?.fullName?.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{dispute.student?.fullName}</p>
                <p className="text-xs text-gray-500">{dispute.student?.email}</p>
                {dispute.student?.phone && <p className="text-xs text-gray-500">{dispute.student.phone}</p>}
              </div>
              <Button size="sm" onClick={() => openChat(dispute.studentId, 'student')}>
                <MessageSquare className="ml-1 h-4 w-4" /> {t('messageStudent')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking details */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><Calendar className="h-4 w-4" /> {t('bookingDetails')}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">{t('subject')}</p>
              <p className="font-medium">{dispute.booking?.subject?.nameAr || dispute.booking?.subject?.nameFr || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('date')}</p>
              <p className="font-medium">{dispute.booking?.bookedDate ? new Date(dispute.booking.bookedDate).toLocaleDateString('ar-MA') : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('time')}</p>
              <p className="font-medium">{dispute.booking?.bookedTime || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('lessonType')}</p>
              <p className="font-medium">{dispute.booking?.lessonType === 'ONLINE' ? t('online') : dispute.booking?.lessonType === 'IN_PERSON' ? t('inPerson') : '—'}</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-red-50 p-3">
            <p className="flex items-center gap-1 text-sm font-medium text-red-700"><AlertTriangle className="h-4 w-4" /> {t('disputeReason')}</p>
            <p className="mt-1 text-sm text-red-600">{dispute.reason}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {dispute.status !== 'resolved' && dispute.status !== 'closed' && dispute.status !== 'rejected' && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><Shield className="h-4 w-4" /> {t('adminActions')}</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => handleAction('reviewing')} disabled={acting}>
                <FileText className="ml-1 h-4 w-4" /> {t('startReview')}
              </Button>
              <Button size="sm" onClick={() => handleAction('resolved')} disabled={acting}>
                <CheckCircle className="ml-1 h-4 w-4" /> {t('resolveDispute')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAction('closed')} disabled={acting}>
                {t('closeDispute')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
