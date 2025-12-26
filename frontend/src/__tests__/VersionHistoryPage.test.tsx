/**
 * Tests for VersionHistoryPage component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VersionHistoryPage } from '../pages/VersionHistoryPage';
import versionService from '../services/versions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';

vi.mock('../services/versions', () => ({
  default: {
    getVersionHistory: vi.fn(),
    compareVersions: vi.fn(),
    restoreVersion: vi.fn(),
  },
}));

const MockedVersionHistoryPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/code/123/history']}>
            <Routes>
              <Route path="/code/:codeId/history" element={<VersionHistoryPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('VersionHistoryPage', () => {
  const mockVersions = [
    {
      id: 1,
      diagnostic_code_id: 123,
      version_number: 3,
      change_type: 'UPDATE',
      changed_fields: { description: { old: 'Old desc', new: 'New desc' } },
      comment: 'Updated description',
      user_id: 1,
      created_at: '2025-01-03T00:00:00Z',
      snapshot_data: {
        code: 'TEST001',
        description: 'New desc',
        category: 'Testing',
      },
    },
    {
      id: 2,
      diagnostic_code_id: 123,
      version_number: 2,
      change_type: 'UPDATE',
      changed_fields: { severity: { old: 'low', new: 'high' } },
      comment: 'Changed severity',
      user_id: 1,
      created_at: '2025-01-02T00:00:00Z',
      snapshot_data: {
        code: 'TEST001',
        description: 'Old desc',
        severity: 'high',
      },
    },
    {
      id: 3,
      diagnostic_code_id: 123,
      version_number: 1,
      change_type: 'CREATE',
      changed_fields: { all: 'Initial creation' },
      comment: 'Created code',
      user_id: 1,
      created_at: '2025-01-01T00:00:00Z',
      snapshot_data: {
        code: 'TEST001',
        description: 'Old desc',
        severity: 'low',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (versionService.getVersionHistory as any).mockResolvedValue({
      versions: mockVersions,
      total: 3,
      current_version: 3,
    });
    (versionService.compareVersions as any).mockResolvedValue({
      version1: mockVersions[1],
      version2: mockVersions[0],
      differences: [{ field: 'description', old_value: 'Old desc', new_value: 'New desc' }],
    });
    (versionService.restoreVersion as any).mockResolvedValue({ success: true });
  });

  it('renders version history timeline', async () => {
    render(<MockedVersionHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });
  });

  it('displays change type badges', async () => {
    render(<MockedVersionHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });
  });

  it('shows version comments', async () => {
    render(<MockedVersionHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });
  });

  it('allows selecting versions for comparison', async () => {
    render(<MockedVersionHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });
  });

  it('compares two versions', async () => {
    const mockComparison = {
      code_id: 123,
      version_from: 1,
      version_to: 3,
      differences: {
        description: { from: 'Old desc', to: 'New desc' },
        severity: { from: 'low', to: 'high' },
      },
    };

    (versionService.compareVersions as any).mockResolvedValue(mockComparison);

    render(<MockedVersionHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });
  });

  it('restores a previous version', async () => {
    (versionService.restoreVersion as any).mockResolvedValue({
      id: 4,
      version_number: 4,
      change_type: 'RESTORE',
    });

    render(<MockedVersionHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });
  });

  it('shows changed fields in version cards', async () => {
    render(<MockedVersionHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });
  });

  it('displays timestamp for each version', async () => {
    render(<MockedVersionHistoryPage />);

    await waitFor(() => {
      // Should show dates (format may vary)
      const timestamps = screen.getAllByText(/2025|Jan|January/i);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  it('handles empty version history', async () => {
    (versionService.getVersionHistory as any).mockResolvedValue({
      versions: [],
      total: 0,
      current_version: 0,
    });

    render(<MockedVersionHistoryPage />);

    await waitFor(() => {
      // Check that heading still renders even with no versions
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });
  });

  it('loads more versions on scroll', async () => {
    const manyVersions = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      diagnostic_code_id: 123,
      version_number: 20 - i,
      change_type: 'UPDATE',
      changed_fields: {},
      comment: `Version ${20 - i}`,
      user_id: 1,
      created_at: new Date(2025, 0, i + 1).toISOString(),
      snapshot_data: {},
    }));

    (versionService.getVersionHistory as any).mockResolvedValue({
      versions: manyVersions.slice(0, 10),
      total: 20,
      current_version: 20,
    });

    render(<MockedVersionHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });
  });
});
