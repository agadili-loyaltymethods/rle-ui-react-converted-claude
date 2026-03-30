/**
 * CrudDialog — generic add/edit modal replacing AngularJS $uibModal add dialogs.
 *
 * Usage:
 *   <CrudDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Add Segment"
 *     fields={[{ key: 'name', label: 'Name', required: true }, ...]}
 *     initialValues={{ name: '', type: '' }}
 *     onSubmit={async (values) => { await segmentsApi.create(values); }}
 *     onSuccess={(created) => setData(prev => [...prev, created])}
 *   />
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ErrorMessage } from './ErrorMessage';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string;
}

interface CrudDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: FieldDef[];
  initialValues?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => Promise<unknown>;
  /** Called with the API response data after successful submit */
  onSuccess?: (data: unknown) => void;
  submitLabel?: string;
}

const baseFieldClass =
  'flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors';

export function CrudDialog({
  open,
  onOpenChange,
  title,
  fields,
  initialValues = {},
  onSubmit,
  onSuccess,
  submitLabel = 'Save',
}: CrudDialogProps) {
  const buildEmpty = () =>
    fields.reduce<Record<string, string>>((acc, f) => {
      acc[f.key] = initialValues[f.key] ?? f.defaultValue ?? '';
      return acc;
    }, {});

  const [values, setValues] = useState<Record<string, string>>(buildEmpty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(buildEmpty());
      setError(null);
    }
  }, [open]);

  const set = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const validate = (): string | null => {
    for (const f of fields) {
      if (f.required && !values[f.key]?.trim()) {
        return `"${f.label}" is required.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError(null);
    try {
      const result = await onSubmit(values);
      onSuccess?.(result);
      onOpenChange(false);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <div className="space-y-4 py-2">
            {error && <ErrorMessage message={error} />}

            {fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key} className="text-sm font-medium text-slate-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-0.5">*</span>
                  )}
                </Label>

                {field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    className={`${baseFieldClass} min-h-[88px] resize-none`}
                    placeholder={field.placeholder}
                    autoComplete="off"
                    value={values[field.key] ?? ''}
                    onChange={(e) => set(field.key, e.target.value)}
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.key}
                    className={`${baseFieldClass} h-9 cursor-pointer appearance-none`}
                    value={values[field.key] ?? ''}
                    onChange={(e) => set(field.key, e.target.value)}
                  >
                    <option value="">Select…</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type ?? 'text'}
                    placeholder={field.placeholder}
                    value={values[field.key] ?? ''}
                    onChange={(e) => set(field.key, e.target.value)}
                    className="h-9"
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="mt-5 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Saving…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
