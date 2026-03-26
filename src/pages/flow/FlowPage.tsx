import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, GitBranch } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Badge } from '../../components/ui/badge';
import { miscApi } from '../../api/resources/misc.api';

interface Flow {
  id: string;
  name: string;
  status: string;
  type?: string;
  [key: string]: unknown;
}

export function FlowPage() {
  const { program } = useParams<{ program: string }>();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    miscApi.getFlows({ programId: program })
      .then((res) => setFlows(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [program]);

  return (
    <div>
      <PageHeader
        title={`Flow — Program: ${program}`}
        description="Manage program flows and automation"
        actions={<Button><Plus size={16} className="mr-2" />Create Flow</Button>}
      />

      {error && <ErrorMessage message={error} />}
      {loading ? <LoadingSpinner /> : (
        flows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48 text-gray-400">
              <GitBranch size={48} className="mb-3 opacity-40" />
              <p>No flows configured for this program</p>
              <Button variant="outline" className="mt-4">
                <Plus size={14} className="mr-2" />Create First Flow
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flows.map((flow) => (
              <Card key={flow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <GitBranch size={16} /> {flow.name}
                    </span>
                    <Badge variant={flow.status === 'active' ? 'success' : 'secondary'}>
                      {flow.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">ID: {flow.id}</p>
                  {flow.type && <p className="text-xs text-gray-500">Type: {flow.type}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
