import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BarChart2, TrendingUp, Users, Award } from 'lucide-react';
import { analyticsApi } from '../../api/resources/analytics.api';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export function AnalyticsPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Loyalty program analytics and reporting"
      />
      {error && <ErrorMessage message={error} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users size={16} /> Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp size={16} /> Active This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Award size={16} /> Rewards Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <BarChart2 size={16} /> Avg Ticket Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <BarChart2 size={48} className="mx-auto mb-2 opacity-40" />
            <p>Analytics charts will appear here</p>
            <Button variant="outline" className="mt-4" onClick={() => analyticsApi.getTier().catch((e) => setError(e.message))}>
              Load Tier Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
