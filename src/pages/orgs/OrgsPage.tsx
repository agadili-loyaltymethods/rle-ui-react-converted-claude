/**
 * OrgsPage — read-only view of organisations.
 * AngularJS rle-ui does NOT have Add/Delete Org in the UI.
 * Orgs is reference data managed at the backend level.
 */
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { orgsApi } from '../../api/resources/reference-data.api';

type Org = Record<string, unknown>;

const columns: Column<Org>[] = [
  { key: '_id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'description', header: 'Description' },
  { key: 'createdAt', header: 'Created At', sortable: true },
];

export function OrgsPage() {
  const [data, setData] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    orgsApi
      .getAll()
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err: unknown) =>
        setError((err as { message?: string })?.message || 'Failed to load organisations')
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Orgs"
        description="View organisations"
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
