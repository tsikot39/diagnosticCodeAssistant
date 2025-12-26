import apiClient from '@/lib/apiClient';

export interface AnalyticsEventCreate {
  event_type: string;
  event_category: string;
  resource_id?: number;
  metadata?: Record<string, any>;
}

export interface ActivityStats {
  total_events: number;
  events_today: number;
  events_this_week: number;
  events_this_month: number;
  unique_users: number;
}

export interface PopularCode {
  code_id: number;
  code: string;
  description: string;
  view_count: number;
}

export interface EventTypeDistribution {
  event_type: string;
  count: number;
}

export interface UserActivity {
  user_id: number;
  username: string;
  email: string;
  event_count: number;
  last_activity: string;
}

export interface AnalyticsSummary {
  activity_stats: ActivityStats;
  popular_codes: PopularCode[];
  event_distribution: EventTypeDistribution[];
  recent_events: any[];
  top_users: UserActivity[];
}

class AnalyticsService {
  async trackEvent(event: AnalyticsEventCreate): Promise<void> {
    try {
      await apiClient.post('/api/v1/analytics/events', event);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  async getActivityStats(): Promise<ActivityStats> {
    const response = await apiClient.get<ActivityStats>('/api/v1/analytics/activity');
    return response.data;
  }

  async getPopularCodes(limit: number = 10): Promise<PopularCode[]> {
    const response = await apiClient.get<PopularCode[]>('/api/v1/analytics/popular-codes', {
      params: { limit }
    });
    return response.data;
  }

  async getEventDistribution(): Promise<EventTypeDistribution[]> {
    const response = await apiClient.get<EventTypeDistribution[]>('/api/v1/analytics/event-distribution');
    return response.data;
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const response = await apiClient.get<AnalyticsSummary>('/api/v1/analytics/summary');
    return response.data;
  }

  async getTopUsers(limit: number = 10): Promise<UserActivity[]> {
    const response = await apiClient.get<UserActivity[]>('/api/v1/analytics/top-users', {
      params: { limit }
    });
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
