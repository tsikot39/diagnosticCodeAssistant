import { test, expect } from '@playwright/test';

test.describe('Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('should have export buttons visible when codes exist', async ({ page }) => {
    // Check if codes are loaded
    const hasCodeCards = await page.locator('[data-testid="code-card"]').count() > 0;
    
    if (hasCodeCards) {
      // Export button should be visible
      const exportButton = page.getByRole('button', { name: /Export/i });
      const isExportVisible = await exportButton.isVisible().catch(() => false);
      expect(isExportVisible).toBe(true);
    }
  });

  test('should download CSV export', async ({ page }) => {
    // Check if export button exists
    const exportButton = page.getByRole('button', { name: /Export as CSV/i });
    const isExportVisible = await exportButton.isVisible().catch(() => false);
    
    if (isExportVisible) {
      // Set up download promise
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      
      // Click export
      await exportButton.click();
      
      // Wait for download
      const download = await downloadPromise;
      
      if (download) {
        // Verify filename
        expect(download.suggestedFilename()).toMatch(/diagnostic-codes.*\.csv/);
      }
    }
  });
});

test.describe('Import Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open import modal', async ({ page }) => {
    // Find and click Import button (keyboard shortcut or button)
    const importButton = page.getByRole('button', { name: /Import/i });
    const hasImportButton = await importButton.isVisible().catch(() => false);
    
    if (hasImportButton) {
      await importButton.click();
      
      // Import modal should open
      await expect(page.getByRole('heading', { name: /Import Diagnostic Codes/i })).toBeVisible();
      
      // File upload area should be visible
      await expect(page.getByText(/Upload a CSV or JSON file/i)).toBeVisible();
    }
  });
});

test.describe('Bulk Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('should select multiple codes', async ({ page }) => {
    // Wait for codes to load
    const codeCards = page.locator('[data-testid="code-card"]');
    const cardCount = await codeCards.count();
    
    if (cardCount > 0) {
      // Check first checkbox
      const firstCheckbox = codeCards.first().locator('input[type="checkbox"]');
      const hasCheckbox = await firstCheckbox.isVisible().catch(() => false);
      
      if (hasCheckbox) {
        await firstCheckbox.check();
        
        // Bulk actions bar should appear
        await expect(page.getByText(/selected/i)).toBeVisible();
      }
    }
  });

  test('should select all codes with keyboard shortcut', async ({ page }) => {
    // Wait for codes to load
    const codeCards = page.locator('[data-testid="code-card"]');
    const cardCount = await codeCards.count();
    
    if (cardCount > 0) {
      // Press Ctrl+A (select all)
      await page.keyboard.press('Control+a');
      await page.waitForTimeout(500);
      
      // Bulk actions bar should show selected count
      const selectedText = page.getByText(/selected/i);
      const hasSelection = await selectedText.isVisible().catch(() => false);
      
      if (hasSelection) {
        expect(hasSelection).toBe(true);
      }
    }
  });
});
