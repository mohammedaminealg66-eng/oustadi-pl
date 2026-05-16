'use client';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-gray-900">حدث خطأ</h1>
      <p className="text-gray-500">{error.message || 'حدث خطأ غير متوقع'}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
