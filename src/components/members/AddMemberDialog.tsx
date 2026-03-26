/**
 * AddMemberDialog — full Add Member form matching AngularJS uiDef.
 *
 * Fields (from member.js uiDef):
 *   firstName*, lastName*, email, cellPhone, gender, dob, type*,
 *   address, city, state, country, zipCode,
 *   enrollDate*, enrollLocation, enrollSource*, status,
 *   program*, referralCode, canPreview
 * Hidden: acquisitionChannel='Web', enrollChannel='Web'
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
import { ErrorMessage } from '../common/ErrorMessage';
import { membersApi } from '../../api/resources/members.api';
import { programsApi } from '../../api/resources/programs.api';
import { enumsApi } from '../../api/resources/reference-data.api';
import { ExtendedAttributesDialog } from './ExtendedAttributesDialog';

interface SelectOption {
  value: string;
  label: string;
}

interface Program {
  _id: string;
  name: string;
}

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (member: unknown) => void;
}

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  cellPhone: '',
  gender: '',
  dob: '',
  type: '',
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  enrollDate: '',
  enrollLocation: '',
  enrollSource: '',
  status: '',
  program: '',
  referralCode: '',
  canPreview: false,
};

async function loadEnum(type: string, excludeValues?: string[]): Promise<SelectOption[]> {
  try {
    // locale: 'en' ensures only English labels are returned (matches AngularJS utils.getSessionLanguage())
    const res = await enumsApi.getAll({
      query: JSON.stringify({ type, lang: 'en' }),
      sort: 'label',
      select: 'value,label',
      locale: 'en',
    });
    const records: SelectOption[] = Array.isArray(res.data) ? res.data : [];
    return excludeValues
      ? records.filter((r) => !excludeValues.includes(r.value))
      : records;
  } catch {
    return [];
  }
}

export function AddMemberDialog({ open, onOpenChange, onSuccess }: AddMemberDialogProps) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [extData, setExtData] = useState<Record<string, unknown>>({});
  const [extOpen, setExtOpen] = useState(false);
  const [extSchema, setExtSchema] = useState<Record<string, unknown> | null>(null);
  const [hasExtAttributes, setHasExtAttributes] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [genderOptions, setGenderOptions] = useState<SelectOption[]>([]);
  const [memberTypeOptions, setMemberTypeOptions] = useState<SelectOption[]>([]);
  const [enrollSourceOptions, setEnrollSourceOptions] = useState<SelectOption[]>([]);
  const [statusOptions, setStatusOptions] = useState<SelectOption[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    if (!open) return;
    setForm({ ...INITIAL_FORM });
    setExtData({});
    setError(null);

    // Load all enum options and programs in parallel
    Promise.all([
      loadEnum('Gender'),
      loadEnum('MemberType'),
      loadEnum('EnrollSource'),
      loadEnum('MemberStatusType', ['Anonymous']),
      programsApi.getAll({ sort: 'name' }).then((r) => (Array.isArray(r.data) ? r.data : [])).catch(() => []),
      membersApi.getExtensionSchema().then((r) => r.data).catch(() => null),
    ]).then(([gender, memberType, enrollSource, status, progs, extSch]) => {
      setGenderOptions(gender);
      setMemberTypeOptions(memberType);
      setEnrollSourceOptions(enrollSource);
      setStatusOptions(status);
      setPrograms(progs as Program[]);

      // Check if extended attributes are available
      if (extSch) {
        const memberSchema =
          (extSch as Record<string, unknown>).Member ||
          extSch;
        setExtSchema(memberSchema as Record<string, unknown>);

        // Check if any field has acceptData = true
        const props =
          ((memberSchema as Record<string, unknown>).extSchema as Record<string, unknown>)?.properties ||
          (memberSchema as Record<string, unknown>).properties;
        if (props && typeof props === 'object') {
          const hasAcceptData = Object.values(props as Record<string, unknown>).some(
            (v) => (v as Record<string, unknown>).acceptData !== false
          );
          setHasExtAttributes(hasAcceptData);
        }
      }

      // Default type to second enum value if available (matches AngularJS)
      if (memberType.length > 1) {
        setForm((prev) => ({ ...prev, type: memberType[1]?.value || '' }));
      }
      // Default enrollSource to 'Unknown' if available
      setForm((prev) => ({ ...prev, enrollSource: prev.enrollSource || 'Unknown' }));
    });
  }, [open]);

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): string | null => {
    if (!form.firstName.trim()) return '"First Name" is required.';
    if (!form.type) return '"Member Type" is required.';
    if (!form.enrollDate) return '"Enroll Date" is required.';
    if (!form.program) return '"Participate in a program" is required.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        ...form,
        acquisitionChannel: 'Web',
        enrollChannel: 'Web',
      };

      // Remove empty strings so API doesn't get blank optional fields
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '' || payload[k] === null) delete payload[k];
      });

      // Attach extended attributes if any were set
      const filledExt = Object.fromEntries(
        Object.entries(extData).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      if (Object.keys(filledExt).length > 0) {
        payload.ext = filledExt;
      }

      const res = await membersApi.create(payload as Parameters<typeof membersApi.create>[0]);
      onSuccess(res.data);
      onOpenChange(false);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate autoComplete="off">
            <div className="space-y-4 py-2">
              {error && <ErrorMessage message={error} />}

              {/* Row 1: firstName, lastName */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="am-firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input id="am-firstName" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="First Name" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-lastName">Last Name</Label>
                  <Input id="am-lastName" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Last Name" />
                </div>
              </div>

              {/* Row 2: email, cellPhone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="am-email">Email Address</Label>
                  <Input id="am-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Email Address" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-cellPhone">Phone Number</Label>
                  <Input id="am-cellPhone" value={form.cellPhone} onChange={(e) => set('cellPhone', e.target.value)} placeholder="Phone Number" />
                </div>
              </div>

              {/* Row 3: gender, dob, type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="am-gender">Gender</Label>
                  <select
                    id="am-gender"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.gender}
                    onChange={(e) => set('gender', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {genderOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-dob">Date of Birth</Label>
                  <Input id="am-dob" type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-type">Member Type <span className="text-red-500">*</span></Label>
                  <select
                    id="am-type"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.type}
                    onChange={(e) => set('type', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {memberTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: address, city, state */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="am-address">Address</Label>
                  <Input id="am-address" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Address" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-city">City</Label>
                  <Input id="am-city" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="City" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-state">State</Label>
                  <Input id="am-state" value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="State" />
                </div>
              </div>

              {/* Row 5: country, zipCode, enrollDate */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="am-country">Country</Label>
                  <Input id="am-country" value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Country" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-zipCode">Zip Code</Label>
                  <Input id="am-zipCode" value={form.zipCode} onChange={(e) => set('zipCode', e.target.value)} placeholder="Zip Code" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-enrollDate">Enroll Date <span className="text-red-500">*</span></Label>
                  <Input id="am-enrollDate" type="date" value={form.enrollDate} onChange={(e) => set('enrollDate', e.target.value)} />
                </div>
              </div>

              {/* Row 6: enrollLocation, enrollSource, status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="am-enrollLocation">Enroll Location</Label>
                  <Input id="am-enrollLocation" value={form.enrollLocation} onChange={(e) => set('enrollLocation', e.target.value)} placeholder="Enroll Location" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-enrollSource">Enroll Source</Label>
                  <select
                    id="am-enrollSource"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.enrollSource}
                    onChange={(e) => set('enrollSource', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {enrollSourceOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-status">Status</Label>
                  <select
                    id="am-status"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.status}
                    onChange={(e) => set('status', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {statusOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 7: program, referralCode, canPreview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="am-program">Participate in a Program <span className="text-red-500">*</span></Label>
                  <select
                    id="am-program"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.program}
                    onChange={(e) => set('program', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {programs.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-referralCode">Referral Code</Label>
                  <Input id="am-referralCode" value={form.referralCode} onChange={(e) => set('referralCode', e.target.value)} placeholder="Referral Code" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="am-canPreview">Can Preview</Label>
                  <div className="flex items-center gap-2 h-9">
                    <input
                      id="am-canPreview"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={form.canPreview}
                      onChange={(e) => set('canPreview', e.target.checked)}
                    />
                    <span className="text-sm">{form.canPreview ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Extended Attributes button */}
              {hasExtAttributes && (
                <div>
                  <Button type="button" variant="outline" onClick={() => setExtOpen(true)}>
                    Extended Attributes
                  </Button>
                  {Object.keys(extData).length > 0 && (
                    <span className="ml-2 text-sm text-green-600">
                      {Object.keys(extData).length} extended attribute(s) set
                    </span>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ExtendedAttributesDialog
        open={extOpen}
        onOpenChange={setExtOpen}
        extSchema={extSchema}
        initialData={extData}
        onSave={setExtData}
      />
    </>
  );
}
