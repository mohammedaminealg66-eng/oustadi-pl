'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Socket } from 'socket.io-client';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { apiRequest, getTokens } from '@/lib/api';
import { getSocket } from '@/lib/socket-client';
import { getAvatarUrl } from '@/lib/asset';
import { Button, Input } from '@oustadi/ui';
import { ArrowRight, Send, User, MessageSquare, ChevronLeft, Menu, Paperclip, Mic, Smile, Play, Pause, StopCircle, FileText, Clock, X } from 'lucide-react';

const EMOJI_LIST = ['😀','😂','🥰','😎','👍','👋','🙏','❤️','🔥','⭐','📚','✏️','🎓','✅','❌','⏰','📝','💬','👏','🤝','😊','🤔','😅','😢','🎉','💪','🌟','📖','🏆','💡'];

interface Conversation {
  id: string;
  student: { id: string; fullName: string; avatarKey: string | null; isOnline: boolean; lastSeen: string | null } | null;
  teacher: { id: string; fullName: string; avatarKey: string | null; isOnline: boolean; lastSeen: string | null } | null;
  admin: { id: string; fullName: string; avatarKey: string | null; isOnline: boolean; lastSeen: string | null } | null;
  _count: { messages: number };
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
}

interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  sender: { id: string; fullName: string; role: string };
  type?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  createdAt: string;
}

function lastSeenText(ls: string | null, locale: string): string {
  if (!ls) return '';
  const diff = Date.now() - new Date(ls).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return locale === 'fr' ? 'en ligne' : 'متصل';
  if (mins < 60) return locale === 'fr' ? `il y a ${mins} min` : `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return locale === 'fr' ? `il y a ${hrs} h` : `منذ ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  return locale === 'fr' ? `il y a ${days} j` : `منذ ${days} يوم`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function ChatPage({ dashboardHref }: { dashboardHref: string }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const d = useTranslations('dashboard');
  const c = useTranslations('common');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showMobileList, setShowMobileList] = useState(true);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeConvRef = useRef(activeConv);
  activeConvRef.current = activeConv;

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    apiRequest<Conversation[]>('/conversations').then((res) => {
      if (res.success && res.data) setConversations(res.data as Conversation[]);
    });

    const token = getTokens().accessToken;
    if (!token) return;

    const s = getSocket(token);
    setSocket(s);

    const msgHandler = (msg: Message) => {
      if (msg.conversationId === activeConvRef.current) {
        setMessages((prev) => [...prev, msg]);
        s.emit('chat:read', { conversationId: msg.conversationId });
      }
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === msg.conversationId) {
            const preview = msg.type === 'IMAGE' ? '🖼️ صورة' : msg.type === 'FILE' ? `📎 ${msg.fileName || 'ملف'}` : msg.type === 'VOICE' ? '🎤 رسالة صوتية' : msg.content;
            return { ...conv, lastMessagePreview: preview, lastMessageAt: msg.createdAt, _count: { messages: conv._count.messages + (msg.conversationId === activeConvRef.current ? 0 : 1) } };
          }
          return conv;
        })
      );
    };

    const typingStartHandler = (data: { userId: string; fullName: string }) => {
      setTypingUsers((prev) => new Set(prev).add(data.userId));
    };
    const typingStopHandler = (data: { userId: string }) => {
      setTypingUsers((prev) => { const n = new Set(prev); n.delete(data.userId); return n; });
    };
    const readHandler = (data: { userId: string }) => {
      setMessages((prev) => prev.map((m) => m.senderId === data.userId ? { ...m, readAt: new Date().toISOString() } as any : m));
    };

    s.on('chat:message', msgHandler);
    s.on('typing:start', typingStartHandler);
    s.on('typing:stop', typingStopHandler);
    s.on('chat:read', readHandler);
    return () => {
      s.off('chat:message', msgHandler);
      s.off('typing:start', typingStartHandler);
      s.off('typing:stop', typingStopHandler);
      s.off('chat:read', readHandler);
    };
  }, [authLoading, user, router]);

  useEffect(() => {
    if (activeConv) {
      apiRequest<Message[]>(`/conversations/${activeConv}/messages`).then((res) => {
        if (res.success && res.data) setMessages(res.data as Message[]);
        socket?.emit('chat:read', { conversationId: activeConv });
      });
      socket?.emit('chat:join', activeConv);
    }
    return () => { if (activeConv) socket?.emit('chat:leave', activeConv); };
  }, [activeConv, socket]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendTyping = useCallback((start: boolean) => {
    if (!activeConv || !socket) return;
    if (start) {
      socket.emit('typing:start', { conversationId: activeConv });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => sendTyping(false), 3000);
    } else {
      socket.emit('typing:stop', { conversationId: activeConv });
    }
  }, [activeConv, socket]);

  function sendMessage() {
    if (!newMessage.trim() || !activeConv) return;
    socket?.emit('chat:message', { conversationId: activeConv, content: newMessage });
    setNewMessage('');
    sendTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setShowEmojiPicker(false);
  }

  async function sendFile(file: File, type: string) {
    if (!activeConv) return;
    setUploadingFile(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiRequest('/upload/chat-file', { method: 'POST', body: fd, skipAuth: false, headers: {} as any });
    setUploadingFile(false);
    if (res.success && res.data) {
      const data = res.data as any;
      const content = type === 'IMAGE' ? '🖼️ صورة' : type === 'VOICE' ? '🎤 رسالة صوتية' : `📎 ${data.fileName || 'ملف'}`;
      socket?.emit('chat:message', {
        conversationId: activeConv,
        content,
        type,
        fileUrl: data.url,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        duration: type === 'VOICE' ? recordingDuration : undefined,
      });
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const type = isImage ? 'IMAGE' : 'FILE';
    sendFile(file, type);
    e.target.value = '';
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordingBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => setRecordingDuration((d) => d + 1), 1000);
    } catch {
      alert('لا يمكن الوصول إلى الميكروفون');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
  }

  function cancelRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setRecordingBlob(null);
    setRecordingDuration(0);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
  }

  function sendRecording() {
    if (recordingBlob && activeConv) {
      const file = new File([recordingBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      sendFile(file, 'VOICE');
      setRecordingBlob(null);
      setRecordingDuration(0);
    }
  }

  function playAudio(url: string, msgId: string) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingAudio(null);
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingAudio(msgId);
    audio.play();
    audio.onended = () => { setPlayingAudio(null); audioRef.current = null; };
  }

  function handleTyping(val: string) {
    setNewMessage(val);
    if (!typingTimeoutRef.current) sendTyping(true);
  }

  const currentConv = conversations.find((c) => c.id === activeConv);
  const otherUser = currentConv
    ? (user?.role === 'ADMIN'
        ? (currentConv.student || currentConv.teacher)
        : (currentConv.student?.id === user?.userId ? currentConv.teacher : currentConv.student || currentConv.admin))
    : null;
  const isOtherAdmin = otherUser && currentConv?.admin?.id === otherUser.id;
  const isOtherTyping = otherUser && typingUsers.has(otherUser.id);

  function selectConversation(id: string) {
    setActiveConv(id);
    setShowMobileList(false);
    setShowMobileProfile(false);
    setShowEmojiPicker(false);
  }

  if (authLoading) return <div className="flex min-h-screen items-center justify-center text-gray-500">{c('loading')}</div>;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-gray-50" dir={locale === 'fr' ? 'ltr' : 'rtl'}>
      <div className={`${showMobileList ? 'flex' : 'hidden'} w-full flex-col border-l bg-white lg:flex lg:w-80 ${activeConv ? 'lg:flex' : ''}`}>
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Link href={dashboardHref} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
            <ArrowRight className={`h-5 w-5 ${locale === 'fr' ? '' : 'rotate-180'}`} />
          </Link>
          <h2 className="text-lg font-bold text-gray-900">{d('chatTitle')}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            const other = user?.role === 'ADMIN'
              ? (conv.student || conv.teacher)
              : (conv.student?.id === user?.userId ? conv.teacher : conv.student || conv.admin);
            const isAdminConv = !!conv.admin;
            return (
              <button key={conv.id} onClick={() => selectConversation(conv.id)}
                className={`w-full border-b p-4 text-right transition hover:bg-gray-50 ${activeConv === conv.id ? (isAdminConv ? 'bg-indigo-50' : 'bg-primary-50') : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {isAdminConv ? (
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                        {other?.avatarKey ? <img src={getAvatarUrl(other.avatarKey)} alt="" className="h-full w-full object-cover" />
                          : (other?.fullName?.charAt(0) || <User className="h-4 w-4" />)}
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                        {other?.avatarKey ? <img src={getAvatarUrl(other.avatarKey)} alt="" className="h-full w-full object-cover" />
                          : (other?.fullName?.charAt(0) || <User className="h-4 w-4" />)}
                      </div>
                    )}
                    {other?.isOnline && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-green-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-gray-900">{other?.fullName}</p>
                      {isAdminConv && <span className="shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-medium text-indigo-700">🛡 دعم</span>}
                      {other?.isOnline && <span className="shrink-0 text-[10px] text-green-600">{c('online')}</span>}
                    </div>
                    {conv.lastMessagePreview && (
                      <p className="truncate text-sm text-gray-500">{conv.lastMessagePreview}</p>
                    )}
                  </div>
                  {conv._count.messages > 0 && (
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] text-white ${isAdminConv ? 'bg-indigo-600' : 'bg-primary-600'}`}>
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

      <div className={`flex flex-1 flex-col ${!showMobileList ? 'flex' : 'hidden lg:flex'}`}>
        {activeConv ? (
          <>
            <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
              <button className="lg:hidden" onClick={() => setShowMobileList(true)}>
                <Menu className="h-5 w-5 text-gray-500" />
              </button>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${isOtherAdmin ? 'bg-indigo-100 text-indigo-600' : 'bg-primary-100 text-primary-600'}`}>
                {otherUser?.avatarKey ? <img src={getAvatarUrl(otherUser.avatarKey)} alt="" className="h-full w-full object-cover" />
                  : (otherUser?.fullName?.charAt(0) || <User className="h-4 w-4" />)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-gray-900">{otherUser?.fullName || ''}</p>
                  {isOtherAdmin && <span className="shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-medium text-indigo-700">🛡 {d('officialSupport') || 'دعم رسمي'}</span>}
                </div>
                <p className="text-[11px] text-gray-500">
                  {isOtherTyping
                    ? <span className="text-green-600">{d('typing')}</span>
                    : otherUser?.isOnline ? c('online') : otherUser?.lastSeen ? lastSeenText(otherUser.lastSeen, locale) : ''}
                </p>
              </div>
              <button onClick={() => setShowMobileProfile(true)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden">
                <ChevronLeft className={`h-5 w-5 ${locale === 'fr' ? 'rotate-0' : 'rotate-180'}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
              <div className={`mx-auto max-w-3xl space-y-3 ${locale === 'fr' ? '' : 'space-y-reverse'}`}>
                {messages.map((msg) => {
                  const isMine = msg.senderId === user?.userId;
                  const isSenderAdmin = msg.sender?.role === 'ADMIN';
                  const msgType = msg.type || 'TEXT';
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs rounded-2xl px-4 py-2.5 lg:max-w-md ${
                        isSenderAdmin && !isMine
                          ? 'bg-indigo-600 text-white'
                          : isMine ? 'bg-primary-600 text-white' : 'bg-white text-gray-900 shadow-sm'
                      }`}>
                        {isSenderAdmin && !isMine && (
                          <p className="mb-0.5 flex items-center gap-1 text-[10px] font-medium opacity-80">
                            🛡 {d('officialSupport') || 'دعم رسمي'}
                          </p>
                        )}
                        {msg.fileUrl && (
                          msgType === 'IMAGE' ? (
                            <img src={msg.fileUrl} alt="" className="mb-2 max-h-64 rounded-lg object-cover" />
                          ) : msgType === 'FILE' ? (
                            <a href={msg.fileUrl} download={msg.fileName} className={`flex items-center gap-2 rounded-lg p-2 ${isSenderAdmin && !isMine ? 'bg-indigo-700' : isMine ? 'bg-primary-700' : 'bg-gray-100'}`}>
                              <FileText className="h-4 w-4" />
                              <span className="text-xs truncate">{msg.fileName}</span>
                              {msg.fileSize && <span className="text-[10px] opacity-60">{formatFileSize(msg.fileSize)}</span>}
                            </a>
                          ) : msgType === 'VOICE' ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => playAudio(msg.fileUrl!, msg.id)} className={`rounded-full p-1.5 ${isSenderAdmin && !isMine ? 'bg-indigo-700' : isMine ? 'bg-primary-700' : 'bg-gray-100'}`}>
                                {playingAudio === msg.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </button>
                              <div className="flex-1">
                                <div className={`h-1.5 rounded-full ${isSenderAdmin && !isMine ? 'bg-indigo-400' : isMine ? 'bg-primary-400' : 'bg-gray-200'}`} style={{ width: playingAudio === msg.id ? '100%' : '0%', transition: 'width 0.3s' }} />
                              </div>
                              {msg.duration && <span className="text-[10px] opacity-60">{Math.floor(msg.duration / 60)}:{String(Math.floor(msg.duration % 60)).padStart(2, '0')}</span>}
                            </div>
                          ) : null
                        )}
                        {msgType === 'TEXT' && msg.content && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}
                        <div className={`mt-1 flex items-center justify-end gap-1 ${isSenderAdmin && !isMine ? 'text-indigo-200' : isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                          <span className="text-[10px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMine && (msg as any).readAt && <span className="text-[9px]">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isOtherTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white px-4 py-2.5 shadow-sm">
                      <span className="text-sm text-gray-500">{d('typing')}...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {recordingBlob && (
              <div className="border-t bg-white px-4 py-3 lg:px-6">
                <div className="mx-auto flex max-w-3xl items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Mic className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{Math.floor(recordingDuration / 60)}:{String(Math.floor(recordingDuration % 60)).padStart(2, '0')}</p>
                    <p className="text-xs text-gray-500">رسالة صوتية جاهزة</p>
                  </div>
                  <Button size="sm" onClick={sendRecording}><Send className="h-4 w-4" /></Button>
                  <button onClick={cancelRecording} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                </div>
              </div>
            )}

            {!recordingBlob && (
              <div className="border-t bg-white px-4 py-3 lg:px-6 lg:py-4">
                <div className="mx-auto flex max-w-3xl gap-2 lg:gap-3">
                  <div className="relative flex items-center gap-1">
                    <label className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100" title={d('attachFile')}>
                      <Paperclip className="h-5 w-5" />
                      <input type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} disabled={uploadingFile} />
                    </label>
                    <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" title={d('recordVoice')} onClick={startRecording}>
                      <Mic className="h-5 w-5" />
                    </button>
                    <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" title={d('emojiPicker')} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="relative flex-1">
                    <Input value={newMessage} onChange={(e) => handleTyping(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder={d('typeMessage')} className="w-full" />
                    {showEmojiPicker && (
                      <div className="absolute bottom-full mb-2 right-0 grid grid-cols-10 gap-1 rounded-xl border bg-white p-3 shadow-lg">
                        {EMOJI_LIST.map((emoji) => (
                          <button key={emoji} onClick={() => { setNewMessage((prev) => prev + emoji); }} className="rounded p-1 text-lg hover:bg-gray-100">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={sendMessage} disabled={!newMessage.trim() || uploadingFile}>
                    {uploadingFile ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="border-t bg-white px-4 py-3 lg:px-6">
                <div className="mx-auto flex max-w-3xl items-center gap-3">
                  <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-red-100">
                    <Mic className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-600">{d('recording') || 'جارٍ التسجيل...'}</p>
                    <p className="text-xs text-gray-500">{Math.floor(recordingDuration / 60)}:{String(Math.floor(recordingDuration % 60)).padStart(2, '0')}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={stopRecording}><StopCircle className="h-4 w-4" /></Button>
                  <button onClick={cancelRecording} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={`flex flex-1 flex-col items-center justify-center gap-3 text-gray-400 ${showMobileList ? 'hidden lg:flex' : ''}`}>
            <MessageSquare className="h-12 w-12" />
            <p className="text-sm">{d('selectConversation')}</p>
          </div>
        )}
      </div>

      {otherUser && (
        <div className={`${showMobileProfile ? 'flex' : 'hidden'} w-full flex-col border-r bg-white lg:flex lg:w-72`}>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">{d('myProfile')}</h3>
            <button className="lg:hidden" onClick={() => setShowMobileProfile(false)}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-3 px-4 py-8">
            <div className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-2xl font-bold ${isOtherAdmin ? 'bg-indigo-100 text-indigo-600' : 'bg-primary-100 text-primary-600'}`}>
              {otherUser.avatarKey ? <img src={getAvatarUrl(otherUser.avatarKey)} alt="" className="h-full w-full object-cover" />
                : (otherUser.fullName?.charAt(0) || <User className="h-8 w-8" />)}
            </div>
            <p className="text-lg font-bold text-gray-900">{otherUser.fullName}</p>
            {isOtherAdmin && <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">🛡 {d('officialSupport') || 'دعم رسمي'}</span>}
            {otherUser.isOnline ? (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" /> {d('online')}
              </span>
            ) : otherUser.lastSeen ? (
              <span className="text-xs text-gray-500">{lastSeenText(otherUser.lastSeen, locale)}</span>
            ) : null}
          </div>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
}
