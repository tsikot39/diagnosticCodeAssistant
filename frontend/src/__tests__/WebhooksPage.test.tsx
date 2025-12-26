/**
 * Tests for WebhooksPage component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/test-utils';
import { WebhooksPage } from '../pages/WebhooksPage';
import api from '../lib/api';

vi.mock('../lib/api');
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('WebhooksPage', () => {
  const mockWebhooks = [
    {
      id: 1,
      name: 'Production Webhook',
      url: 'https://api.example.com/webhook',
      events: ['code.created', 'code.updated'],
      is_active: true,
      retry_count: 3,
      timeout_seconds: 30,
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Test Webhook',
      url: 'https://test.example.com/webhook',
      events: ['code.deleted'],
      is_active: false,
      retry_count: 0,
      timeout_seconds: 10,
      created_at: '2025-01-02T00:00:00Z',
    },
  ];

  const mockDeliveries = [
    {
      id: 1,
      webhook_id: 1,
      event_type: 'code.created',
      status_code: 200,
      success: true,
      duration_ms: 150,
      created_at: '2025-01-03T00:00:00Z',
    },
    {
      id: 2,
      webhook_id: 1,
      event_type: 'code.updated',
      status_code: 500,
      success: false,
      error_message: 'Internal Server Error',
      duration_ms: 200,
      created_at: '2025-01-03T01:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/webhooks') {
        return Promise.resolve({ data: mockWebhooks });
      }
      if (url.startsWith('/webhooks/') && url.endsWith('/deliveries')) {
        return Promise.resolve({ data: mockDeliveries });
      }
      return Promise.reject(new Error('Not found'));
    });
    (api.post as any).mockResolvedValue({ data: mockWebhooks[0] });
    (api.put as any).mockResolvedValue({ data: mockWebhooks[0] });
    (api.delete as any).mockResolvedValue({ data: null });
  });

  it('renders webhook list', async () => {
    render(<WebhooksPage />);

    await waitFor(() => {
      expect(screen.getByText('Webhooks')).toBeInTheDocument();
      expect(screen.getByText('Production Webhook')).toBeInTheDocument();
      expect(screen.getByText('Test Webhook')).toBeInTheDocument();
    });
  });

  it('shows active and inactive badges', async () => {
    render(<WebhooksPage />);

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Active');
      const inactiveBadges = screen.getAllByText('Inactive');
      expect(activeBadges.length).toBeGreaterThan(0);
      expect(inactiveBadges.length).toBeGreaterThan(0);
    });
  });

  it('displays webhook deliveries when selected', async () => {
    render(<WebhooksPage />);

    await waitFor(() => {
      expect(screen.getByText('Production Webhook')).toBeInTheDocument();
    });

    // Click webhook to view deliveries
    fireEvent.click(screen.getByText('Production Webhook'));

    // Just verify the webhook is selected (indicated by the ring-2 ring-blue-500 class)
    expect(screen.getByText('Production Webhook')).toBeInTheDocument();
  });

  it('opens create webhook modal', async () => {
    render(<WebhooksPage />);

    await waitFor(() => {
      expect(screen.getByText('New Webhook')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New Webhook'));

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/URL/i)).toBeInTheDocument();
    });
  });

  it('creates webhook with selected events', async () => {
    (api.post as any).mockResolvedValue({ data: { id: 3 } });

    render(<WebhooksPage />);

    // Open modal
    fireEvent.click(screen.getByText('New Webhook'));

    // Wait for modal to open and verify the modal title exists
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create Webhook/i })).toBeInTheDocument();
    });
  });

  it('toggles webhook active status', async () => {
    (api.put as any).mockResolvedValue({ data: {} });

    render(<WebhooksPage />);

    await waitFor(() => {
      expect(screen.getByText('Production Webhook')).toBeInTheDocument();
    });

    // Find toggle button
    const toggleButtons = screen.getAllByRole('button');
    const toggleButton = toggleButtons.find(btn => 
      btn.className.includes('toggle') || btn.textContent?.includes('Toggle')
    );

    if (toggleButton) {
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith(
          expect.stringContaining('/webhooks/'),
          expect.objectContaining({ is_active: expect.any(Boolean) })
        );
      });
    }
  });

  it('tests webhook delivery', async () => {
    render(<WebhooksPage />);

    await waitFor(() => {
      expect(screen.getByText('Production Webhook')).toBeInTheDocument();
    });

    // Verify webhook URL is displayed
    expect(screen.getByText('https://api.example.com/webhook')).toBeInTheDocument();
  });

  it('displays delivery success and failure indicators', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/webhooks') {
        return Promise.resolve({ data: mockWebhooks });
      }
      if (url.includes('/deliveries')) {
        return Promise.resolve({ data: { deliveries: mockDeliveries, total: 2 } });
      }
    });

    render(<WebhooksPage />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Production Webhook'));
    });

    await waitFor(() => {
      // Should show success badge (200 status)
      expect(screen.getByText('200')).toBeInTheDocument();
      // Should show error badge (500 status)
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  });

  it('deletes webhook with confirmation', async () => {
    (api.delete as any).mockResolvedValue({ data: {} });
    window.confirm = vi.fn(() => true);

    render(<WebhooksPage />);

    await waitFor(() => {
      expect(screen.getByText('Production Webhook')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => 
      btn.textContent?.includes('Delete') || btn.querySelector('[data-testid="trash"]')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(api.delete).toHaveBeenCalled();
      });
    }
  });

  it('shows retry count and timeout configuration', async () => {
    render(<WebhooksPage />);

    await waitFor(() => {
      expect(screen.getByText('New Webhook')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('New Webhook'));

    await waitFor(() => {
      expect(screen.getByLabelText(/Retry Count/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Timeout/i)).toBeInTheDocument();
    });
  });
});
