'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@oustadi/ui';
import { CheckCircle, ShieldCheck } from 'lucide-react';

export function VerifiedBadge({ className }: { className?: string }) {
  const t = useTranslations('teacher');
  return (
    <Badge variant="success" className={className}>
      <CheckCircle className="ml-1 h-3 w-3" />
      {t('verified')}
    </Badge>
  );
}

export function OfficialBadge({ className }: { className?: string }) {
  const t = useTranslations('teacher');
  return (
    <Badge variant="info" className={className}>
      <ShieldCheck className="ml-1 h-3 w-3" />
      {t('officialTeacher')}
    </Badge>
  );
}
