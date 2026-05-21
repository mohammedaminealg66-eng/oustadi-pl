'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { apiRequest } from '@/lib/api';
import { getAvatarUrl } from '@/lib/asset';
import { Button } from '@oustadi/ui';
import { ArrowRight, Send, AlertTriangle, User, Calendar, Clock, Shield } from 'lucide-react';

export default function DisputePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('dispute');
  const c = useTranslations('common');
  const [dispute, setDispute] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function fetchDispute() {
    const res = await apiRequest<any>(`/disputes/${id}`);
    if (res.success && res.data) {
      setDispute(res.data);
      setMessages(res.data.messages || []);
    }
    setLoading(false);
  }

  useEffect(() => { fetchDispute(); }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function handleSend() {
    if (!newMessage.trim()) return;
    setSending(true);
    const res = await apiRequest(`/disputes/${id}/message`, {
      method: 'POST',
      body: JSON.stringify({ message: newMessage }),
    });
    setSending(false);
    if (res.success && res.data) {
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-500">{c('loading')}</div>;
  if (!dispute) return <div className="py-16 text-center text-gray-500">{t('notFound')}</div>;

   const isMine = (msg: any) => msg.senderId === user?.userId;
   const otherUser = user?.role === 'TEACHER' ? dispute.student : dispute.teacher;
   const statusLabels: Record<string, string> = {
     open: t('statusOpen'),
     reviewing: t('statusReviewing'),
     resolved: t('statusResolved'),
     rejected: t('statusRejected'),
   };
   const statusColors: Record<string, string> = {
     open: 'bg-red-100 text-red-700',
     reviewing: 'bg-yellow-100 text-yellow-700',
     resolved: 'bg-green-100 text-green-700',
     rejected: 'bg-gray-100 text-gray-500',
   };

   function fmtTime(date: string | Date) {
      if (!date) return '';
      return new Date(date).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });
    }

   function getTimelineItems() {
      const items = [];
      if (dispute.booking) {
        items.push({
          title: t('timelineRequestSent'),
          description: t('timelineRequestSentDesc', { teacher: dispute.teacher?.fullName, student: dispute.student?.fullName }),
          time: fmtTime(dispute.booking.createdAt)
        });
        if (dispute.booking.status === 'ACCEPTED' || dispute.booking.status === 'accepted') {
          items.push({
            title: t('timelineTeacherAccepted'),
            description: t('timelineTeacherAcceptedDesc'),
            time: fmtTime(dispute.booking.updatedAt)
          });
        }
        if (dispute.booking.proposedDate || dispute.booking.proposedTime) {
          items.push({
            title: t('timelineTeacherProposedSchedule'),
            description: t('timelineTeacherProposedScheduleDesc'),
            time: fmtTime(dispute.booking.updatedAt)
          });
        }
        if (dispute.booking.status === 'ACCEPTED' && (dispute.booking.proposedDate || dispute.booking.proposedTime)) {
          items.push({
            title: t('timelineStudentAcceptedSchedule'),
            description: t('timelineStudentAcceptedScheduleDesc'),
            time: fmtTime(dispute.booking.updatedAt)
          });
        }
        if (dispute.booking.status === 'COMPLETED' || dispute.booking.status === 'completed') {
          items.push({
            title: t('timelineLessonCompleted'),
            description: t('timelineLessonCompletedDesc'),
            time: fmtTime(dispute.booking.updatedAt)
          });
        }
      }
      items.push({
        title: t('timelineDisputeOpened'),
        description: t('timelineDisputeOpenedDesc', { reason: dispute.reason }),
        time: fmtTime(dispute.createdAt)
      });
      if (dispute.status === 'reviewing' || dispute.status === 'under_review') {
        items.push({
          title: t('timelineReviewStarted'),
          description: t('timelineReviewStartedDesc'),
          time: fmtTime(dispute.updatedAt)
        });
      }
      if (dispute.status === 'resolved') {
        items.push({
          title: t('timelineDisputeResolved'),
          description: t('timelineDisputeResolvedDesc'),
          time: fmtTime(dispute.updatedAt)
        });
      }
      return items;
    }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <button onClick={() => router.back()} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
          <ArrowRight className="h-5 w-5 rotate-180" />
        </button>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h1 className="text-lg font-bold text-gray-900">{t('title')}</h1>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[dispute.status] || ''}`}>
          {statusLabels[dispute.status] || dispute.status}
        </span>
      </div>

      {/* Info bar */}
      <div className="flex flex-wrap gap-4 border-b bg-white px-4 py-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {dispute.teacher?.fullName} ↔ {dispute.student?.fullName}</span>
        {dispute.booking?.subject && <span>{dispute.booking.subject.nameAr || dispute.booking.subject.nameFr}</span>}
        {dispute.booking?.bookedDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(dispute.booking.bookedDate).toLocaleDateString('ar-MA')}</span>}
        {dispute.booking?.bookedTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {dispute.booking.bookedTime}</span>}
      </div>

       {/* Dispute reason */}
       <div className="border-b bg-red-50 px-4 py-2">
         <p className="flex items-center gap-1 text-xs font-medium text-red-700"><Shield className="h-3 w-3" /> {t('reason')}</p>
         <p className="mt-0.5 text-sm text-red-600">{dispute.reason}</p>
       </div>

       {/* Timeline */}
       <div className="border-b bg-gray-50 px-4 py-4">
         <h2 className="mb-3 text-lg font-semibold text-gray-900">{t('timeline')}</h2>
         <div className="space-y-4">
           {getTimelineItems().map((item, index) => (
             <div key={index} className="flex items-start gap-3">
               <div className="flex-shrink-0 h-3 w-3 rounded-full bg-gray-300" />
               <div className="flex-1 space-y-1">
                 <div className="flex items-center justify-between text-sm">
                   <span className="font-medium text-gray-900">{item.title}</span>
                   <span className="text-xs text-gray-500">{item.time}</span>
                 </div>
                 <p className="text-xs text-gray-600">{item.description}</p>
               </div>
             </div>
           ))}
         </div>
       </div>

       {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {messages.map((msg: any) => {
            const mine = isMine(msg);
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl px-4 py-2.5 lg:max-w-md ${
                  msg.senderRole === 'admin'
                    ? mine ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900'
                    : mine ? 'bg-primary-600 text-white' : 'bg-white text-gray-900 shadow-sm'
                }`}>
                  {!mine && <p className="mb-0.5 text-xs font-medium opacity-70">{msg.sender?.fullName}</p>}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <p className={`mt-1 text-[10px] ${mine ? 'opacity-60' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={t('typeMessage')}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
