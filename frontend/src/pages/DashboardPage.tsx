import { useDiagnosticCodes } from '@/hooks/useDiagnosticCodes';
import { usePageView } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, AlertCircle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { CodeListSkeleton } from '@/components/LoadingSkeleton';

export default function DashboardPage() {
  usePageView('Dashboard');
  // Load only 100 codes for dashboard stats to improve performance
  const { data, isLoading } = useDiagnosticCodes({ limit: 100 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <CodeListSkeleton />
      </div>
    );
  }

  if (!data) return null;

  // Calculate statistics from sample data (first 100 codes)
  const totalCodes = data.total;
  const sampleSize = data.items.length;
  const activeCodes = data.items.filter(c => c.is_active).length;
  const inactiveCodes = data.items.filter(c => !c.is_active).length;

  // Category breakdown
  const categoryStats = data.items.reduce((acc, code) => {
    const cat = code.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Severity breakdown
  const severityStats = data.items.reduce((acc, code) => {
    const sev = code.severity || 'None';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Statistics based on sample of {sampleSize} codes (Total: {totalCodes.toLocaleString()})
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCodes}</div>
            <p className="text-xs text-muted-foreground">All diagnostic codes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCodes}</div>
            <p className="text-xs text-muted-foreground">
              {((activeCodes / totalCodes) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive Codes</CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveCodes}</div>
            <p className="text-xs text-muted-foreground">
              {((inactiveCodes / totalCodes) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(categoryStats).length}</div>
            <p className="text-xs text-muted-foreground">Unique categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.map(([category, count]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-sm text-muted-foreground">{count} codes</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(count / totalCodes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(severityStats)
              .sort(([, a], [, b]) => b - a)
              .map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity)}`} />
                    <span className="text-sm font-medium capitalize">{severity}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {((count / totalCodes) * 100).toFixed(1)}%
                    </span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.items.slice(0, 5).map((code) => (
              <div key={code.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <div className="font-mono text-sm font-semibold">{code.code}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">{code.description}</div>
                </div>
                <div className="flex gap-2">
                  {code.category && <Badge variant="outline">{code.category}</Badge>}
                  {code.severity && (
                    <Badge variant={code.severity === 'high' ? 'destructive' : 'default'}>
                      {code.severity}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
