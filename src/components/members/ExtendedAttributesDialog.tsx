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

interface ExtField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  acceptData?: boolean;
  category?: string;
}

interface ExtendedAttributesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extSchema: Record<string, unknown> | null;
  initialData: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => void;
}

function toLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

function getExtFields(extSchema: Record<string, unknown> | null): ExtField[] {
  if (!extSchema) return [];

  // extSchema may be { extSchema: { properties: {...} } } or { properties: {...} }
  const schema = (extSchema as Record<string, unknown>);
  const props =
    (schema.extSchema as Record<string, unknown>)?.properties ||
    (schema.properties as Record<string, unknown>) ||
    schema;

  if (!props || typeof props !== 'object') return [];

  return Object.entries(props)
    .filter(([, def]) => {
      const d = def as Record<string, unknown>;
      return d.acceptData !== false;
    })
    .map(([key, def]) => {
      const d = def as Record<string, unknown>;
      return {
        key,
        label: (d.title as string) || toLabel(key),
        type: (d.type as string) || 'string',
        required: d.required === true,
        acceptData: d.acceptData !== false,
        category: d.category as string | undefined,
      };
    });
}

export function ExtendedAttributesDialog({
  open,
  onOpenChange,
  extSchema,
  initialData,
  onSave,
}: ExtendedAttributesDialogProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (open) {
      setValues({ ...initialData });
    }
  }, [open, initialData]);

  const fields = getExtFields(extSchema);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(values);
    onOpenChange(false);
  };

  if (fields.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Extended Attributes</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 py-4">No extended attributes available.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Group by category if categories exist
  const categories = [...new Set(fields.map((f) => f.category || ''))];
  const hasTabs = categories.some((c) => c !== '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Extended Attributes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {hasTabs ? (
            categories.map((cat) => (
              <div key={cat || '_default'}>
                {cat && (
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">{toLabel(cat)}</h4>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fields
                    .filter((f) => (f.category || '') === cat)
                    .map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label htmlFor={`ext-${field.key}`}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                          id={`ext-${field.key}`}
                          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                          value={String(values[field.key] ?? '')}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label htmlFor={`ext-${field.key}`}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={`ext-${field.key}`}
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    value={String(values[field.key] ?? '')}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
