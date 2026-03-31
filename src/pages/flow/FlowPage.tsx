import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, GitBranch } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Badge } from '../../components/ui/badge';
import { CrudDialog, FieldDef } from '../../components/common/CrudDialog';
import { miscApi } from '../../api/resources/misc.api';
import { programsApi } from '../../api/resources/programs.api';

interface Flow {
  id: string;
  name: string;
  status: string;
  type?: string;
  [key: string]: unknown;
}

const createFlowFields: FieldDef[] = [
  { key: 'name',        label: 'Flow Name',    required: true, placeholder: 'e.g. Earn Flow' },
  { key: 'description', label: 'Description',  type: 'textarea', placeholder: 'Optional description' },
  {
    key: 'type',
    label: 'Flow Type',
    type: 'select',
    defaultValue: 'standard',
    options: [
      { value: 'standard',    label: 'Standard'    },
      { value: 'promotional', label: 'Promotional' },
      { value: 'redemption',  label: 'Redemption'  },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    defaultValue: 'inactive',
    options: [
      { value: 'inactive', label: 'Inactive' },
      { value: 'active',   label: 'Active'   },
    ],
  },
];

export function FlowPage() {
  const { program } = useParams<{ program: string }>();
  const [flows, setFlows]             = useState<Flow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [programName, setProgramName] = useState<string>('');
  const [createOpen, setCreateOpen]   = useState(false);

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
    if (!program || program === 'undefined') { setLoading(false); return; }
    miscApi.getFlows({ programId: program })
      .then((res) => setFlows(Array.isArray(res.data) ? res.data as Flow[] : []))
      .catch((err: { message?: string }) => setError(err.message ?? 'Failed to load flows'))
      .finally(() => setLoading(false));
  }, [program]);

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
        title={`Flow Composer — ${programName || 'Loading…'}`}
        description="Manage program flows and automation"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} className="mr-2" />Create Flow
          </Button>
        }
      />

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : flows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-gray-400">
            <GitBranch size={48} className="mb-3 opacity-40" />
            <p>No flows configured for this program</p>
            <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus size={14} className="mr-2" />Create First Flow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flows.map((flow) => (
            <Card key={flow.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <GitBranch size={16} /> {flow.name}
                  </span>
                  <Badge variant={flow.status === 'active' ? 'success' : 'secondary'}>
                    {flow.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">ID: {flow.id}</p>
                {flow.type && <p className="text-xs text-gray-500">Type: {flow.type}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CrudDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Flow"
        fields={createFlowFields}
        submitLabel="Create Flow"
        onSubmit={async (values) => {
          const res = await miscApi.createFlow({ ...values, programId: program });
          return res.data;
        }}
        onSuccess={(created) => {
          setFlows((prev) => [...prev, created as Flow]);
        }}
      />
    </div>
  );
}
