import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
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
  
  return (
    <nav className={cn('flex items-center space-x-2 rtl:space-x-reverse text-xs font-black uppercase tracking-widest text-gray-400 mb-6', className)}>
      <Link href="/" className="hover:text-primary-600 transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          <ChevronRight className={cn('h-3 w-3 opacity-50', isRtl && 'rotate-180')} />
          {item.href ? (
            <Link href={item.href} className="hover:text-primary-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
