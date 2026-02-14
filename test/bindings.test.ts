import { beforeEach, describe, expect, test } from 'vitest';
import { createBerryPickrController, createCssVarBinding, createStyleBinding } from '../src';

describe('binding helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="node"></div>';
  });

  test('syncs CSS custom property on change by default', () => {
    const controller = createBerryPickrController({ defaultValue: '#111111' });

    const binding = createCssVarBinding({
      controller,
      target: '#node',
      variable: '--brand-color',
      format: 'hex'
    });

    const target = document.querySelector<HTMLElement>('#node');
    if (!target) {
      throw new Error('Missing #node target.');
    }

    expect(target.style.getPropertyValue('--brand-color')).toBe('#111111');

    controller.setValue('#222222');
    expect(target.style.getPropertyValue('--brand-color')).toBe('#222222');

    binding.destroy();
    controller.destroy();
  });

  test('syncs style property on commit when configured', () => {
    const controller = createBerryPickrController({ defaultValue: '#202020' });

    const binding = createStyleBinding({
      controller,
      target: '#node',
      property: 'background-color',
      format: 'hex',
      event: 'commit'
    });

    const target = document.querySelector<HTMLElement>('#node');
    if (!target) {
      throw new Error('Missing #node target.');
    }

    expect(target.style.getPropertyValue('background-color')).toBe('rgb(32, 32, 32)');

    controller.setValue('#303030');
    expect(target.style.getPropertyValue('background-color')).toBe('rgb(32, 32, 32)');

    controller.commit();
    expect(target.style.getPropertyValue('background-color')).toBe('rgb(48, 48, 48)');

    binding.destroy();
    controller.destroy();
  });

  test('supports context-specific bindings', () => {
    const controller = createBerryPickrController({ defaultValue: '#010101' });
    controller.selectContext('hover');
    controller.setValue('#121212');

    const binding = createCssVarBinding({
      controller,
      target: '#node',
      variable: '--hover-color',
      format: 'hex',
      context: 'hover'
    });

    const target = document.querySelector<HTMLElement>('#node');
    if (!target) {
      throw new Error('Missing #node target.');
    }

    expect(target.style.getPropertyValue('--hover-color')).toBe('#121212');

    binding.destroy();
    controller.destroy();
  });
});
