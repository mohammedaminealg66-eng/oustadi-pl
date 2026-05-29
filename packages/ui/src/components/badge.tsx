import * as React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-primary-600 text-white',
    secondary: 'border-transparent bg-secondary-300 text-secondary-900',
    destructive: 'border-transparent bg-red-600 text-white',
    outline: 'border-gray-200 text-gray-900',
    success: 'border-transparent bg-emerald-100 text-emerald-700',
    warning: 'border-transparent bg-yellow-100 text-yellow-700',
    info: 'border-transparent bg-blue-100 text-blue-700',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
