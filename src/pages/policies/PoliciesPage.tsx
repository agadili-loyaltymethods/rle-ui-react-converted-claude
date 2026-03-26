import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../utils/cn';
import {
  rewardPoliciesApi,
  pursePoliciesApi,
  tierPoliciesApi,
  streakPoliciesApi,
  aggregatePoliciesApi,
  partnersApi,
  promosApi,
} from '../../api/resources/policies.api';

type PolicyTab = 'reward' | 'purse' | 'tier' | 'streak' | 'aggregate' | 'partners' | 'promos';

const policyTabs: { key: PolicyTab; label: string }[] = [
  { key: 'reward', label: 'Reward Policies' },
  { key: 'purse', label: 'Purse Policies' },
  { key: 'tier', label: 'Tier Policies' },
  { key: 'streak', label: 'Streak Policies' },
  { key: 'aggregate', label: 'Aggregate Policies' },
  { key: 'partners', label: 'Partners' },
  { key: 'promos', label: 'Promotions' },
];

const apiMap = {
  reward: rewardPoliciesApi,
  purse: pursePoliciesApi,
  tier: tierPoliciesApi,
  streak: streakPoliciesApi,
  aggregate: aggregatePoliciesApi,
  partners: partnersApi,
  promos: promosApi,
};

export function PoliciesPage() {
  const { program } = useParams<{ program: string }>();
  const [activeTab, setActiveTab] = useState<PolicyTab>('reward');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!program) return;
    setLoading(true);
    setError(null);
    apiMap[activeTab].getAll({ programId: program })
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [program, activeTab]);

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'description', header: 'Description' },
    {
      key: 'status',
      header: 'Status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'success' : 'secondary'}>{String(val || 'draft')}</Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Program: ${program}`}
        description="Manage policies for this program"
        actions={<Button><Plus size={16} className="mr-2" />Add Policy</Button>}
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

      {error && <ErrorMessage message={error} />}
      {loading ? <LoadingSpinner /> : <DataTable data={data} columns={columns} />}
    </div>
  );
}
