import { beforeEach, describe, expect, test } from 'vitest';
import { createBerryPickrController, mountBerryPickrUI } from '../src';

describe('mountBerryPickrUI', () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="target" type="button">Pick</button>';
  });

  test('syncs controller state into mounted UI', () => {
    const controller = createBerryPickrController({
      defaultValue: '#111111',
      swatches: ['#111111', '#222222'],
      formats: ['hex', 'rgba']
    });

    const mount = mountBerryPickrUI(controller, {
      target: '#target'
    });

    controller.setValue('#333333');
    const input = document.querySelector<HTMLInputElement>('.bp-input');
    if (!input) {
      throw new Error('Missing .bp-input');
    }

    expect(input.value).toBe('#333333');
    expect(mount.show()).toBe(true);
    expect(controller.isOpen()).toBe(true);

    mount.destroy({ remove: true });
    controller.destroy();
  });

  test('syncs UI actions back into controller', () => {
    const controller = createBerryPickrController({
      defaultValue: '#222222'
    });

    const mount = mountBerryPickrUI(controller, {
      target: '#target'
    });

    const clearButton = document.querySelector<HTMLButtonElement>('.bp-clear');
    if (!clearButton) {
      throw new Error('Missing clear button.');
    }

    clearButton.click();
    expect(controller.getState().value).toBeNull();

    mount.destroy({ remove: true });
    controller.destroy();
  });

  test('update applies options without remounting root node', () => {
    const controller = createBerryPickrController({
      defaultValue: '#222222'
    });

    const mount = mountBerryPickrUI(controller, {
      target: '#target',
      closeOnOutsideClick: true
    });

    const before = document.querySelector('.bp-app');
    if (!before) {
      throw new Error('Missing .bp-app before update.');
    }

    mount.update({
      closeOnOutsideClick: false,
      closeOnEscape: false
    });

    const after = document.querySelector('.bp-app');
    expect(after).toBe(before);
    expect(mount.focus('input')).toBe(true);

    mount.destroy({ remove: true });
    controller.destroy();
  });
});
