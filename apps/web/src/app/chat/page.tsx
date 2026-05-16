'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiRequest, getTokens } from '@/lib/api';
import { Button, Input } from '@oustadi/ui';

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
  content: string;
  senderId: string;
  sender: { id: string; fullName: string };
  createdAt: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userId, setUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiRequest<Conversation[]>('/conversations').then((res) => {
      if (res.success && res.data) setConversations(res.data as Conversation[]);
    });

    const token = getTokens().accessToken;
    const s = io('http://localhost:3001', {
      path: '/ws',
      auth: { token },
    });
    setSocket(s);

    s.on('chat:message', (msg: Message) => {
      if (activeConv === msg.conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => { s.disconnect(); };
  }, []);

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
    ? (currentConv.student.id === userId ? currentConv.teacher : currentConv.student)
    : null;

  return (
    <div className="flex h-screen bg-white">
      <div className="w-80 border-l overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-bold text-gray-900">الرسائل</h2>
        </div>
        {conversations.map((conv) => {
          const user = conv.student;
          return (
            <button
              key={conv.id}
              onClick={() => setActiveConv(conv.id)}
              className={`w-full p-4 text-right border-b hover:bg-gray-50 transition ${activeConv === conv.id ? 'bg-primary-50' : ''}`}
            >
              <p className="font-medium text-gray-900">{user.fullName}</p>
              {conv.lastMessagePreview && <p className="text-sm text-gray-500 truncate">{conv.lastMessagePreview}</p>}
              {conv._count.messages > 0 && (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-600 text-xs text-white">
                  {conv._count.messages}
                </span>
              )}
            </button>
          );
        })}
        {conversations.length === 0 && <p className="p-4 text-center text-sm text-gray-400">لا توجد محادثات</p>}
      </div>

      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            <div className="p-4 border-b bg-gray-50">
              <p className="font-medium text-gray-900">{otherUser?.fullName || 'المحادثة'}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === userId ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-md rounded-xl px-4 py-2 ${
                    msg.senderId === userId ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">{new Date(msg.createdAt).toLocaleTimeString('ar-MA')}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  id="message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="اكتب رسالتك..."
                />
                <Button onClick={sendMessage}>إرسال</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            اختر محادثة للبدء
          </div>
        )}
      </div>
    </div>
  );
}
