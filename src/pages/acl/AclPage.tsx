import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { aclApi } from '../../api/resources/acl.api';

type AclRole = Record<string, unknown>;

// AngularJS ACL page shows roles fetched from GET /acl/roles
const columns: Column<AclRole>[] = [
  { key: 'role', header: 'Role Name', sortable: true },
  { key: 'description', header: 'Description' },
  {
    key: 'active',
    header: 'Status',
    render: (val) => (
      <Badge variant={val === false ? 'secondary' : 'success'}>
        {val === false ? 'Inactive' : 'Active'}
      </Badge>
    ),
  },
  { key: 'createdAt', header: 'Created At', sortable: true },
];

export function AclPage() {
  const [data, setData] = useState<AclRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // AngularJS: RLE.ACL.query({ type: 'roles' }) → GET /api/acl/roles
    aclApi
      .getRoles()
      .then((res) => {
        const roles = Array.isArray(res.data) ? res.data : [];
        setData(roles as AclRole[]);
      })
      .catch((err: unknown) =>
        setError((err as { message?: string })?.message || 'Failed to load roles')
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Security Setup"
        description="View and manage roles and permissions"
      />
      {error && <ErrorMessage message={error} />}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
}
