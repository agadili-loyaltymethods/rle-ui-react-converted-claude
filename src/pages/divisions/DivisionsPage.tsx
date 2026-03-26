import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { CrudDialog, FieldDef } from '../../components/common/CrudDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { divisionsApi } from '../../api/resources/reference-data.api';

type Division = Record<string, unknown>;

const fields: FieldDef[] = [
  { key: 'name', label: 'Division Name', required: true, placeholder: 'e.g. North America' },
  { key: 'code', label: 'Code', required: true, placeholder: 'e.g. NA' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
];

const columns: Column<Division>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Division Name', sortable: true },
  { key: 'code', header: 'Code', sortable: true },
  { key: 'description', header: 'Description' },
];

export function DivisionsPage() {
  const [data, setData] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Division | null>(null);

  const fetchData = () => {
    setLoading(true);
    divisionsApi
      .getAll()
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err: unknown) => setError((err as { message?: string })?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await divisionsApi.delete(String(deleteTarget['id']));
      setData((prev) => prev.filter((r) => r['id'] !== deleteTarget['id']));
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Divisions"
        description="Manage organizational divisions"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Division
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
        title="Add Division"
        fields={fields}
        submitLabel="Add Division"
        onSubmit={async (values) => {
          const res = await divisionsApi.create(values);
          return res.data;
        }}
        onSuccess={(created) => setData((prev) => [created as Division, ...prev])}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Division"
        description={`Delete division "${deleteTarget?.['name']}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
