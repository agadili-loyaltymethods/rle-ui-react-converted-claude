import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { CrudDialog, FieldDef } from '../../components/common/CrudDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { enumsApi } from '../../api/resources/reference-data.api';

type Enum = Record<string, unknown>;

const fields: FieldDef[] = [
  { key: 'name', label: 'Enum Name', required: true, placeholder: 'e.g. MemberTier' },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'string', label: 'String' },
      { value: 'number', label: 'Number' },
      { value: 'boolean', label: 'Boolean' },
    ],
  },
  { key: 'values', label: 'Values (comma-separated)', placeholder: 'e.g. Bronze,Silver,Gold' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
];

const columns: Column<Enum>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  {
    key: 'type',
    header: 'Type',
    render: (val) => <Badge variant="outline">{String(val || '')}</Badge>,
  },
  { key: 'values', header: 'Values' },
];

export function EnumsPage() {
  const [data, setData] = useState<Enum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Enum | null>(null);

  const fetchData = () => {
    setLoading(true);
    enumsApi
      .getAll()
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err: unknown) => setError((err as { message?: string })?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await enumsApi.delete(String(deleteTarget['id']));
      setData((prev) => prev.filter((r) => r['id'] !== deleteTarget['id']));
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Enumerations"
        description="Manage enumeration reference data"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Enum
          </Button>
        }
      />
      {error && <ErrorMessage message={error} />}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          data={data}
          columns={columns}
          actions={(row) => (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            >
              Delete
            </Button>
          )}
        />
      )}

      <CrudDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Enumeration"
        fields={fields}
        submitLabel="Add Enum"
        onSubmit={async (values) => {
          const res = await enumsApi.create(values);
          return res.data;
        }}
        onSuccess={(created) => setData((prev) => [created as Enum, ...prev])}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Enum"
        description={`Delete enumeration "${deleteTarget?.['name']}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
