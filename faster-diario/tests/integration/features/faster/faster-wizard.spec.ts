import { test, expect, type Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('input[name="username"]').fill('user');
  await page.locator('input[name="password"]').fill('user1');
  await page.locator('#login-submit').click();
  await expect(page.locator('#view-app')).toBeVisible();
}

test.describe('FASTER wizard', () => {
  test('opens FASTER and advances from intro to first pillar', async ({ page }) => {
    await login(page);
    await page.locator('#landing-faster').click();
    await expect(page.locator('#step-start.active')).toBeVisible();
    await page.locator('#btn-start').click();
    await expect(page.locator('#step-restauracion.active')).toBeVisible();
  });
});
