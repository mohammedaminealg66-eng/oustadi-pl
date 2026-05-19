'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { getAvatarUrl } from '@/lib/asset';
import { Card, CardContent } from '@oustadi/ui';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export default function AdminDocuments() {
  const t = useTranslations('admin');
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchDocs = async () => {
    try {
      const res = await apiRequest('/admin/documents/pending');
      if (res.success && Array.isArray(res.data)) setDocs(res.data);
      else setDocs([]);
    } catch { setDocs([]); }
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const verifyDoc = async (id: string) => {
    setVerifying(id); setError('');
    try {
      const res = await apiRequest(`/admin/documents/${id}/verify`, { method: 'PATCH' });
      if (res.success) setDocs((prev) => prev.filter((d) => d.id !== id));
      else setError((res as any).message || (res as any).error || '');
    } catch { setError(t('errorLoading')); }
    setVerifying(null);
  };

  const rejectDoc = async (id: string) => {
    if (!confirm(t('rejectConfirm'))) return;
    setRejecting(id); setError('');
    try {
      const res = await apiRequest(`/admin/documents/${id}`, { method: 'DELETE' });
      if (res.success) setDocs((prev) => prev.filter((d) => d.id !== id));
      else setError((res as any).message || (res as any).error || '');
    } catch { setError(t('errorLoading')); }
    setRejecting(null);
  };

  const docUrl = (doc: any) => getAvatarUrl(`uploads/documents/${doc.fileName}`);

  if (loading) return <p>{t('loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('pendingDocumentsTitle')}</h1>
      <p className="mt-1 text-sm text-gray-500">{t('reviewCertificates')}</p>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {docs.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex items-center justify-center gap-2 p-8 text-gray-400">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {t('noPendingDocuments')}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{doc.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {doc.teacher?.user?.fullName || t('teacher')} — {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={docUrl(doc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <ExternalLink className="h-4 w-4" /> {t('view')}
                  </a>
                  <button
                    onClick={() => rejectDoc(doc.id)}
                    disabled={rejecting === doc.id}
                    className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {rejecting === doc.id ? t('rejecting') : <><XCircle className="h-4 w-4" /> {t('reject')}</>}
                  </button>
                  <button
                    onClick={() => verifyDoc(doc.id)}
                    disabled={verifying === doc.id}
                    className="flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
                  >
                    {verifying === doc.id ? t('verifying') : <><CheckCircle className="h-4 w-4" /> {t('verify')}</>}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
