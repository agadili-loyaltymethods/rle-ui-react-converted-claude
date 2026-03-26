import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { miscApi } from '../../api/resources/misc.api';

export function McpUiConfigPage() {
  const [deployed, setDeployed] = useState<unknown>(null);
  const [published, setPublished] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      miscApi.getMcpDeployedConfigs(),
      miscApi.getMcpPublishedConfigs(),
    ])
      .then(([depRes, pubRes]) => {
        setDeployed(depRes.data);
        setPublished(pubRes.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="MCP UI Config"
        description="MCP UI deployed and published configurations"
      />
      {error && <ErrorMessage message={error} />}
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Deployed Configs <Badge variant="success">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(deployed, null, 2)}
              </pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Published Configs <Badge variant="secondary">Staged</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(published, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
