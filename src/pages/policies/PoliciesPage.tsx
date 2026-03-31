import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Badge } from '../../components/ui/badge';
import { CrudDialog, FieldDef } from '../../components/common/CrudDialog';
import { cn } from '../../utils/cn';
import {
  rewardPoliciesApi,
  pursePoliciesApi,
  tierPoliciesApi,
  streakPoliciesApi,
  aggregatePoliciesApi,
  partnersApi,
  promoCodeDefsApi,
} from '../../api/resources/policies.api';
import { programsApi } from '../../api/resources/programs.api';
import { rulesApi, ruleFoldersApi } from '../../api/resources/rules.api';

type PolicyTab =
  | 'reward'
  | 'promos'      // handled via 2-step: rulefolders(isPromoFolder) → rules
  | 'streak'
  | 'purse'
  | 'tier'
  | 'partners'
  | 'promoCodes'
  | 'aggregate';

// Tab order matches original AngularJS UI
const policyTabs: { key: PolicyTab; label: string }[] = [
  { key: 'reward',     label: 'Reward Policies'    },
  { key: 'promos',     label: 'Promo Policies'     },
  { key: 'streak',     label: 'Streak Policies'    },
  { key: 'purse',      label: 'Purse Policies'     },
  { key: 'tier',       label: 'Tier Policies'      },
  { key: 'partners',   label: 'Partners'           },
  { key: 'promoCodes', label: 'Promo Code'         },
  { key: 'aggregate',  label: 'Aggregate Policies' },
];

// apiMap excludes 'promos' — that tab has its own 2-step fetch below
const apiMap: Record<Exclude<PolicyTab, 'promos'>, ReturnType<typeof Object.assign>> = {
  reward:     rewardPoliciesApi,
  streak:     streakPoliciesApi,
  purse:      pursePoliciesApi,
  tier:       tierPoliciesApi,
  partners:   partnersApi,
  promoCodes: promoCodeDefsApi,
  aggregate:  aggregatePoliciesApi,
};

const addPolicyFields: FieldDef[] = [
  { key: 'name',        label: 'Policy Name',  required: true, placeholder: 'e.g. $1 Reward' },
  { key: 'description', label: 'Description',  type: 'textarea', placeholder: 'Optional description' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    defaultValue: 'draft',
    options: [
      { value: 'draft',  label: 'Draft'  },
      { value: 'active', label: 'Active' },
    ],
  },
];

// Reward-specific columns match the original UI (Intended Use, Discount Type, dates)
const rewardColumns: Column<Record<string, unknown>>[] = [
  { key: 'id',             header: 'ID',             hidden: true    },
  { key: 'name',           header: 'Name',           sortable: true  },
  { key: 'description',    header: 'Description'                     },
  { key: 'intendedUse',    header: 'Intended Use'                    },
  { key: 'discountType',   header: 'Discount Type'                   },
  { key: 'effectiveDate',  header: 'Effective Date', sortable: true  },
  { key: 'expirationDate', header: 'Expiration Date', sortable: true },
  { key: 'pricingType',    header: 'Pricing Type'                    },
  {
    key: 'status',
    header: 'Status',
    render: (val) => (
      <Badge variant={val === 'active' ? 'success' : 'secondary'}>{String(val || 'draft')}</Badge>
    ),
  },
];

const genericColumns: Column<Record<string, unknown>>[] = [
  { key: 'id',          header: 'ID',          hidden: true },
  { key: 'name',        header: 'Name',        sortable: true },
  { key: 'description', header: 'Description'                 },
  {
    key: 'status',
    header: 'Status',
    render: (val) => (
      <Badge variant={val === 'active' ? 'success' : 'secondary'}>{String(val || 'draft')}</Badge>
    ),
  },
];

export function PoliciesPage() {
  const { program } = useParams<{ program: string }>();
  const [activeTab, setActiveTab]   = useState<PolicyTab>('reward');
  const [data, setData]             = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [programName, setProgramName] = useState<string>('');
  const [addOpen, setAddOpen]       = useState(false);

  // Fetch program display name
  useEffect(() => {
    if (!program || program === 'undefined') return;
    programsApi.getById(program)
      .then((res) => {
        const p = res.data as { name?: string };
        setProgramName(p.name || program);
      })
      .catch(() => setProgramName(program));
  }, [program]);

  // populate matches AngularJS policies controller
  const POLICY_POPULATE = JSON.stringify([
    { path: 'program' },
    { path: 'createdBy' },
    { path: 'updatedBy' },
    { path: 'divisions', select: 'name' },
  ]);

  // Fetch policies for active tab
  useEffect(() => {
    if (!program || program === 'undefined') return;

    // ALWAYS clear stale data immediately so previous tab's rows never bleed through
    setData([]);
    setError(null);
    setLoading(true);

    let cancelled = false;

    const finish = (rows: Record<string, unknown>[], err?: string) => {
      if (cancelled) return;
      if (err) setError(err);
      else setData(rows);
      setLoading(false);
    };

    if (activeTab === 'promos') {
      // AngularJS Promo Policies uses /rules filtered to promo rule-folders.
      // Step 1: get all rule-folders where isPromoFolder === true for this program.
      // Step 2: get rules whose ruleFolder is in that set.
      ruleFoldersApi
        .getAll({ query: JSON.stringify({ program, isPromoFolder: true }) })
        .then((fRes: { data: unknown }) => {
          if (cancelled) return;
          const folders = Array.isArray(fRes.data) ? fRes.data as Record<string, unknown>[] : [];
          const folderIds = folders.map((f) => f['_id'] || f['id']).filter(Boolean);

          if (folderIds.length === 0) {
            // No promo folders for this program — show empty state
            finish([]);
            return;
          }

          rulesApi
            .getAll({
              query: JSON.stringify({ program, ruleFolder: { $in: folderIds } }),
              populate: POLICY_POPULATE,
            })
            .then((rRes: { data: unknown }) =>
              finish(Array.isArray(rRes.data) ? rRes.data as Record<string, unknown>[] : [])
            )
            .catch((err: { message?: string }) => finish([], err.message ?? 'Failed to load promo rules'));
        })
        .catch((err: { message?: string }) => finish([], err.message ?? 'Failed to load promo folders'));
    } else {
      apiMap[activeTab].getAll({
        query: JSON.stringify({ program }),
        populate: POLICY_POPULATE,
      })
        .then((res: { data: unknown }) =>
          finish(Array.isArray(res.data) ? res.data as Record<string, unknown>[] : [])
        )
        .catch((err: { message?: string }) => finish([], err.message ?? 'Failed to load'));
    }

    return () => { cancelled = true; };
  }, [program, activeTab]);

  const columns = activeTab === 'reward' ? rewardColumns : genericColumns;
  const activeTabLabel = policyTabs.find((t) => t.key === activeTab)?.label ?? 'Policy';

  if (!program || program === 'undefined') {
    return (
      <div className="p-8 text-center text-red-500">
        Invalid program selection. Please go back to{' '}
        <a href="/programs" className="underline">Programs</a> and select a valid program.
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={programName || 'Loading…'}
        description="Manage policies for this program"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} className="mr-2" />Add Policy
          </Button>
        }
      />

      <div className="border-b mb-6">
        <nav className="flex overflow-x-auto gap-1">
          {policyTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Never show old data while loading or on error — avoids stale-data bleed between tabs */}
      {loading && <LoadingSpinner />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && <DataTable data={data} columns={columns} />}

      <CrudDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title={`Add ${activeTabLabel}`}
        fields={addPolicyFields}
        submitLabel="Create Policy"
        onSubmit={async (values) => {
          const res = await apiMap[activeTab].create({ ...values, program });
          return res.data;
        }}
        onSuccess={(created) => {
          setData((prev) => [created as Record<string, unknown>, ...prev]);
        }}
      />
    </div>
  );
}
