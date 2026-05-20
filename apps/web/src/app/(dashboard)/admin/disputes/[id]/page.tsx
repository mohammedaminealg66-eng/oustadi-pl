'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { getAvatarUrl } from '@/lib/asset';
import { Card, CardContent, Button } from '@oustadi/ui';
import { ArrowRight, AlertTriangle, CheckCircle, XCircle, Shield, User, Calendar, Clock, MessageSquare, FileText } from 'lucide-react';

export default function AdminDisputeDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations('admin');
  const c = useTranslations('common');
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionNote, setActionNote] = useState('');
  const [acting, setActing] = useState(false);

  async function fetchDispute() {
    const res = await apiRequest<any>(`/admin/disputes/${id}`);
    if (res.success && res.data) setDispute(res.data);
    setLoading(false);
  }

  useEffect(() => { fetchDispute(); }, [id]);

  async function handleAction(action: string) {
    if (!actionNote.trim() && action !== 'reviewing') return;
    setActing(true);
    await apiRequest(`/admin/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ action, note: actionNote }),
    });
    setActing(false);
    await fetchDispute();
    setActionNote('');
  }

  async function handleSuspend(userId: string, userName: string) {
    const reason = prompt(`سبب إيقاف ${userName}:`);
    if (!reason) return;
    await apiRequest(`/admin/users/${userId}/suspend-from-dispute`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    alert('تم إيقاف الحساب');
  }

  if (loading) return <p className="text-gray-500">{c('loading')}</p>;
  if (!dispute) return <p className="text-gray-500">{t('disputeNotFound')}</p>;

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

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
          <ArrowRight className="h-5 w-5 rotate-180" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{t('disputeDetail')}</h1>
        {statusBadge(dispute.status)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teacher info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><User className="h-4 w-4" /> {t('teacher')}</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                {dispute.teacher?.avatarKey ? <img src={getAvatarUrl(dispute.teacher.avatarKey)} alt="" className="h-full w-full object-cover" /> : dispute.teacher?.fullName?.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{dispute.teacher?.fullName}</p>
                <p className="text-xs text-gray-500">{dispute.teacher?.email}</p>
                {dispute.teacher?.phone && <p className="text-xs text-gray-500">{dispute.teacher.phone}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><User className="h-4 w-4" /> {t('student')}</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                {dispute.student?.avatarKey ? <img src={getAvatarUrl(dispute.student.avatarKey)} alt="" className="h-full w-full object-cover" /> : dispute.student?.fullName?.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{dispute.student?.fullName}</p>
                <p className="text-xs text-gray-500">{dispute.student?.email}</p>
                {dispute.student?.phone && <p className="text-xs text-gray-500">{dispute.student.phone}</p>}
              </div>
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
          {dispute.adminNote && (
            <div className="mt-3 rounded-lg bg-blue-50 p-3">
              <p className="flex items-center gap-1 text-sm font-medium text-blue-700"><Shield className="h-4 w-4" /> {t('adminNote')}</p>
              <p className="mt-1 text-sm text-blue-600">{dispute.adminNote}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      {dispute.messages && dispute.messages.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><MessageSquare className="h-4 w-4" /> {t('messages')}</h3>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {dispute.messages.map((msg: any) => {
                const isTeacher = msg.senderId === dispute.teacherId;
                return (
                  <div key={msg.id} className={`flex ${isTeacher ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs rounded-lg px-3 py-2 text-sm ${isTeacher ? 'bg-primary-50 text-primary-900' : 'bg-gray-100 text-gray-900'}`}>
                      <p className="text-xs font-medium">{msg.sender?.fullName}</p>
                      <p className="mt-0.5">{msg.content}</p>
                      <p className="mt-0.5 text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleString('ar-MA')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {dispute.status !== 'resolved' && dispute.status !== 'rejected' && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><Shield className="h-4 w-4" /> {t('adminActions')}</h3>
            <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)}
              placeholder={t('adminActionNote')} rows={2}
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => handleAction('resolved')} disabled={acting}>
                <CheckCircle className="ml-1 h-4 w-4" /> {t('resolveDispute')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAction('reviewing')} disabled={acting}>
                <FileText className="ml-1 h-4 w-4" /> {t('startReview')}
              </Button>
              <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleAction('rejected')} disabled={acting}>
                <XCircle className="ml-1 h-4 w-4" /> {t('rejectDispute')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleSuspend(dispute.teacherId, dispute.teacher?.fullName)} disabled={acting}>
                ⚠ {t('warnTeacher')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleSuspend(dispute.studentId, dispute.student?.fullName)} disabled={acting}>
                ⚠ {t('warnStudent')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
