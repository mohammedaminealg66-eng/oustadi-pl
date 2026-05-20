'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { apiRequest } from '@/lib/api';
import { getAvatarUrl } from '@/lib/asset';
import { Button } from '@oustadi/ui';
import { ArrowRight, Send, Shield, AlertTriangle, User, Clock, Play, Pause, Paperclip, Mic, Smile, X, StopCircle, Image as ImageIcon, FileText } from 'lucide-react';

const EMOJI_LIST = ['😀','😂','🥰','😎','👍','👋','🙏','❤️','🔥','⭐','📚','✏️','🎓','✅','❌','⏰','📝','💬','👏','🤝','😊','🤔','😅','😢','🎉','💪','🌟','📖','🏆','💡'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  open: { label: 'مفتوح', color: 'text-red-700', bg: 'bg-red-100', icon: '🔴' },
  under_review: { label: 'قيد المراجعة', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: '🟡' },
  resolved: { label: 'تم الحل', color: 'text-green-700', bg: 'bg-green-100', icon: '🟢' },
  closed: { label: 'مغلق', color: 'text-gray-700', bg: 'bg-gray-100', icon: '⚫' },
};

interface SupportMessage {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  createdAt: string;
  sender?: { id: string; fullName: string; avatarKey: string | null };
}

interface SupportConversation {
  id: string;
  participantRole: string;
  dispute: {
    id: string;
    status: string;
    reason: string;
    booking?: { subject?: { nameAr: string; nameFr: string } | null; bookedDate?: string; bookedTime?: string };
  };
  participant: { id: string; fullName: string; avatarKey: string | null };
  messages: SupportMessage[];
}

export default function SupportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const locale = useLocale();
  const t = useTranslations('support');
  const c = useTranslations('common');
  const [conv, setConv] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function fetchConversation() {
    const res = await apiRequest<any>(`/support/${id}`);
    if (res.success && res.data) {
      setConv(res.data);
      setMessages(res.data.messages || []);
    }
    setLoading(false);
  }

  useEffect(() => { fetchConversation(); }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function handleSend() {
    if (!newMessage.trim()) return;
    setSending(true);
    const res = await apiRequest(`/support/${id}/message`, {
      method: 'POST',
      body: JSON.stringify({ message: newMessage }),
    });
    setSending(false);
    if (res.success && res.data) {
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
      setShowEmojiPicker(false);
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-500">{c('loading')}</div>;
  if (!conv) return <div className="py-16 text-center text-gray-500">{t('notFound')}</div>;

  const isMine = (msg: SupportMessage) => msg.senderId === user?.userId;
  const status = STATUS_CONFIG[conv.dispute.status] || STATUS_CONFIG.open;
  const dashboardHref = user?.role === 'TEACHER' ? '/teacher' : '/student';

  return (
    <div className="flex h-screen flex-col bg-gray-50" dir={locale === 'fr' ? 'ltr' : 'rtl'}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <button onClick={() => router.push(dashboardHref)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
          <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
          <Shield className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-gray-900">{t('supportTitle')}</p>
          <p className="text-[11px] text-indigo-600">{t('officialSupport')}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.bg} ${status.color}`}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Dispute info bar */}
      <div className="flex flex-wrap items-center gap-3 border-b bg-red-50 px-4 py-2 text-xs">
        <AlertTriangle className="h-3 w-3 text-red-500" />
        <span className="font-medium text-red-700">{t('reason')}:</span>
        <span className="text-red-600">{conv.dispute.reason}</span>
        {conv.dispute.booking?.subject && (
          <span className="text-red-500">{conv.dispute.booking.subject.nameAr || conv.dispute.booking.subject.nameFr}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {messages.map((msg) => {
            const mine = isMine(msg);
            const isAdmin = msg.senderRole === 'admin';
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl px-4 py-2.5 lg:max-w-md ${
                  isAdmin
                    ? 'bg-indigo-600 text-white'
                    : mine ? 'bg-primary-600 text-white' : 'bg-white text-gray-900 shadow-sm'
                }`}>
                  {!mine && !isAdmin && <p className="mb-0.5 text-xs font-medium opacity-70">{msg.sender?.fullName}</p>}
                  {isAdmin && !mine && (
                    <p className="mb-0.5 flex items-center gap-1 text-xs font-medium opacity-80">
                      <Shield className="h-3 w-3" /> {t('supportLabel')}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <p className={`mt-1 text-[10px] ${mine || isAdmin ? 'opacity-60' : 'text-gray-400'}`}>
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
          <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Smile className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={t('typeMessage')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 right-0 grid grid-cols-10 gap-1 rounded-xl border bg-white p-3 shadow-lg">
                {EMOJI_LIST.map((emoji) => (
                  <button key={emoji} onClick={() => setNewMessage((prev) => prev + emoji)} className="rounded p-1 text-lg hover:bg-gray-100">
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
            {sending ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
