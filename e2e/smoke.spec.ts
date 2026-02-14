
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Extreme V2/);
});

test('sidebar navigation', async ({ page }) => {
  await page.goto('/');
  // Check if sidebar contains "Trending" link
  const sidebar = page.locator('aside'); // Assuming sidebar is an aside element or use role
  // If we can't rely on semantic role, check for text 'Trending' which should be in the sidebar
  await expect(page.getByText('Trending', { exact: true })).toBeVisible();
});

test('search functionality', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[placeholder="Search videos..."]', 'test video');
  await page.press('input[placeholder="Search videos..."]', 'Enter');
  
  await expect(page).toHaveURL(/\/search\?q=test%20video/);
  await expect(page.locator('h1')).toContainText('Search results for "test video"');
});
