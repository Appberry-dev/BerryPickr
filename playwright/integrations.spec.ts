import { expect, test } from '@playwright/test';

test('iframe integration supports positioning, outside-click, and escape close', async ({ page }) => {
  await page.goto('/');

  const created = await page.evaluate(async () => {
    const scoped = window as unknown as Window & {
      createIframeIntegration: () => Promise<boolean>;
    };

    return scoped.createIframeIntegration();
  });
  expect(created).toBe(true);

  const frame = page.frameLocator('#bp-test-iframe');

  await frame.locator('#iframe-target').click();
  await expect(frame.locator('.bp-app')).toHaveClass(/is-open/);

  const positioned = await page.evaluate(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('#bp-test-iframe');
    const iframeDoc = iframe?.contentDocument;
    const iframeWindow = iframe?.contentWindow;
    const app = iframeDoc?.querySelector<HTMLElement>('.bp-app');
    if (!app) {
      return false;
    }

    const rect = app.getBoundingClientRect();
    return (
      rect.left >= 0 &&
      rect.top >= 0 &&
      rect.right <= (iframeWindow?.innerWidth ?? 0) &&
      rect.bottom <= (iframeWindow?.innerHeight ?? 0)
    );
  });
  expect(positioned).toBe(true);

  await frame.locator('body').click({ position: { x: 2, y: 2 } });
  await expect(frame.locator('.bp-app')).not.toHaveClass(/is-open/);

  await frame.locator('#iframe-target').click();
  await expect(frame.locator('.bp-app')).toHaveClass(/is-open/);
  await page.evaluate(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('#bp-test-iframe');
    iframe?.contentDocument?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
  await expect(frame.locator('.bp-app')).not.toHaveClass(/is-open/);
});

test('shadow integration handles outside click and keyboard flow', async ({ page }) => {
  await page.goto('/');

  const created = await page.evaluate(() => {
    const scoped = window as unknown as Window & {
      createShadowIntegration: () => boolean;
    };
    return scoped.createShadowIntegration();
  });
  expect(created).toBe(true);

  const host = page.locator('#bp-test-shadow-host');
  await host.locator('#shadow-target').click();
  await expect(host.locator('.bp-app')).toHaveClass(/is-open/);

  const before = await page.evaluate(() => {
    const scoped = window as unknown as Window & {
      shadowController: { getState(): { value: { to(format: 'hexa'): string } | null } };
    };

    return scoped.shadowController.getState().value?.to('hexa') ?? null;
  });

  await host.locator('.bp-hue').focus();
  await page.keyboard.press('ArrowRight');

  const after = await page.evaluate(() => {
    const scoped = window as unknown as Window & {
      shadowController: { getState(): { value: { to(format: 'hexa'): string } | null } };
    };

    return scoped.shadowController.getState().value?.to('hexa') ?? null;
  });

  expect(after).not.toBe(before);

  await host.locator('#shadow-outside').click();
  await expect(host.locator('.bp-app')).not.toHaveClass(/is-open/);
});
