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
import { usersApi } from '../../api/resources/users.api';

type User = Record<string, unknown>;

const fields: FieldDef[] = [
  { key: 'username', label: 'Username', required: true, placeholder: 'e.g. john.doe' },
  { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
  { key: 'firstName', label: 'First Name', placeholder: 'First name' },
  { key: 'lastName', label: 'Last Name', placeholder: 'Last name' },
  { key: 'password', label: 'Password', type: 'password', required: true, placeholder: '••••••••' },
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    defaultValue: 'viewer',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'manager', label: 'Manager' },
      { value: 'viewer', label: 'Viewer' },
    ],
  },
];

const columns: Column<User>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'username', header: 'Username', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role', header: 'Role', sortable: true },
  {
    key: 'active',
    header: 'Status',
    render: (val) => (
      <Badge variant={val ? 'success' : 'secondary'}>{val ? 'Active' : 'Inactive'}</Badge>
    ),
  },
];

export function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const fetchData = () => {
    setLoading(true);
    usersApi
      .getAll()
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err: unknown) => setError((err as { message?: string })?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await usersApi.delete(String(deleteTarget['id']));
      setData((prev) => prev.filter((r) => r['id'] !== deleteTarget['id']));
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage system users"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} className="mr-2" /> Add User
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
        title="Add User"
        fields={fields}
        submitLabel="Add User"
        onSubmit={async (values) => {
          const res = await usersApi.create(values);
          return res.data;
        }}
        onSuccess={(created) => setData((prev) => [created as User, ...prev])}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User"
        description={`Delete user "${deleteTarget?.['username']}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
