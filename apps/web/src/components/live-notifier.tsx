'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/providers/auth-provider';
import { getTokens } from '@/lib/api';
import { X, MessageSquare } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  body: string;
  link?: string;
}

export function LiveNotifier() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = getTokens().accessToken;
    const s = io('/ws', {
      auth: { token },
    });

    s.on('chat:message', (msg: any) => {
      if (msg.senderId === user.userId) return;
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, title: msg.sender?.fullName || 'رسالة جديدة', body: msg.content, link: '/chat' }]);
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
    });

    return () => { s.disconnect(); };
  }, [isAuthenticated, user]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts((prev) => prev.slice(1)), 5000);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <div className="fixed left-4 top-20 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => { if (toast.link) router.push(toast.link); dismiss(toast.id); }}
          className="flex w-80 cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 shadow-lg transition-all hover:shadow-xl animate-slide-in"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
            <MessageSquare className="h-4 w-4 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
            <p className="truncate text-xs text-gray-500">{toast.body}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); dismiss(toast.id); }} className="shrink-0 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
