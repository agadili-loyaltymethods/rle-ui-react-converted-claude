import React from 'react';
import { cn } from '../../utils/cn';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 gap-3', className)}>
      <div className="relative h-9 w-9">
        <div className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
        <div className="absolute inset-0 rounded-full border-[3px] border-blue-600 border-t-transparent animate-spin" />
      </div>
      <span className="text-sm text-slate-400 font-medium">Loading…</span>
    </div>
  );
}
