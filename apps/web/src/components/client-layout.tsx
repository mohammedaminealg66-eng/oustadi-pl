'use client';

import { LiveNotifier } from './live-notifier';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LiveNotifier />
    </>
  );
}
