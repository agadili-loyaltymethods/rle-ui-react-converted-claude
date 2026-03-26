import React from 'react';
import { AlertCircle } from 'lucide-react';

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
      <AlertCircle size={16} className="flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
