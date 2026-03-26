import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/button';
import { Plus, FolderOpen, Code2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../utils/cn';
import { rulesApi, ruleFoldersApi, customExpressionsApi } from '../../api/resources/rules.api';

type RulesTab = 'rules' | 'folders' | 'expressions';

export function RulesPage() {
  const { program } = useParams<{ program: string }>();
  const [activeTab, setActiveTab] = useState<RulesTab>('rules');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs: { key: RulesTab; label: string; icon: React.ReactNode }[] = [
    { key: 'rules', label: 'Rules', icon: <Code2 size={14} /> },
    { key: 'folders', label: 'Folders', icon: <FolderOpen size={14} /> },
    { key: 'expressions', label: 'Custom Expressions', icon: <Code2 size={14} /> },
  ];

  useEffect(() => {
    if (!program) return;
    setLoading(true);
    setError(null);
    const params = { programId: program };
    const apiCall =
      activeTab === 'rules' ? rulesApi.getAll(params) :
      activeTab === 'folders' ? ruleFoldersApi.getAll(params) :
      customExpressionsApi.getAll(params);

    apiCall
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
        <Badge variant={val === 'published' ? 'success' : 'secondary'}>{String(val || 'draft')}</Badge>
      ),
    },
    { key: 'updatedAt', header: 'Last Updated', sortable: true },
  ];

  return (
    <div>
      <PageHeader
        title={`Rules — Program: ${program}`}
        description="Manage rules, folders, and custom expressions"
        actions={<Button><Plus size={16} className="mr-2" />Add Rule</Button>}
      />

      <div className="border-b mb-6">
        <nav className="flex gap-1">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              {icon} {label}
            </button>
          ))}
        </nav>
      </div>

      {error && <ErrorMessage message={error} />}
      {loading ? <LoadingSpinner /> : <DataTable data={data} columns={columns} />}
    </div>
  );
}
