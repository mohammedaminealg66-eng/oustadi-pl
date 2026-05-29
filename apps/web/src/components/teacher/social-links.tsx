'use client';

import { useTranslations } from 'next-intl';
import { 
  Facebook, Instagram, Linkedin, Youtube, 
  Send, Globe, MessageSquare, Music
} from 'lucide-react';
import { cn } from '@oustadi/ui';

interface SocialLinksProps {
  links: {
    facebook?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
    twitter?: string | null;
    telegram?: string | null;
    website?: string | null;
  };
  className?: string;
}

export function SocialLinks({ links, className }: SocialLinksProps) {
  const t = useTranslations('teacher');

  const platforms = [
    { key: 'youtube', icon: Youtube, color: 'hover:text-[#FF0000]', label: t('youtube'), url: links.youtube },
    { key: 'facebook', icon: Facebook, color: 'hover:text-[#1877F2]', label: t('facebook'), url: links.facebook },
    { key: 'instagram', icon: Instagram, color: 'hover:text-[#E4405F]', label: t('instagram'), url: links.instagram },
    { key: 'tiktok', icon: Music, color: 'hover:text-[#000000]', label: t('tiktok'), url: links.tiktok },
    { key: 'linkedin', icon: Linkedin, color: 'hover:text-[#0A66C2]', label: t('linkedin'), url: links.linkedin },
    { key: 'twitter', icon: MessageSquare, color: 'hover:text-[#000000]', label: t('twitter'), url: links.twitter },
    { key: 'telegram', icon: Send, color: 'hover:text-[#0088cc]', label: t('telegram'), url: links.telegram },
    { key: 'website', icon: Globe, color: 'hover:text-primary-600', label: t('website'), url: links.website },
  ];

  const activePlatforms = platforms.filter(p => !!p.url);

  if (activePlatforms.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-4", className)}>
      {activePlatforms.map((p) => (
        <a
          key={p.key}
          href={p.url!}
          target="_blank"
          rel="noopener noreferrer"
          title={p.label}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 transition-all hover:bg-white hover:shadow-xl hover:scale-110 active:scale-95 border border-gray-100",
            p.color
          )}
        >
          <p.icon className="h-6 w-6" />
        </a>
      ))}
    </div>
  );
}
