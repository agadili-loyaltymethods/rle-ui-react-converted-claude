import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { schemaApi } from '../../api/resources/rules.api';

export function ExtensionsPage() {
  const [schema, setSchema] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    schemaApi.getExtensionSchema()
      .then((res) => setSchema(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Extensions"
        description="Manage schema extensions"
      />
      {error && <ErrorMessage message={error} />}
      {loading ? <LoadingSpinner /> : (
        <Card>
          <CardHeader>
            <CardTitle>Extension Schema</CardTitle>
          </CardHeader>
          <CardContent>
            {schema ? (
              <pre className="p-4 bg-gray-50 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(schema, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 text-sm">No extension schema configured.</p>
            )}
            <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
              Reload Schema
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
