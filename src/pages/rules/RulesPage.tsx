import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/button';
import { Plus, FolderOpen, Code2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Badge } from '../../components/ui/badge';
import { CrudDialog, FieldDef } from '../../components/common/CrudDialog';
import { cn } from '../../utils/cn';
import { rulesApi, ruleFoldersApi, customExpressionsApi } from '../../api/resources/rules.api';
import { programsApi } from '../../api/resources/programs.api';

type RulesTab = 'rules' | 'folders' | 'expressions';

// Columns match original AngularJS UI column set
const rulesColumns: Column<Record<string, unknown>>[] = [
  { key: 'id',            header: 'ID',             hidden: true   },
  { key: 'name',          header: 'Rule',            sortable: true },
  { key: 'description',   header: 'Description'                     },
  { key: 'priority',      header: 'Priority',        sortable: true },
  { key: 'ruleType',      header: 'Rule Type'                       },
  { key: 'bonusType',     header: 'Bonus Type'                      },
  { key: 'bonusValue',    header: 'Bonus Value'                     },
  { key: 'effectiveFrom', header: 'Effective From',  sortable: true },
  { key: 'effectiveTo',   header: 'Effective To',    sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (val) => (
      <Badge variant={val === 'published' ? 'success' : 'secondary'}>{String(val || 'draft')}</Badge>
    ),
  },
];

const foldersColumns: Column<Record<string, unknown>>[] = [
  { key: 'id',           header: 'ID',           hidden: true   },
  { key: 'name',         header: 'Rule Folder',  sortable: true },
  { key: 'description',  header: 'Description'                  },
  { key: 'priority',     header: 'Priority',     sortable: true },
  { key: 'folderCount',  header: 'Folders'                      },
  { key: 'ruleCount',    header: 'Rules'                        },
  { key: 'promotional',  header: 'Promotional'                  },
  { key: 'createdBy',    header: 'Created By'                   },
  { key: 'createdAt',    header: 'Created At',   sortable: true },
];

const expressionsColumns: Column<Record<string, unknown>>[] = [
  { key: 'id',          header: 'ID',          hidden: true   },
  { key: 'name',        header: 'Name',        sortable: true },
  { key: 'description', header: 'Description'                 },
  { key: 'expression',  header: 'Expression'                  },
  { key: 'updatedAt',   header: 'Last Updated', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (val) => (
      <Badge variant={val === 'published' ? 'success' : 'secondary'}>{String(val || 'draft')}</Badge>
    ),
  },
];

const addRuleFields: FieldDef[] = [
  { key: 'name',        label: 'Rule Name',    required: true, placeholder: 'e.g. Earn Points on Purchase' },
  { key: 'description', label: 'Description',  type: 'textarea', placeholder: 'Optional description' },
  {
    key: 'ruleType',
    label: 'Rule Type',
    type: 'select',
    defaultValue: 'Generic',
    options: [
      { value: 'Generic',      label: 'Generic'      },
      { value: 'Promotional',  label: 'Promotional'  },
      { value: 'Accrual',      label: 'Accrual'      },
      { value: 'Redemption',   label: 'Redemption'   },
    ],
  },
  { key: 'priority',    label: 'Priority',     type: 'number', placeholder: '0' },
];

const addFolderFields: FieldDef[] = [
  { key: 'name',        label: 'Folder Name',  required: true, placeholder: 'e.g. Earn Rules' },
  { key: 'description', label: 'Description',  type: 'textarea', placeholder: 'Optional description' },
  { key: 'priority',    label: 'Priority',     type: 'number', placeholder: '0' },
];

const addExpressionFields: FieldDef[] = [
  { key: 'name',        label: 'Expression Name', required: true, placeholder: 'e.g. Is Premium Member' },
  { key: 'description', label: 'Description',     type: 'textarea', placeholder: 'Optional description' },
  { key: 'expression',  label: 'Expression',      required: true, type: 'textarea', placeholder: 'e.g. member.tier == "gold"' },
];

export function RulesPage() {
  const { program } = useParams<{ program: string }>();
  const [activeTab, setActiveTab]     = useState<RulesTab>('rules');
  const [data, setData]               = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [programName, setProgramName] = useState<string>('');
  const [addOpen, setAddOpen]         = useState(false);

  const tabs: { key: RulesTab; label: string; icon: React.ReactNode }[] = [
    { key: 'rules',       label: 'Rules',              icon: <Code2 size={14} />     },
    { key: 'folders',     label: 'Folders',            icon: <FolderOpen size={14} /> },
    { key: 'expressions', label: 'Custom Expressions', icon: <Code2 size={14} />     },
  ];

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

  useEffect(() => {
    if (!program || program === 'undefined') return;
    setLoading(true);
    setError(null);
    const params = { programId: program };
    const apiCall =
      activeTab === 'rules'       ? rulesApi.getAll(params) :
      activeTab === 'folders'     ? ruleFoldersApi.getAll(params) :
      customExpressionsApi.getAll(params);

    apiCall
      .then((res: { data: unknown }) => setData(Array.isArray(res.data) ? res.data as Record<string, unknown>[] : []))
      .catch((err: { message?: string }) => setError(err.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [program, activeTab]);

  const columns =
    activeTab === 'rules'       ? rulesColumns :
    activeTab === 'folders'     ? foldersColumns :
    expressionsColumns;

  const addFields =
    activeTab === 'rules'       ? addRuleFields :
    activeTab === 'folders'     ? addFolderFields :
    addExpressionFields;

  const addButtonLabel =
    activeTab === 'rules'       ? 'Add Rule' :
    activeTab === 'folders'     ? 'New Folder' :
    'Add Expression';

  const handleCreate = async (values: Record<string, string>) => {
    const payload = { ...values, programId: program };
    if (activeTab === 'rules')       return (await rulesApi.create(payload)).data;
    if (activeTab === 'folders')     return (await ruleFoldersApi.create(payload)).data;
    return (await customExpressionsApi.create(payload)).data;
  };

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
        title={`Rules — ${programName || 'Loading…'}`}
        description="Manage rules, folders, and custom expressions"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} className="mr-2" />{addButtonLabel}
          </Button>
        }
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

      <CrudDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title={addButtonLabel}
        fields={addFields}
        submitLabel="Create"
        onSubmit={handleCreate}
        onSuccess={(created) => {
          setData((prev) => [created as Record<string, unknown>, ...prev]);
        }}
      />
    </div>
  );
}
