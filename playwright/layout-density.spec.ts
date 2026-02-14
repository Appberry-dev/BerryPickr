import { expect, test, type Page } from '@playwright/test';

interface DensityMetrics {
  appWidth: number;
  paletteHeight: number;
  inputHeight: number;
  buttonHeight: number;
  formatHeight: number;
  swatchHeight: number;
}

const readDensityMetrics = async (page: Page): Promise<DensityMetrics> => {
  return page.evaluate(() => {
    const app = document.querySelector<HTMLElement>('.bp-app');
    const palette = document.querySelector<HTMLElement>('.bp-palette');
    const input = document.querySelector<HTMLElement>('.bp-input');
    const button = document.querySelector<HTMLElement>('.bp-btn');
    const format = document.querySelector<HTMLElement>('.bp-format');
    const swatch = document.querySelector<HTMLElement>('.bp-swatch');

    if (!app || !palette || !input || !button || !format || !swatch) {
      throw new Error('Compact density metrics cannot be read because one or more UI elements are missing.');
    }

    return {
      appWidth: app.getBoundingClientRect().width,
      paletteHeight: palette.getBoundingClientRect().height,
      inputHeight: input.getBoundingClientRect().height,
      buttonHeight: button.getBoundingClientRect().height,
      formatHeight: format.getBoundingClientRect().height,
      swatchHeight: swatch.getBoundingClientRect().height
    };
  });
};

test('popover uses compact panel dimensions and 32px tap targets', async ({ page }) => {
  await page.goto('/');
  await page.locator('#berryPickr-target').click();
  await expect(page.locator('.bp-app')).toHaveClass(/is-open/);
  await page.waitForTimeout(250);

  const metrics = await readDensityMetrics(page);

  expect(metrics.appWidth).toBeLessThanOrEqual(310);
  expect(metrics.paletteHeight).toBeLessThan(150);

  expect(metrics.inputHeight).toBeGreaterThanOrEqual(32);
  expect(metrics.buttonHeight).toBeGreaterThanOrEqual(32);
  expect(metrics.formatHeight).toBeGreaterThanOrEqual(32);
  expect(metrics.swatchHeight).toBeGreaterThanOrEqual(32);
});

test('inline mode keeps compact panel width', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(() => {
    const scoped = window as unknown as Window & {
      mount: { update(next: { mode: 'inline' }): void };
    };

    scoped.mount.update({ mode: 'inline' });
  });

  const app = page.locator('.bp-app');
  await expect(app).toHaveClass(/is-inline/);
  await expect(app).toHaveClass(/is-open/);

  const metrics = await readDensityMetrics(page);
  expect(metrics.appWidth).toBeLessThanOrEqual(310);
});
