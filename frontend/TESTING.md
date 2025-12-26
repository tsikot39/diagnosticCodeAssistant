# Testing Guide

## Overview
This project uses **Vitest** as the testing framework along with **React Testing Library** for component testing.

## Test Structure

```
src/
├── components/
│   └── __tests__/          # Component tests
├── hooks/
│   └── __tests__/          # Custom hook tests
├── services/
│   └── __tests__/          # API service tests
└── test/
    ├── setup.ts           # Test configuration
    ├── test-utils.tsx     # Custom render with providers
    └── mocks.ts           # Mock data
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (auto-rerun on changes)
```bash
npm test
```

### Run tests once (CI mode)
```bash
npm test -- --run
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test ComponentName.test.tsx
```

## Test Coverage

Current test coverage includes:

### Components (3/11 files)
- ✅ CodeCard - 8 tests
- ✅ Pagination - 5 tests
- ✅ BulkActionsBar - 6 tests

### Hooks (2/6 files)
- ✅ useAutoSave - 6 tests
- ✅ useSavedFilters - 6 tests

### Services (1/1 files)
- ✅ diagnosticCodeService - 7 tests

**Total: 38 tests passing**

## Writing Tests

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Hook Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '@/hooks/useMyHook'

describe('useMyHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe('expected')
  })
})
```

### Service Test Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { myService } from '@/services/myService'

global.fetch = vi.fn()

describe('myService', () => {
  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const result = await myService.getData()
    expect(result).toEqual(mockData)
  })
})
```

## Best Practices

1. **Use test-utils.tsx** - Always import render from `@/test/test-utils` to get all providers
2. **Use mock data** - Leverage `@/test/mocks` for consistent test data
3. **Test user behavior** - Focus on what users see and do, not implementation details
4. **Isolate tests** - Each test should be independent and not rely on others
5. **Clear test names** - Use descriptive names that explain what is being tested

## Debugging Tests

### View test output in UI
```bash
npm run test:ui
```

This opens an interactive UI where you can:
- See test results visually
- Debug individual tests
- View code coverage
- Inspect component renders

### Debug in VS Code
1. Set breakpoints in your test file
2. Run "Debug Test" from VS Code's testing sidebar
3. Step through code execution

## CI/CD Integration

Tests run automatically in CI with:
```bash
npm test -- --run
```

Add coverage reporting for CI:
```bash
npm run test:coverage
```

## Next Steps

### Expand Coverage
- Add tests for remaining components (FilterBar, ExportButton, etc.)
- Add tests for remaining hooks (useDiagnosticCodes, useKeyboardShortcuts)
- Add integration tests for user flows

### E2E Testing
Consider adding Playwright or Cypress for end-to-end testing:
- User authentication flows
- CRUD operations
- Keyboard shortcuts
- Import/Export functionality
