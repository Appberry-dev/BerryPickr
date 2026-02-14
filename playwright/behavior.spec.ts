import { expect, test } from '@playwright/test';

test('outside click closes popover', async ({ page }) => {
  await page.goto('/');
  await page.locator('#berryPickr-target').click();
  await expect(page.locator('.bp-app')).toHaveClass(/is-open/);

  await page.mouse.click(10, 10);
  await expect(page.locator('.bp-app')).not.toHaveClass(/is-open/);
});

test('disabled picker cannot open', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(() => {
    const scoped = window as unknown as Window & {
      controller: { setDisabled(disabled: boolean): void };
    };

    scoped.controller.setDisabled(true);
  });

  await page.locator('#berryPickr-target').click();
  await expect(page.locator('.bp-app')).not.toHaveClass(/is-open/);
});

test('swatch click updates selection output', async ({ page }) => {
  await page.goto('/');
  await page.locator('#berryPickr-target').click();

  const before = await page.locator('#result').textContent();
  await page.locator('.bp-swatch').nth(1).click();

  await expect(page.locator('#result')).not.toHaveText(before ?? '');
});
