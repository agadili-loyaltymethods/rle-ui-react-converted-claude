import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { CrudDialog, FieldDef } from '../../components/common/CrudDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { locationsApi } from '../../api/resources/reference-data.api';

type Location = Record<string, unknown>;

const fields: FieldDef[] = [
  { key: 'name', label: 'Location Name', required: true, placeholder: 'e.g. Downtown Store' },
  { key: 'code', label: 'Code', required: true, placeholder: 'e.g. LOC001' },
  { key: 'address', label: 'Address', placeholder: 'Street address' },
  { key: 'city', label: 'City', placeholder: 'City' },
  { key: 'state', label: 'State', placeholder: 'State / Province' },
  { key: 'country', label: 'Country', placeholder: 'Country', defaultValue: 'US' },
];

const columns: Column<Location>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'code', header: 'Code', sortable: true },
  { key: 'city', header: 'City', sortable: true },
  { key: 'state', header: 'State', sortable: true },
];

export function LocationsPage() {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

  const fetchData = () => {
    setLoading(true);
    locationsApi
      .getAll()
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err: unknown) => setError((err as { message?: string })?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await locationsApi.delete(String(deleteTarget['id']));
      setData((prev) => prev.filter((r) => r['id'] !== deleteTarget['id']));
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Locations"
        description="Manage store locations"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Location
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
        title="Add Location"
        fields={fields}
        submitLabel="Add Location"
        onSubmit={async (values) => {
          const res = await locationsApi.create(values);
          return res.data;
        }}
        onSuccess={(created) => setData((prev) => [created as Location, ...prev])}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Location"
        description={`Delete location "${deleteTarget?.['name']}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
