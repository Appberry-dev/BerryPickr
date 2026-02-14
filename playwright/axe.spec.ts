import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('picker has no serious a11y violations when open', async ({ page }) => {
  await page.goto('/');
  await page.locator('#berryPickr-target').click();

  const report = await new AxeBuilder({ page }).include('.bp-app').analyze();
  const serious = report.violations.filter((violation) => {
    return violation.impact === 'serious' || violation.impact === 'critical';
  });

  expect(serious).toEqual([]);
});
