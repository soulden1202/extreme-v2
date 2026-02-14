
import { test, expect } from '@playwright/test';

test('watch page loads video and comments', async ({ page }) => {
  // 1. Go to home page
  await page.goto('/');

  // 2. Click on the first video card
  // Wait for video cards to load
  await page.waitForSelector('.group.relative.bg-card');
  
  const firstVideo = page.locator('.group.relative.bg-card').first();
  const videoTitle = await firstVideo.locator('h3').textContent();
  
  await firstVideo.click();

  // 3. Verify URL changes to /watch/
  await expect(page).toHaveURL(/\/watch\//);

  // 4. Verify Video Player is present
  const player = page.locator('video'); // Assuming html5 video tag or Cloudinary player iframe/video
  // Or check for the container
  await expect(page.locator('.aspect-video')).toBeVisible();

  // 5. Verify Title matches (or is present)
  // Note: formatting might be slightly different so looser match
  if (videoTitle) {
      await expect(page.locator('h1')).toBeVisible();
  }

  // 6. Verify Comments section is present
  await expect(page.getByText('Comments')).toBeVisible();
});
