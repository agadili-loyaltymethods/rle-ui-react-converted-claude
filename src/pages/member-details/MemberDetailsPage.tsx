import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Tag } from 'lucide-react';
import { membersApi, Member } from '../../api/resources/members.api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Badge } from '../../components/ui/badge';
import { DataTable, Column } from '../../components/common/DataTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { apiClient } from '../../api/axios.instance';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMemberInitials(m: Member) {
  return ((m.firstName?.[0] || '') + (m.lastName?.[0] || '')).toUpperCase() || 'M';
}

function formatDate(val: unknown): string {
  if (!val) return '—';
  try {
    const d = new Date(val as string);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
  } catch {
    return String(val);
  }
}

function getProgramName(val: unknown): string {
  if (!val) return '—';
  if (typeof val === 'object' && val !== null && 'name' in val)
    return (val as { name?: string }).name || '—';
  return String(val);
}

// ─── Member populate (matches AngularJS getMemberData) ────────────────────────
const MEMBER_POPULATE = JSON.stringify([
  { path: 'createdBy' },
  { path: 'updatedBy' },
  { path: 'tiers.updatedBy' },
  { path: 'tiers.createdBy' },
  { path: 'purses.updatedBy' },
  { path: 'purses.createdBy' },
  { path: 'badges.updatedBy' },
  { path: 'badges.createdBy' },
  { path: 'streaks.updatedBy' },
  { path: 'streaks.createdBy' },
  { path: 'purses.policyId' },
  { path: 'streaks.policyId', select: 'name description goalPolicies' },
  { path: 'streaks.goals.updatedBy' },
  { path: 'streaks.goals.createdBy' },
  { path: 'divisions' },
]);

// ─── Generic lazy API tab ─────────────────────────────────────────────────────
// Fetches once on mount; shows spinner → table (or empty state).

interface LazyApiTabProps {
  endpoint: string;
  params: Record<string, unknown>;
  columns: Column<Record<string, unknown>>[];
  emptyMsg?: string;
}

function LazyApiTab({ endpoint, params, columns, emptyMsg = 'No data found.' }: LazyApiTabProps) {
  const [rows, setRows]   = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(endpoint, { params })
      .then((res) => setRows(Array.isArray(res.data) ? res.data : []))
      .catch((err: { message?: string }) => setError(err.message ?? 'API error'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;
  if (!rows.length) return (
    <p className="text-center py-12 text-sm text-slate-400">{emptyMsg}</p>
  );
  return <DataTable data={rows} columns={columns} pageSize={10} />;
}

// ─── Generic col: hidden ID + name + status + dates ──────────────────────────
const hiddenId: Column<Record<string, unknown>> = { key: 'id', header: 'ID', hidden: true };
const hiddenMId: Column<Record<string, unknown>> = { key: '_id', header: '_id', hidden: true };
const statusCol: Column<Record<string, unknown>> = {
  key: 'status', header: 'Status',
  render: (v) => <Badge variant={v === 'active' ? 'success' : 'secondary'}>{String(v || '—')}</Badge>,
};
const createdAtCol: Column<Record<string, unknown>> = { key: 'createdAt', header: 'Created At', sortable: true, render: (v) => formatDate(v) };
const updatedAtCol: Column<Record<string, unknown>> = { key: 'updatedAt', header: 'Updated At', sortable: true, render: (v) => formatDate(v) };
const createdByCol: Column<Record<string, unknown>> = { key: 'createdBy', header: 'Created By', render: (v) => { const u = v as {login?:string}|null; return u?.login || String(v??'—'); } };

// ─── Member Summary Card ──────────────────────────────────────────────────────

function MemberSummaryCard({ member }: { member: Member }) {
  const initials = getMemberInitials(member);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 mb-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-700 font-semibold text-base">{initials}</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-tight">
              {member.firstName} {member.lastName}
            </h1>
            {member.email && (
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                <Mail size={12} /> {member.email}
              </p>
            )}
            {(member.cellPhone || member.phone) && (
              <p className="text-sm text-slate-400 flex items-center gap-1">
                <Phone size={12} /> {member.cellPhone || member.phone}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant={String(member.status).toLowerCase() === 'active' ? 'success' : 'secondary'}>
            {member.status || 'Active'}
          </Badge>
          <p className="text-xs text-slate-400 font-mono">ID: {member._id || member.id}</p>
          {member.loyaltyId && (
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Tag size={10} /> {member.loyaltyId}
            </p>
          )}
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar size={10} /> Enrolled {formatDate(member.enrollDate)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 1: Member Details ────────────────────────────────────────────────────

function MemberDetailsTab({ member }: { member: Member }) {
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: 'First Name',          value: member.firstName },
    { label: 'Last Name',           value: member.lastName },
    { label: 'Email',               value: member.email },
    { label: 'Phone',               value: member.cellPhone || member.phone },
    { label: 'Status',              value: <Badge variant={String(member.status).toLowerCase() === 'active' ? 'success' : 'secondary'}>{member.status || '—'}</Badge> },
    { label: 'Type',                value: member.type },
    { label: 'Program',             value: getProgramName(member.program) },
    { label: 'Loyalty ID',          value: member.loyaltyId },
    { label: 'Enroll Date',         value: formatDate(member.enrollDate) },
    { label: 'Enroll Channel',      value: member.enrollChannel },
    { label: 'Acquisition Channel', value: member.acquisitionChannel },
    { label: 'Acquisition Date',    value: formatDate(member.acquisitionDate) },
    { label: 'Last Activity',       value: formatDate(member.lastActivityDate) },
    { label: 'Date of Birth',       value: formatDate(member.dob) },
    { label: 'Gender',              value: member.gender },
    { label: 'Address',             value: member.address },
    { label: 'City',                value: member.city },
    { label: 'State',               value: member.state },
    { label: 'Country',             value: member.country },
    { label: 'Zip Code',            value: member.zipCode },
    { label: 'Referral Code',       value: member.referralCode },
    { label: 'Created At',          value: formatDate(member.createdAt) },
    { label: 'Updated At',          value: formatDate(member.updatedAt) },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(({ label, value }) => (
          <div key={label} className="px-5 py-3 border-b border-slate-100">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
            <p className="text-sm text-slate-800 truncate">{value || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 2: Achievements (17 sub-tabs) ───────────────────────────────────────

type SubTab =
  | 'rewards' | 'purses' | 'purse-histories' | 'badges' | 'tiers'
  | 'streaks' | 'streak-histories' | 'loyalty-ids' | 'referrals'
  | 'transactions' | 'activity' | 'preferences' | 'offers'
  | 'segments' | 'merge-histories' | 'tc' | 'aggregates';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'rewards',         label: 'Rewards'          },
  { key: 'purses',          label: 'Purses'           },
  { key: 'purse-histories', label: 'Purse Histories'  },
  { key: 'badges',          label: 'Badges'           },
  { key: 'tiers',           label: 'Tiers'            },
  { key: 'streaks',         label: 'Streaks'          },
  { key: 'streak-histories',label: 'Streak Histories' },
  { key: 'loyalty-ids',     label: 'Loyalty IDs'      },
  { key: 'referrals',       label: 'Referrals'        },
  { key: 'transactions',    label: 'Transactions'     },
  { key: 'activity',        label: 'Activity'         },
  { key: 'preferences',     label: 'Preferences'      },
  { key: 'offers',          label: 'Offers'           },
  { key: 'segments',        label: 'Segments'         },
  { key: 'merge-histories', label: 'Merge Histories'  },
  { key: 'tc',              label: 'Terms & Conditions'},
  { key: 'aggregates',      label: 'Aggregates'       },
];

// Column sets per sub-tab
const rewardCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'name',        header: 'Name',        sortable: true },
  { key: 'policyId',    header: 'Policy',      render: (v) => { const p = v as {name?:string}|null; return p?.name||String(v??'—'); } },
  { key: 'value',       header: 'Value',       sortable: true },
  statusCol, createdAtCol, updatedAtCol,
];

const purseCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'policyId',     header: 'Policy',      render: (v) => { const p = v as {name?:string}|null; return p?.name||String(v??'—'); } },
  { key: 'availBalance', header: 'Balance',     sortable: true },
  { key: 'primary',      header: 'Primary',     render: (v) => v ? 'Yes' : 'No' },
  createdAtCol, updatedAtCol,
];

const purseHistoryCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'type',        header: 'Type' },
  { key: 'points',      header: 'Points',      sortable: true },
  { key: 'program',     header: 'Program',     render: (v) => { const p = v as {name?:string}|null; return p?.name||String(v??'—'); } },
  { key: 'policyId',    header: 'Policy',      render: (v) => { const p = v as {name?:string}|null; return p?.name||String(v??'—'); } },
  createdByCol, createdAtCol, updatedAtCol,
];

const badgeCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'name',       header: 'Badge',       sortable: true },
  { key: 'earnedDate', header: 'Earned Date', render: (v) => formatDate(v), sortable: true },
  statusCol, createdAtCol,
];

const tierCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'level',     header: 'Tier Level', render: (v) => { const l = v as {name?:string}|null; return l?.name||String(v??'—'); }, sortable: true },
  { key: 'primary',   header: 'Primary',    render: (v) => v ? 'Yes' : 'No' },
  { key: 'startDate', header: 'Start Date', render: (v) => formatDate(v), sortable: true },
  { key: 'endDate',   header: 'End Date',   render: (v) => formatDate(v), sortable: true },
  statusCol,
];

const streakCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'policyId',    header: 'Policy',      render: (v) => { const p = v as {name?:string}|null; return p?.name||String(v??'—'); } },
  { key: 'currentCount',header: 'Current',     sortable: true },
  { key: 'bestCount',   header: 'Best',        sortable: true },
  { key: 'startDate',   header: 'Start Date',  render: (v) => formatDate(v), sortable: true },
  statusCol, updatedAtCol,
];

const streakHistoryCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'policyId',  header: 'Policy',   render: (v) => { const p = v as {name?:string}|null; return p?.name||String(v??'—'); } },
  { key: 'type',      header: 'Type' },
  { key: 'count',     header: 'Count',    sortable: true },
  createdByCol, createdAtCol, updatedAtCol,
];

const loyaltyIdCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'code',       header: 'Code',       sortable: true },
  { key: 'accrueTo',   header: 'Accrue To',  render: (v) => { const p = v as {name?:string}|null; return p?.name||String(v??'—'); } },
  { key: 'primary',    header: 'Primary',    render: (v) => v ? 'Yes' : 'No' },
  statusCol, createdAtCol,
];

const referralCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'referee',    header: 'Referee' },
  { key: 'status',     header: 'Status',    render: (v) => <Badge variant={v === 'processed' ? 'success' : 'secondary'}>{String(v||'—')}</Badge> },
  createdByCol, createdAtCol,
];

const transactionCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'type',        header: 'Type' },
  { key: 'channel',     header: 'Channel' },
  { key: 'value',       header: 'Value',      sortable: true },
  { key: 'currencyCode',header: 'Currency' },
  { key: 'date',        header: 'Date',       render: (v) => formatDate(v), sortable: true },
  { key: 'externalTransactionId', header: 'External TX ID' },
  statusCol, createdAtCol,
];

const activityCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'type',        header: 'Type' },
  { key: 'channel',     header: 'Channel' },
  { key: 'value',       header: 'Value',   sortable: true },
  { key: 'currencyCode',header: 'Currency' },
  { key: 'date',        header: 'Date',    render: (v) => formatDate(v), sortable: true },
  statusCol, createdAtCol,
];

const preferenceCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'category',   header: 'Category' },
  { key: 'name',       header: 'Name',    sortable: true },
  { key: 'value',      header: 'Value' },
  createdByCol, createdAtCol, updatedAtCol,
];

const offerCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'policyId',   header: 'Policy',   render: (v) => { const p = v as {name?:string}|null; return p?.name||String(v??'—'); } },
  { key: 'value',      header: 'Value',    sortable: true },
  { key: 'expiresAt',  header: 'Expires',  render: (v) => formatDate(v), sortable: true },
  statusCol, createdAtCol,
];

const segmentCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'segment',    header: 'Segment',  render: (v) => { const s = v as {name?:string}|null; return s?.name||String(v??'—'); } },
  createdByCol, createdAtCol, updatedAtCol,
];

const mergeHistoryCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'victimId',   header: 'Victim ID' },
  { key: 'type',       header: 'Type' },
  createdByCol, createdAtCol,
];

const tcCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'category',   header: 'Category' },
  { key: 'name',       header: 'Name',    sortable: true },
  { key: 'value',      header: 'Accepted', render: (v) => v ? 'Yes' : 'No' },
  createdAtCol, updatedAtCol,
];

const aggregateCols: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'metricName', header: 'Metric',   sortable: true },
  { key: 'value',      header: 'Value',    sortable: true },
  { key: 'period',     header: 'Period' },
  createdAtCol, updatedAtCol,
];

// Build API params for each sub-tab that needs a fetch
function buildApiConfig(subTab: SubTab, memberId: string): { endpoint: string; params: Record<string, unknown> } | null {
  switch (subTab) {
    case 'rewards':
      return {
        endpoint: '/rewards',
        params: {
          query: JSON.stringify({ member: memberId }),
          populate: JSON.stringify([{ path: 'policyId', select: 'name' }, { path: 'divisions' }]),
        },
      };
    case 'purse-histories':
      return {
        endpoint: '/pursehistories',
        params: {
          query: JSON.stringify({ memberId }),
          populate: JSON.stringify([
            { path: 'createdBy', select: 'login' },
            { path: 'updatedBy', select: 'login' },
            { path: 'program',   select: 'name org' },
            { path: 'policyId',  select: 'escrowDays escrowUnit expiryValue expiryUnit' },
          ]),
        },
      };
    case 'streak-histories':
      return {
        endpoint: '/streakhistories',
        params: {
          query: JSON.stringify({ memberId }),
          populate: JSON.stringify([
            { path: 'createdBy' },
            { path: 'updatedBy' },
            { path: 'policyId', select: 'name description' },
            { path: 'goals.updatedBy' },
            { path: 'goals.createdBy' },
          ]),
        },
      };
    case 'loyalty-ids':
      return {
        endpoint: '/loyaltyids',
        params: {
          query: JSON.stringify({ memberId }),
          populate: JSON.stringify([
            { path: 'accrueTo' },
            { path: 'createdBy' },
            { path: 'updatedBy' },
          ]),
        },
      };
    case 'referrals':
      return {
        endpoint: '/referrals',
        params: {
          query: JSON.stringify({ referrer: memberId }),
          populate: JSON.stringify([{ path: 'createdBy' }, { path: 'updatedBy' }]),
        },
      };
    case 'transactions':
    case 'activity':
      return {
        endpoint: '/activityhistories',
        params: {
          query: JSON.stringify({ $or: [{ memberID: memberId }, { originalMemberID: memberId }] }),
          populate: JSON.stringify([
            { path: 'createdBy', select: 'login' },
            { path: 'updatedBy', select: 'login' },
          ]),
        },
      };
    case 'preferences':
      return {
        endpoint: '/memberpreferences',
        params: {
          query: JSON.stringify({ memberId, category: { $nin: ['T&C'] } }),
          populate: JSON.stringify([{ path: 'createdBy' }, { path: 'updatedBy' }]),
        },
      };
    case 'offers':
      return {
        endpoint: '/offers',
        params: {
          query: JSON.stringify({ member: memberId }),
          populate: JSON.stringify([{ path: 'policyId', select: 'name' }, { path: 'divisions' }]),
        },
      };
    case 'segments':
      return {
        endpoint: '/membersegments',
        params: {
          query: JSON.stringify({ member: memberId }),
          populate: JSON.stringify([
            { path: 'segment' },
            { path: 'createdBy' },
            { path: 'updatedBy' },
            { path: 'divisions' },
          ]),
        },
      };
    case 'merge-histories':
      return {
        endpoint: '/mergehistories',
        params: {
          query: JSON.stringify({ survivorId: memberId }),
          populate: JSON.stringify([{ path: 'createdBy' }, { path: 'updatedBy' }]),
        },
      };
    case 'tc':
      return {
        endpoint: '/memberpreferences',
        params: {
          query: JSON.stringify({ memberId, category: 'T&C' }),
          populate: JSON.stringify([{ path: 'createdBy' }, { path: 'updatedBy' }]),
        },
      };
    case 'aggregates':
      return {
        endpoint: '/memberaggregates',
        params: {
          query: JSON.stringify({ memberId }),
          populate: JSON.stringify([{ path: 'createdBy' }, { path: 'updatedBy' }]),
        },
      };
    default:
      return null; // purses, badges, tiers, streaks come from member object
  }
}

function getSubTabColumns(key: SubTab): Column<Record<string, unknown>>[] {
  switch (key) {
    case 'rewards':          return rewardCols;
    case 'purses':           return purseCols;
    case 'purse-histories':  return purseHistoryCols;
    case 'badges':           return badgeCols;
    case 'tiers':            return tierCols;
    case 'streaks':          return streakCols;
    case 'streak-histories': return streakHistoryCols;
    case 'loyalty-ids':      return loyaltyIdCols;
    case 'referrals':        return referralCols;
    case 'transactions':     return transactionCols;
    case 'activity':         return activityCols;
    case 'preferences':      return preferenceCols;
    case 'offers':           return offerCols;
    case 'segments':         return segmentCols;
    case 'merge-histories':  return mergeHistoryCols;
    case 'tc':               return tcCols;
    case 'aggregates':       return aggregateCols;
  }
}

// Per-sub-tab content: member-object tabs read directly; API tabs use LazyApiTab
function SubTabContent({ subTab, member, memberId }: { subTab: SubTab; member: Member; memberId: string }) {
  const memberData: Record<SubTab, Record<string, unknown>[] | null> = {
    purses:           (member.purses  || []) as Record<string, unknown>[],
    badges:           (member.badges  || []) as Record<string, unknown>[],
    tiers:            (member.tiers   || []) as Record<string, unknown>[],
    streaks:          (member.streaks || []) as Record<string, unknown>[],
    rewards:          null, 'purse-histories': null, 'streak-histories': null,
    'loyalty-ids':    null, referrals: null, transactions: null, activity: null,
    preferences:      null, offers: null, segments: null, 'merge-histories': null,
    tc:               null, aggregates: null,
  };

  const fromMember = memberData[subTab];
  const cols = getSubTabColumns(subTab);

  if (fromMember !== null) {
    if (!fromMember.length) return (
      <p className="text-center py-12 text-sm text-slate-400">No {subTab} data for this member.</p>
    );
    return <DataTable data={fromMember} columns={cols} pageSize={10} />;
  }

  const apiConfig = buildApiConfig(subTab, memberId);
  if (!apiConfig) return null;

  return (
    <LazyApiTab
      endpoint={apiConfig.endpoint}
      params={apiConfig.params}
      columns={cols}
      emptyMsg={`No ${subTab} records found.`}
    />
  );
}

function AchievementsTab({ member, memberId }: { member: Member; memberId: string }) {
  // AngularJS defaults the Achievements section to the "Activity" sub-tab
  const [active, setActive] = useState<SubTab>('activity');

  return (
    <div>
      {/* Sub-tab strip — horizontally scrollable */}
      <div className="border-b border-slate-200 mb-4 overflow-x-auto">
        <nav className="flex -mb-px min-w-max">
          {SUB_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={[
                'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
                active === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Only mount active sub-tab — natural lazy loading */}
      <SubTabContent key={active} subTab={active} member={member} memberId={memberId} />
    </div>
  );
}

// ─── Tab 3: Accruals ──────────────────────────────────────────────────────────
// Root cause fix: API requires "member" field, NOT "memberId"
// Error was: "At least one of the following query parameters is required: _id, member, purse, activity"

const accrualColumns: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'accruedPoints', header: 'Accrued Points',  sortable: true },
  { key: 'burnedPoints',  header: 'Burned Points',   sortable: true },
  { key: 'current',       header: 'Current',         sortable: true },
  { key: 'excessOn',      header: 'Excess On',       render: (v) => formatDate(v) },
  { key: 'expiresOn',     header: 'Expires On',      render: (v) => formatDate(v) },
  { key: 'purse',         header: 'Purse',           render: (v) => { const p = v as {name?:string}|null; return p?.name||String(v??'—'); } },
  { key: 'rule',          header: 'Rule',            render: (v) => { const r = v as {name?:string}|null; return r?.name||String(v??'—'); } },
  createdAtCol,
];

function AccrualsTab({ memberId }: { memberId: string }) {
  return (
    <LazyApiTab
      endpoint="/accrualitems"
      params={{
        query: JSON.stringify({ member: memberId }),     // "member" not "memberId"
        populate: JSON.stringify([
          { path: 'rule',  select: 'name' },
          { path: 'purse', select: 'name' },
        ]),
      }}
      columns={accrualColumns}
      emptyMsg="No accrual records found for this member."
    />
  );
}

// ─── Tab 4: Redemption ────────────────────────────────────────────────────────
// Root cause fix: same — use "member" not "memberId"

const redemptionColumns: Column<Record<string, unknown>>[] = [
  hiddenId, hiddenMId,
  { key: 'rule',       header: 'Rule',        render: (v) => { const r = v as {name?:string}|null; return r?.name||String(v??'—'); } },
  { key: 'purse',      header: 'Purse',       render: (v) => { const p = v as {name?:string}|null; return p?.name||String(v??'—'); } },
  { key: 'points',     header: 'Points',      sortable: true },
  { key: 'dateBurned', header: 'Date Burned', render: (v) => formatDate(v), sortable: true },
  { key: 'details',    header: 'Details' },
  statusCol, createdAtCol,
];

function RedemptionTab({ memberId }: { memberId: string }) {
  return (
    <LazyApiTab
      endpoint="/redemptionitems"
      params={{
        query: JSON.stringify({ member: memberId }),     // "member" not "memberId"
        populate: JSON.stringify([
          { path: 'rule' },
          { path: 'accrual' },
        ]),
      }}
      columns={redemptionColumns}
      emptyMsg="No redemption records found for this member."
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function MemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient
      .get(`/members/${id}`, { params: { populate: MEMBER_POPULATE } })
      .then((res) => setMember(res.data as Member))
      .catch((err: { message?: string }) => setError(err.message ?? 'Failed to load member'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;
  if (!member) return null;

  const memberId = (member._id || member.id || id)!;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Members
      </button>

      <MemberSummaryCard member={member} />

      <Tabs defaultValue="details">
        <TabsList className="mb-2 flex-wrap h-auto gap-1">
          <TabsTrigger value="details">Member Details</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="accruals">Accruals</TabsTrigger>
          <TabsTrigger value="redemption">Redemption</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <MemberDetailsTab member={member} />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementsTab member={member} memberId={memberId} />
        </TabsContent>

        <TabsContent value="accruals">
          <AccrualsTab memberId={memberId} />
        </TabsContent>

        <TabsContent value="redemption">
          <RedemptionTab memberId={memberId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
