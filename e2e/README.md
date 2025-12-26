# E2E Testing with Playwright

This directory contains end-to-end tests for the Diagnostic Code Assistant application using Playwright.

## Test Structure

- **home.spec.ts** - Tests for the home page including search, filtering, pagination, CRUD operations
- **dashboard.spec.ts** - Tests for the dashboard page with statistics and visualizations
- **bulk-operations.spec.ts** - Tests for bulk selection, export, and import functionality
- **user-interactions.spec.ts** - Tests for keyboard shortcuts, theme toggling, and navigation

## Running Tests

### Prerequisites

1. Install Playwright browsers:
```bash
npx playwright install chromium
```

2. Make sure both backend and frontend are running, or let Playwright start them automatically.

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Show test report
npm run test:e2e:report

# Run specific test file
npx playwright test e2e/home.spec.ts

# Run tests in debug mode
npx playwright test --debug
```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root.

Key settings:
- **Base URL**: http://localhost:5173 (frontend)
- **API URL**: http://localhost:8000 (backend)
- **Browser**: Chromium (Chrome)
- **Parallel execution**: Enabled for faster test runs
- **Screenshots**: Captured on test failure
- **Traces**: Captured on first retry

## Writing Tests

### Test Data Attributes

Components use `data-testid` attributes for reliable element selection:

```tsx
<Card data-testid="code-card">
```

### Best Practices

1. **Wait for elements** - Use `await expect(element).toBeVisible()` instead of hard waits
2. **Use semantic selectors** - Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
3. **Handle dynamic content** - Account for empty states and loading states
4. **Clean up test data** - E2E tests create codes with `E2E-` prefix for easy identification
5. **Test user flows** - Focus on complete user journeys, not just individual actions

### Example Test

```typescript
test('should create a new diagnostic code', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Add Code/i }).click();
  
  await page.getByLabel(/^Code$/i).fill('E2E-TEST-001');
  await page.getByLabel(/Description/i).fill('Test Description');
  
  await page.getByRole('button', { name: /Create/i }).click();
  
  await expect(page.getByText('E2E-TEST-001')).toBeVisible();
});
```

## CI/CD Integration

For CI environments, tests run with:
- Retries: 2 (to handle flaky tests)
- Workers: 1 (sequential execution)
- No server reuse (fresh instances)

## Troubleshooting

### Tests timing out
- Increase timeout in test with `test.setTimeout(60000)`
- Check if backend/frontend are running on correct ports

### Elements not found
- Verify component has correct `data-testid` attribute
- Use `await page.pause()` to debug in interactive mode
- Check element visibility with `await element.isVisible()`

### Flaky tests
- Add proper waits for network requests
- Use `waitForLoadState('networkidle')` after navigation
- Avoid hard-coded timeouts, use `waitFor` methods

## Coverage

E2E tests cover:
- ✅ Home page search and filtering
- ✅ Creating diagnostic codes
- ✅ Editing diagnostic codes
- ✅ Deleting diagnostic codes
- ✅ Pagination
- ✅ Dashboard statistics
- ✅ Bulk operations
- ✅ Export functionality
- ✅ Import modal
- ✅ Keyboard shortcuts
- ✅ Theme toggling
- ✅ Navigation between pages
- ✅ Responsive mobile menu
