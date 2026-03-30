import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  open, onOpenChange, title, description,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, variant = 'default',
}: ConfirmDialogProps) {
  const Icon = variant === 'destructive' ? AlertTriangle : Info;
  const iconClass = variant === 'destructive'
    ? 'text-red-500 bg-red-50 border-red-100'
    : 'text-blue-500 bg-blue-50 border-blue-100';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border ${iconClass}`}>
              <Icon size={17} />
            </div>
            <DialogTitle className="text-base">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <p className="text-sm text-slate-500 leading-relaxed pl-12">{description}</p>
        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            size="sm"
            onClick={() => { onConfirm(); onOpenChange(false); }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
