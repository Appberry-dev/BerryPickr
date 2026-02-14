import { expect, test } from '@playwright/test';

test('keyboard interaction on hue slider updates color', async ({ page }) => {
  await page.goto('/');
  await page.locator('#berryPickr-target').click();

  const hue = page.locator('.bp-hue');
  await hue.focus();
  await page.keyboard.press('ArrowRight');

  await expect(page.locator('#result')).not.toHaveText('');
});

test('strict input rejects malformed value and keeps prior color', async ({ page }) => {
  await page.goto('/');
  await page.locator('#berryPickr-target').click();

  const input = page.locator('.bp-input');
  const result = page.locator('#result');

  await input.fill('rgb(255 0 0 / 50%)');
  await expect(result).toHaveText('rgba(255, 0, 0, 0.5)');

  const before = await result.textContent();
  await input.fill('rgb(255, 0 0)');

  await expect(input).toHaveClass(/is-invalid/);
  await expect(result).toHaveText(before ?? '');
});
