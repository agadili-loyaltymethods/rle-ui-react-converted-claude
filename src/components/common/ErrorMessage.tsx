import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function ErrorMessage({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700',
        className
      )}
    >
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      <span className="text-sm leading-relaxed">{message}</span>
    </div>
  );
}
