import { useEffect, useState } from 'react';
import { usePageView } from '@/hooks/useAnalytics';
import { analyticsService, type ActivityStats, type PopularCode, type EventTypeDistribution } from '@/services/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Users, Eye, Loader2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AnalyticsPage() {
  usePageView('Analytics Dashboard');

  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [popularCodes, setPopularCodes] = useState<PopularCode[]>([]);
  const [eventDistribution, setEventDistribution] = useState<EventTypeDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const [stats, codes, distribution] = await Promise.all([
          analyticsService.getActivityStats(),
          analyticsService.getPopularCodes(10),
          analyticsService.getEventDistribution(),
        ]);

        setActivityStats(stats);
        setPopularCodes(codes);
        setEventDistribution(distribution);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track usage patterns and popular diagnostic codes
        </p>
      </div>

      {/* Activity Stats */}
      {activityStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityStats.total_events.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time activity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityStats.events_today.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Events in the last 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityStats.events_this_week.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Events in the last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityStats.unique_users.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Unique users</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Popular Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Most Viewed Codes
            </CardTitle>
            <CardDescription>Top 10 diagnostic codes by views</CardDescription>
          </CardHeader>
          <CardContent>
            {popularCodes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularCodes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="code" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="view_count" fill="#8884d8" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
            <CardDescription>Breakdown of activity types</CardDescription>
          </CardHeader>
          <CardContent>
            {eventDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eventDistribution as any}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ event_type, percent }: any) => `${event_type}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="event_type"
                  >
                    {eventDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Codes Table */}
      {popularCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Diagnostic Codes</CardTitle>
            <CardDescription>Most frequently accessed codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {popularCodes.map((code) => (
                <div
                  key={code.code_id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{code.code}</p>
                    <p className="text-sm text-muted-foreground">{code.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{code.view_count}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
