import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { miscApi } from '../../api/resources/misc.api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function LimitsPage() {
  const [role, setRole] = useState('');
  const [id, setId] = useState('');
  const [limitType, setLimitType] = useState('');
  const [limits, setLimits] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!role || !id || !limitType) return;
    setLoading(true);
    try {
      const res = await miscApi.getLimits(role, id, limitType);
      setLimits(res.data);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Failed to load limits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Limits"
        description="View and manage rate limits and thresholds"
      />
      {error && <ErrorMessage message={error} />}
      <Card>
        <CardHeader>
          <CardTitle>Query Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <Label>Role</Label>
              <Input placeholder="e.g. program" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>ID</Label>
              <Input placeholder="Resource ID" value={id} onChange={(e) => setId(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Limit Type</Label>
              <Input placeholder="e.g. daily" value={limitType} onChange={(e) => setLimitType(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleFetch} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Limits'}
          </Button>
          {loading && <LoadingSpinner />}
          {limits !== null && (
            <pre className="mt-4 p-4 bg-gray-50 rounded-lg text-xs overflow-auto">
              {JSON.stringify(limits, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
