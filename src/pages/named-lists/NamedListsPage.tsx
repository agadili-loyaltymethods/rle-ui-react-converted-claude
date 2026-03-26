import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { CrudDialog, FieldDef } from '../../components/common/CrudDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { namedListsApi } from '../../api/resources/reference-data.api';

type NamedList = Record<string, unknown>;

const fields: FieldDef[] = [
  { key: 'name', label: 'List Name', required: true, placeholder: 'e.g. VIP Members' },
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

const columns: Column<NamedList>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  {
    key: 'type',
    header: 'Type',
    render: (val) => <Badge variant="outline">{String(val || '')}</Badge>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (val) => (
      <Badge variant={val === 'active' ? 'success' : 'secondary'}>{String(val || '')}</Badge>
    ),
  },
  { key: 'itemCount', header: 'Item Count', sortable: true },
];

export function NamedListsPage() {
  const [data, setData] = useState<NamedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NamedList | null>(null);

  const fetchData = () => {
    setLoading(true);
    namedListsApi
      .getAll()
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err: unknown) => setError((err as { message?: string })?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefreshAll = async () => {
    try {
      await namedListsApi.refreshAll();
      fetchData();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Refresh failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await namedListsApi.delete(String(deleteTarget['id']));
      setData((prev) => prev.filter((r) => r['id'] !== deleteTarget['id']));
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Named Lists"
        description="Manage named list reference data"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefreshAll}>
              <RefreshCw size={14} className="mr-2" /> Refresh All
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus size={16} className="mr-2" /> Add List
            </Button>
          </div>
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
        title="Add Named List"
        fields={fields}
        submitLabel="Add List"
        onSubmit={async (values) => {
          const res = await namedListsApi.create(values);
          return res.data;
        }}
        onSuccess={(created) => setData((prev) => [created as NamedList, ...prev])}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Named List"
        description={`Delete list "${deleteTarget?.['name']}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
