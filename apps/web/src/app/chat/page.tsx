'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { apiRequest, getTokens } from '@/lib/api';
import { Button, Input } from '@oustadi/ui';
import { ArrowRight, Send, User, MessageSquare } from 'lucide-react';

interface Conversation {
  id: string;
  student: { id: string; fullName: string; avatarKey: string | null };
  teacher: { id: string; fullName: string; avatarKey: string | null };
  _count: { messages: number };
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
}

interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  sender: { id: string; fullName: string };
  createdAt: string;
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const d = useTranslations('dashboard');
  const c = useTranslations('common');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConvRef = useRef(activeConv);
  activeConvRef.current = activeConv;

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    apiRequest<Conversation[]>('/conversations').then((res) => {
      if (res.success && res.data) setConversations(res.data as Conversation[]);
    });

    const token = getTokens().accessToken;
    const s = io('/ws', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    setSocket(s);

    s.on('chat:message', (msg: Message) => {
      if (msg.conversationId === activeConvRef.current) {
        setMessages((prev) => [...prev, msg]);
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessagePreview: msg.content, lastMessageAt: msg.createdAt }
            : c
        )
      );
    });

    return () => { s.disconnect(); };
  }, [authLoading, user, router]);

  useEffect(() => {
    if (activeConv) {
      apiRequest<Message[]>(`/conversations/${activeConv}/messages`).then((res) => {
        if (res.success && res.data) setMessages(res.data as Message[]);
        apiRequest(`/conversations/${activeConv}/read`, { method: 'POST' });
      });
      socket?.emit('chat:join', activeConv);
    }
    return () => { if (activeConv) socket?.emit('chat:leave', activeConv); };
  }, [activeConv, socket]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function sendMessage() {
    if (!newMessage.trim() || !activeConv) return;
    socket?.emit('chat:message', { conversationId: activeConv, content: newMessage });
    setNewMessage('');
  }

  const currentConv = conversations.find((c) => c.id === activeConv);
  const otherUser = currentConv
    ? (currentConv.student.id === user?.userId ? currentConv.teacher : currentConv.student)
    : null;

  const dashboardHref = user?.role === 'TEACHER' ? '/teacher' : user?.role === 'ADMIN' ? '/admin' : '/student';

  if (authLoading) return <div className="flex min-h-screen items-center justify-center text-gray-500">{c('loading')}</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex w-80 flex-col border-l bg-white">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Link href={dashboardHref} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h2 className="text-lg font-bold text-gray-900">{d('chatTitle')}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            const other = conv.student.id === user?.userId ? conv.teacher : conv.student;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`w-full border-b p-4 text-right transition hover:bg-gray-50 ${activeConv === conv.id ? 'bg-primary-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                    {other.fullName?.charAt(0) || <User className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{other.fullName}</p>
                    {conv.lastMessagePreview && (
                      <p className="truncate text-sm text-gray-500">{conv.lastMessagePreview}</p>
                    )}
                  </div>
                  {conv._count.messages > 0 && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[10px] text-white">
                      {conv._count.messages}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
              <MessageSquare className="h-8 w-8" />
              <p className="text-sm">{d('noConversations')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {activeConv ? (
          <>
            <div className="flex items-center gap-3 border-b bg-white px-6 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                {otherUser?.fullName?.charAt(0) || <User className="h-4 w-4" />}
              </div>
              <p className="font-medium text-gray-900">{otherUser?.fullName || d('chatTitle')}</p>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <div className="mx-auto max-w-3xl space-y-4">
                {messages.map((msg) => {
                  const isMine = msg.senderId === user?.userId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-md rounded-2xl px-4 py-2.5 ${isMine ? 'bg-primary-600 text-white' : 'bg-white text-gray-900 shadow-sm'}`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={`mt-1 text-[10px] ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t bg-white px-6 py-4">
              <div className="mx-auto flex max-w-3xl gap-3">
                <Input
                  id="message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={d('typeMessage')}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
            <MessageSquare className="h-12 w-12" />
            <p className="text-sm">{d('selectConversation')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
