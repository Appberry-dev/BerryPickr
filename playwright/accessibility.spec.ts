import { expect, test } from '@playwright/test';

test('picker exposes dialog and control aria labels', async ({ page }) => {
  await page.goto('/');
  await page.locator('#berryPickr-target').click();

  const app = page.locator('.bp-app');
  await expect(app).toHaveAttribute('role', 'dialog');
  await expect(app).toHaveAttribute('aria-label', /color/i);

  await expect(page.locator('.bp-palette')).toHaveAttribute('aria-label', /palette/i);
  await expect(page.locator('.bp-hue')).toHaveAttribute('aria-label', /hue/i);
  await expect(page.locator('.bp-hue')).toHaveAttribute('aria-valuenow', /.+/);
  await expect(page.locator('.bp-alpha')).toHaveAttribute('aria-label', /alpha/i);
  await expect(page.locator('.bp-alpha')).toHaveAttribute('aria-valuenow', /.+/);
  await expect(page.locator('.bp-input')).toHaveAttribute('aria-label', /input/i);
});

test('escape closes popover in default mode', async ({ page }) => {
  await page.goto('/');
  await page.locator('#berryPickr-target').click();

  await expect(page.locator('.bp-app')).toHaveClass(/is-open/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.bp-app')).not.toHaveClass(/is-open/);
});
