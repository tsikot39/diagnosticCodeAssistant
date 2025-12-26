import { useEffect } from 'react';
import { analyticsService } from '@/services/analytics';

export function useAnalytics() {
  const trackEvent = (
    eventType: string,
    eventCategory: string,
    resourceId?: number,
    metadata?: Record<string, any>
  ) => {
    analyticsService.trackEvent({
      event_type: eventType,
      event_category: eventCategory,
      resource_id: resourceId,
      metadata,
    });
  };

  const trackPageView = (pageName: string) => {
    trackEvent('view', 'page', undefined, { page: pageName });
  };

  const trackCodeView = (codeId: number, code: string) => {
    trackEvent('view', 'diagnostic_code', codeId, { code });
  };

  const trackSearch = (query: string, resultsCount: number) => {
    trackEvent('search', 'diagnostic_code', undefined, {
      query,
      results_count: resultsCount,
    });
  };

  const trackCodeCreate = (codeId: number) => {
    trackEvent('create', 'diagnostic_code', codeId);
  };

  const trackCodeUpdate = (codeId: number) => {
    trackEvent('update', 'diagnostic_code', codeId);
  };

  const trackCodeDelete = (codeId: number) => {
    trackEvent('delete', 'diagnostic_code', codeId);
  };

  const trackExport = (format: string, count: number) => {
    trackEvent('export', 'diagnostic_code', undefined, { format, count });
  };

  const trackImport = (count: number) => {
    trackEvent('import', 'diagnostic_code', undefined, { count });
  };

  return {
    trackEvent,
    trackPageView,
    trackCodeView,
    trackSearch,
    trackCodeCreate,
    trackCodeUpdate,
    trackCodeDelete,
    trackExport,
    trackImport,
  };
}

// Hook to track page views automatically
export function usePageView(pageName: string) {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(pageName);
  }, [pageName, trackPageView]);
}
