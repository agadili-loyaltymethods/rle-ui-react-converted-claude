import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { AddMemberDialog } from '../../components/members/AddMemberDialog';
import { membersApi, Member, MemberSearchParams } from '../../api/resources/members.api';
import { uiFlags } from '../../config/app.config';

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_LIMIT = 10;

// Populate / select matching AngularJS queryData exactly
const POPULATE_PARAM = JSON.stringify([
  { path: 'program', select: 'name' },
  { path: 'purses.policyId', select: 'colors ptMultiplier' },
  { path: 'divisions' },
]);
const SELECT_PARAM = JSON.stringify({
  activities: 0,
  events: 0,
  badges: 0,
  rewards: 0,
  'purses.accruals': 0,
  'purses.redemptions': 0,
});
const SORT_PARAM = JSON.stringify({ _id: -1 });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(val: unknown): string {
  if (!val) return '';
  try {
    const d = new Date(val as string);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
  } catch {
    return String(val);
  }
}

function getPrimaryTierName(row: Member): string {
  const tiers = row.tiers;
  if (!Array.isArray(tiers) || !tiers.length) return '';
  const primary = tiers.find((t) => t.primary) || tiers[0];
  return primary?.level?.name || '';
}

function getPrimaryPurseBalance(row: Member): string {
  const purses = row.purses;
  if (!Array.isArray(purses) || !purses.length) return '';
  const primary = purses.find((p) => p.primary) || purses[0];
  if (!primary) return '';
  const multiplier = primary.policyId?.ptMultiplier || 1;
  let balance = primary.availBalance ?? 0;
  if (Array.isArray(primary.lockedPoints)) {
    primary.lockedPoints.forEach((lp: unknown) => {
      const l = lp as { lockedTillDate?: string; points?: number };
      if (l.lockedTillDate && new Date(l.lockedTillDate).getTime() > Date.now()) {
        balance -= l.points ?? 0;
      }
    });
  }
  return String(balance / multiplier);
}

function getProgramName(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'object' && val !== null && 'name' in val) {
    return (val as { name?: string }).name || '';
  }
  return String(val);
}

function getDivisionsStr(val: unknown): string {
  if (!Array.isArray(val)) return String(val ?? '');
  return val
    .map((d) =>
      typeof d === 'object' && d !== null ? (d as { name?: string }).name || '' : String(d)
    )
    .filter(Boolean)
    .join(', ');
}

function getObjectLogin(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'object' && val !== null && 'login' in val)
    return (val as { login?: string }).login || '';
  return String(val);
}

function toTitleCase(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

// ─── Hidden / pre-defined field sets ─────────────────────────────────────────
const HIDDEN_FIELDS = new Set([
  'accruals', 'redemptions', '$$hashkey', '__b', '__v', 'hasdefaults',
  'enrolllocation', 'originalmemberid', 'org', 'details', 'timestamp',
  'activities', 'events', 'badges', 'rewards', 'tiers', 'purses',
  'loyaltyids', 'customers', 'linkedmembers', 'memberid', 'ext',
]);

const PREDEFINED_KEYS = new Set([
  '_id', 'id', 'firstName', 'lastName', 'email', 'cellPhone', 'phone',
  'address', 'type', 'enrollDate', 'program', 'status',
  'lastActivityDate', 'enrollChannel', 'acquisitionChannel', 'acquisitionDate',
  'dob', 'createdAt', 'updatedAt', 'zipCode', 'canPreview',
  'createdBy', 'updatedBy', 'divisions', 'loyaltyId',
  'tiers', 'purses', 'enrollSource', 'enrollLocation', 'gender',
  'city', 'state', 'country', 'referralCode',
]);

// ─── Base columns (AngularJS listDef pos 3–10 + detailListDef) ───────────────
const BASE_COLUMNS: Column<Record<string, unknown>>[] = [
  // listDef
  { key: '_name',  header: 'Name',         render: (_, r) => { const m = r as unknown as Member; return `${m.firstName||''} ${m.lastName||''}`.trim() || '—'; } },
  { key: 'address', header: 'Address' },
  { key: 'cellPhone', header: 'Phone' },
  { key: '_tier',  header: 'Tier',         render: (_, r) => getPrimaryTierName(r as unknown as Member) },
  { key: '_purse', header: 'Purse',        render: (_, r) => getPrimaryPurseBalance(r as unknown as Member) },
  { key: 'type',   header: 'Type' },
  { key: 'enrollDate', header: 'Enroll Date', render: (v) => formatDate(v) },
  { key: 'program', header: 'Program',     render: (v) => getProgramName(v) },
  // detailListDef
  { key: 'status', header: 'Status',       render: (v) => <Badge variant={String(v).toLowerCase()==='active'?'success':'secondary'}>{String(v||'')}</Badge> },
  { key: 'firstName', header: 'First Name' },
  { key: 'lastName',  header: 'Last Name' },
  { key: 'email',     header: 'Email' },
  { key: 'lastActivityDate', header: 'Last Activity Date', render: (v) => formatDate(v) },
  { key: 'enrollChannel',    header: 'Enroll Channel' },
  { key: 'acquisitionChannel', header: 'Acquisition Channel' },
  { key: 'acquisitionDate',    header: 'Acquisition Date', render: (v) => formatDate(v) },
  { key: 'dob',       header: 'Date of Birth', render: (v) => formatDate(v) },
  { key: 'createdAt', header: 'Created At',    render: (v) => formatDate(v) },
  { key: 'updatedAt', header: 'Updated At',    render: (v) => formatDate(v) },
  { key: 'zipCode',   header: 'Zip Code' },
  { key: 'canPreview',header: 'Can Preview',   render: (v) => String(v ?? '') },
  { key: 'createdBy', header: 'Created By',    render: (v) => getObjectLogin(v) },
  { key: 'updatedBy', header: 'Updated By',    render: (v) => getObjectLogin(v) },
  { key: 'divisions', header: 'Divisions',     render: (v) => getDivisionsStr(v) },
  { key: 'loyaltyId', header: 'Loyalty ID' },
];

// Build deduplicated base column list
const SEEN = new Set<string>();
const MEMBER_BASE_COLUMNS = BASE_COLUMNS.filter((c) => {
  if (SEEN.has(c.key as string)) return false;
  SEEN.add(c.key as string);
  return true;
});

// ─── Extension-schema column builder ─────────────────────────────────────────
interface ExtSchemaProp {
  type?: string;
  title?: string;
  acceptData?: boolean;
}

function buildExtSchemaColumns(
  schema: Record<string, unknown> | null
): Column<Record<string, unknown>>[] {
  if (!schema) return [];
  // schema may be { Member: { extSchema: { properties: {...} } } } or { extSchema: { properties: {...} } }
  const memberSchema =
    (schema as Record<string, unknown>).Member as Record<string, unknown> | undefined
    ?? schema;
  const extSchema = (memberSchema?.extSchema as Record<string, unknown>)?.properties
    ?? (memberSchema?.properties as Record<string, unknown>);
  if (!extSchema || typeof extSchema !== 'object') return [];

  return Object.entries(extSchema)
    .filter(([, def]) => {
      const d = def as ExtSchemaProp;
      return d.acceptData !== false;
    })
    .map(([key, def]) => {
      const d = def as ExtSchemaProp;
      const header = d.title || toTitleCase(key);
      return {
        key: `_ext_${key}`,
        header,
        render: (_val: unknown, row: Record<string, unknown>) => {
          const ext = (row as unknown as Member).ext;
          const v = ext?.[key];
          if (v === undefined || v === null) return '';
          if (typeof v === 'object') return JSON.stringify(v);
          return String(v);
        },
      };
    });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MembersPage() {
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<MemberSearchParams>({});
  const [addOpen, setAddOpen] = useState(false);

  // Server-side pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [pageLimit, setPageLimit] = useState(DEFAULT_PAGE_LIMIT);

  // Extension schema columns (fetched once on mount)
  const [extSchema, setExtSchema] = useState<Record<string, unknown> | null>(null);

  // ─── Fetch extension schema on mount ───────────────────────────────────────
  useEffect(() => {
    membersApi
      .getExtensionSchema()
      .then((res) => setExtSchema(res.data as Record<string, unknown>))
      .catch(() => setExtSchema(null));
  }, []);

  // ─── Build full column list ─────────────────────────────────────────────────
  const extSchemaColumns = useMemo(
    () => buildExtSchemaColumns(extSchema),
    [extSchema]
  );

  const dynamicColumns = useMemo<Column<Record<string, unknown>>[]>(() => {
    if (!members.length) return [];
    const extraKeys = new Set<string>();
    members.forEach((m) => {
      Object.keys(m).forEach((k) => {
        if (
          !PREDEFINED_KEYS.has(k) &&
          !HIDDEN_FIELDS.has(k.toLowerCase()) &&
          !Array.isArray((m as Record<string, unknown>)[k])
        ) {
          extraKeys.add(k);
        }
      });
    });
    return Array.from(extraKeys).sort().map((k) => ({
      key: k,
      header: toTitleCase(k),
      render: (val: unknown) => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      },
    }));
  }, [members]);

  const allColumns = useMemo(
    () => [...MEMBER_BASE_COLUMNS, ...extSchemaColumns, ...dynamicColumns],
    [extSchemaColumns, dynamicColumns]
  );

  // ─── Core fetch function ────────────────────────────────────────────────────
  const fetchMembers = useCallback(
    async (params: MemberSearchParams, pageNum: number, limit: number) => {
      setLoading(true);
      setError(null);
      const skip = (pageNum - 1) * limit;
      try {
        // Bundle search fields into query JSON — matches AngularJS queryData format
        const queryFilter: Record<string, unknown> = {};
        if (params.firstName) queryFilter.firstName = params.firstName;
        if (params.lastName)  queryFilter.lastName  = params.lastName;
        if (params.email)     queryFilter.email     = params.email;
        if (params.cellPhone) queryFilter.cellPhone = params.cellPhone;
        if (params.loyaltyId) queryFilter.loyaltyId = params.loyaltyId;

        const apiParams: MemberSearchParams = {
          limit,
          skip,
          locale: 'en',
          populate: POPULATE_PARAM,
          select: SELECT_PARAM,
          sort: SORT_PARAM,
        };
        if (Object.keys(queryFilter).length > 0) {
          apiParams.query = JSON.stringify(queryFilter);
        }

        const res = await membersApi.search(apiParams);
        const rows = Array.isArray(res.data) ? res.data : ([res.data].filter(Boolean) as Member[]);
        setMembers(rows);
        setHasMore(rows.length === limit);
      } catch (err: unknown) {
        setError((err as { message?: string })?.message || 'Load failed');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── Auto-load on mount (default members list) ─────────────────────────────
  useEffect(() => {
    fetchMembers({}, 1, pageLimit);
  }, [fetchMembers]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Search handler ─────────────────────────────────────────────────────────
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setPage(1);
    fetchMembers(searchParams, 1, pageLimit);
  };

  const handleClear = () => {
    setSearchParams({});
    setPage(1);
    fetchMembers({}, 1, pageLimit);
  };

  const handlePage = (next: number) => {
    setPage(next);
    fetchMembers(searchParams, next, pageLimit);
  };

  const handlePageLimitChange = (newLimit: number) => {
    setPageLimit(newLimit);
    setPage(1);
    fetchMembers(searchParams, 1, newLimit);
  };

  const handleAddSuccess = (created: unknown) => {
    setMembers((prev) => [created as Member, ...prev]);
  };

  return (
    <div>
      <PageHeader
        title="Members"
        description="Search and manage loyalty program members"
        actions={
          <Button onClick={() => setAddOpen(true)}>Add Member</Button>
        }
      />

      {/* ─── Search form ─────────────────────────────────────────────────── */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {!uiFlags.disableSearchFLName && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="First Name"
                      value={searchParams.firstName || ''}
                      onChange={(e) => setSearchParams((p) => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last Name"
                      value={searchParams.lastName || ''}
                      onChange={(e) => setSearchParams((p) => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                </>
              )}
              {!uiFlags.disableSearchPhone && (
                <div className="space-y-1">
                  <Label htmlFor="cellPhone">Phone Number</Label>
                  <Input
                    id="cellPhone"
                    placeholder="Phone Number"
                    value={searchParams.cellPhone || ''}
                    onChange={(e) => setSearchParams((p) => ({ ...p, cellPhone: e.target.value }))}
                  />
                </div>
              )}
              {!uiFlags.disableSearchEmail && (
                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={searchParams.email || ''}
                    onChange={(e) => setSearchParams((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="loyaltyId">Loyalty ID</Label>
                <Input
                  id="loyaltyId"
                  placeholder="Loyalty ID Code"
                  value={searchParams.loyaltyId || ''}
                  onChange={(e) => setSearchParams((p) => ({ ...p, loyaltyId: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button type="submit" disabled={loading}>
                <Search size={16} className="mr-2" />
                {loading ? 'Searching…' : 'Search'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                Remove
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && <ErrorMessage message={error} />}
      {loading && <LoadingSpinner />}

      {!loading && (
        <>
          <div className="overflow-x-auto">
            <DataTable
              data={members as unknown as Record<string, unknown>[]}
              columns={allColumns}
              searchable={false}
              showRowsPerPage={false}
              pageSize={pageLimit}
              onRowClick={(row) => {
                const id = (row as Member)._id || (row as Member).id;
                if (id) navigate(`/details/${id}`);
              }}
              emptyMessage="No members found."
            />
          </div>

          {/* ─── Server-side pagination ──────────────────────────────────── */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap">Rows per page:</span>
              <select
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                value={pageLimit}
                onChange={(e) => handlePageLimitChange(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePage(page - 1)}
              >
                <ChevronLeft size={14} />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => handlePage(page + 1)}
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ─── Add Member Dialog ────────────────────────────────────────────── */}
      <AddMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
