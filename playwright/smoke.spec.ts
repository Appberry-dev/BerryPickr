import { expect, test } from '@playwright/test';

test('open, adjust, save flow works', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/');

  await page.locator('#berryPickr-target').click();
  await expect(page.locator('.bp-app')).toHaveClass(/is-open/);

  const palette = page.locator('.bp-palette');
  const box = await palette.boundingBox();
  if (!box) {
    throw new Error('Palette did not render in fixture.');
  }

  await page.mouse.click(box.x + box.width * 0.78, box.y + box.height * 0.22);
  await page.locator('.bp-save').click();

  await expect(page.locator('#result')).not.toHaveText('');
  await expect(page.locator('.bp-app')).not.toHaveClass(/is-open/);
});
