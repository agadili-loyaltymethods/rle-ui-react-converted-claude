import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { CrudDialog, FieldDef } from '../../components/common/CrudDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { programsApi } from '../../api/resources/programs.api';

interface Program {
  id: string;
  name: string;
  status: string;
  publishedAt?: string;
  [key: string]: unknown;
}

const programFields: FieldDef[] = [
  { key: 'name', label: 'Program Name', required: true, placeholder: 'e.g. Gold Rewards Program' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    defaultValue: 'draft',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Optional program description',
  },
];

const columns: Column<Record<string, unknown>>[] = [
  { key: 'id',   header: 'ID',   hidden: true }, // stored for navigation; not shown
  { key: '_id',  header: '_id',  hidden: true }, // MongoDB _id fallback; not shown
  { key: 'name', header: 'Program Name', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (val) => (
      <Badge variant={val === 'published' || val === 'active' ? 'success' : 'secondary'}>
        {String(val || 'draft')}
      </Badge>
    ),
  },
  { key: 'publishedAt', header: 'Last Published', sortable: true },
];

export function ProgramsPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);

  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await programsApi.getAll();
      setPrograms(Array.isArray(res.data) ? (res.data as Program[]) : []);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await programsApi.delete(deleteTarget.id);
      setPrograms((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Programs"
        description="Manage loyalty programs"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchPrograms}>
              <RefreshCw size={14} className="mr-2" /> Refresh
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus size={16} className="mr-2" /> New Program
            </Button>
          </div>
        }
      />

      {error && <ErrorMessage message={error} />}

      <DataTable
        data={programs as unknown as Record<string, unknown>[]}
        columns={columns}
        onRowClick={(row) => {
          // Safely resolve the program ID — the API may return 'id' or 'programId'
          const id = (row['id'] ?? row['_id'] ?? row['programId']) as string | undefined;
          if (id) navigate(`/programs/${id}/policies`);
        }}
        actions={(row) => {
          const id = (row['id'] ?? row['_id'] ?? row['programId']) as string | undefined;
          return (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                disabled={!id}
                onClick={() => id && navigate(`/programs/${id}/rules`)}
              >
                Rules
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!id}
                onClick={() => id && navigate(`/programs/${id}/flow`)}
              >
                Flow
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteTarget(row as unknown as Program)}
              >
                Delete
              </Button>
            </div>
          );
        }}
      />

      {/* ─── New Program Dialog ───────────────────────────────────────────── */}
      <CrudDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="New Program"
        fields={programFields}
        submitLabel="Create Program"
        onSubmit={async (values) => {
          const res = await programsApi.create(values);
          return res.data;
        }}
        onSuccess={(created) => {
          setPrograms((prev) => [created as Program, ...prev]);
        }}
      />

      {/* ─── Delete Confirm Dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Program"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
