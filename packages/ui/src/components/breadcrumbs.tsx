import React from 'react';
import { cn } from '../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  locale?: string;
}

export function Breadcrumbs({ items, className, locale = 'ar' }: BreadcrumbsProps) {
  const isRtl = locale === 'ar';
  const separator = isRtl ? '\u200F' : '\u200E';
  
  return (
    <nav className={cn('flex items-center gap-1.5 text-xs text-gray-400 mb-6', className)}>
      <a href="/" className="hover:text-primary-600 transition-colors">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      </a>
      
      {items.map((item) => (
        <React.Fragment key={item.label}>
          <span className={cn('opacity-50', isRtl ? 'rotate-180' : '')}>&rsaquo;</span>
          {item.href ? (
            <a href={item.href} className="hover:text-primary-600 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
