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
import { loyaltyCardsApi } from '../../api/resources/reference-data.api';

type LoyaltyCard = Record<string, unknown>;

const fields: FieldDef[] = [
  { key: 'cardNumber', label: 'Card Number', required: true, placeholder: 'e.g. 4000-0000-0000-0001' },
  { key: 'memberId', label: 'Member ID', required: true, placeholder: 'Member ID' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    defaultValue: 'active',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'blocked', label: 'Blocked' },
    ],
  },
];

const columns: Column<LoyaltyCard>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'cardNumber', header: 'Card Number', sortable: true },
  { key: 'memberId', header: 'Member ID', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (val) => (
      <Badge variant={val === 'active' ? 'success' : 'secondary'}>{String(val || '')}</Badge>
    ),
  },
  { key: 'issuedAt', header: 'Issued At', sortable: true },
];

export function LoyaltyCardsPage() {
  const [data, setData] = useState<LoyaltyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LoyaltyCard | null>(null);

  const fetchData = () => {
    setLoading(true);
    loyaltyCardsApi
      .getAll()
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err: unknown) => setError((err as { message?: string })?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await loyaltyCardsApi.delete(String(deleteTarget['id']));
      setData((prev) => prev.filter((r) => r['id'] !== deleteTarget['id']));
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Loyalty Cards"
        description="Manage loyalty card definitions"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Card
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
        title="Add Loyalty Card"
        fields={fields}
        submitLabel="Add Card"
        onSubmit={async (values) => {
          const res = await loyaltyCardsApi.create(values);
          return res.data;
        }}
        onSuccess={(created) => setData((prev) => [created as LoyaltyCard, ...prev])}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Loyalty Card"
        description={`Delete card "${deleteTarget?.['cardNumber']}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
