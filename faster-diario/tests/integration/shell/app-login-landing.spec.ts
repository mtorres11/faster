import { test, expect } from '@playwright/test';

test.describe('app shell (served www)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('login with demo user shows landing with tiles', async ({ page }) => {
    await expect(page.locator('#view-login')).toBeVisible();
    await page.locator('input[name="username"]').fill('admin');
    await page.locator('input[name="password"]').fill('admin1');
    await page.locator('#login-submit').click();
    await expect(page.locator('#view-app')).toBeVisible();
    await expect(page.locator('#view-landing.feature-view.active')).toBeVisible();
    await expect(page.locator('#landing-faster')).toBeVisible();
  });
});
