import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { useAuthStore } from '../../store/auth.store';
import { miscApi } from '../../api/resources/misc.api';
import { ErrorMessage } from '../../components/common/ErrorMessage';

const CACHE_ENTITIES = [
  'programs', 'segments', 'locations', 'products', 'dmas',
  'enums', 'loyaltycards', 'divisions', 'namedlists',
];

export function SettingsPage() {
  const { flags, user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const handleRefreshCache = async (entity: string) => {
    setRefreshing(entity);
    try {
      await miscApi.refreshCache(entity);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Cache refresh failed');
    } finally {
      setRefreshing(null);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Application settings and configuration" />
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cache Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Refresh cached data for specific entities.</p>
            <div className="space-y-2">
              {CACHE_ENTITIES.map((entity) => (
                <div key={entity} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{entity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={refreshing === entity}
                    onClick={() => handleRefreshCache(entity)}
                  >
                    {refreshing === entity ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current User Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Username</Label>
              <Input readOnly value={user?.username || ''} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input readOnly value={user?.email || ''} />
            </div>
            <div className="space-y-1">
              <Label>Division</Label>
              <Input readOnly value={user?.divisionName || user?.division || 'N/A'} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(flags).length === 0 ? (
              <p className="text-sm text-gray-500">No feature flags configured.</p>
            ) : (
              <pre className="p-3 bg-gray-50 rounded text-xs overflow-auto">
                {JSON.stringify(flags, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
