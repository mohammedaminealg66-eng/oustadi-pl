'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Card, CardContent } from '@oustadi/ui';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminDocuments() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  const fetchDocs = async () => {
    const res = await apiRequest('/admin/documents/pending');
    if (res.success && Array.isArray(res.data)) setDocs(res.data);
    else setDocs([]);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const verifyDoc = async (id: string) => {
    setVerifying(id);
    await apiRequest(`/admin/documents/${id}/verify`, { method: 'PATCH' });
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setVerifying(null);
  };

  if (loading) return <p>جار التحميل...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">الوثائق غير الموثقة</h1>
      <p className="mt-1 text-sm text-gray-500">مراجعة وتوثيق شهادات الأساتذة</p>
      {docs.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex items-center justify-center gap-2 p-8 text-gray-400">
            <CheckCircle className="h-5 w-5 text-green-500" />
            لا توجد وثائق في انتظار التحقق
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{doc.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {doc.teacher?.user?.fullName || 'غير معروف'} — {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => verifyDoc(doc.id)}
                  disabled={verifying === doc.id}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {verifying === doc.id ? 'جاري...' : <><CheckCircle className="h-4 w-4" /> توثيق</>}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
