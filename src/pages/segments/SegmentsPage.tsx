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
import { segmentsApi } from '../../api/resources/reference-data.api';

type Segment = Record<string, unknown>;

const fields: FieldDef[] = [
  { key: 'name', label: 'Segment Name', required: true, placeholder: 'e.g. High-Value Members' },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'dynamic', label: 'Dynamic' },
      { value: 'static', label: 'Static' },
    ],
  },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
];

const columns: Column<Segment>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  {
    key: 'type',
    header: 'Type',
    render: (val) => <Badge variant="outline">{String(val || '')}</Badge>,
  },
  { key: 'memberCount', header: 'Member Count', sortable: true },
];

export function SegmentsPage() {
  const [data, setData] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Segment | null>(null);

  const fetchData = () => {
    setLoading(true);
    segmentsApi
      .getAll()
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err: unknown) => setError((err as { message?: string })?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await segmentsApi.delete(String(deleteTarget['id']));
      setData((prev) => prev.filter((r) => r['id'] !== deleteTarget['id']));
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Segments"
        description="Manage member segments"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Segment
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
        title="Add Segment"
        fields={fields}
        submitLabel="Add Segment"
        onSubmit={async (values) => {
          const res = await segmentsApi.create(values);
          return res.data;
        }}
        onSuccess={(created) => setData((prev) => [created as Segment, ...prev])}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Segment"
        description={`Delete segment "${deleteTarget?.['name']}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
