'use client';

import { LiveNotifier } from './live-notifier';

export function NotifierShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LiveNotifier />
    </>
  );
}
