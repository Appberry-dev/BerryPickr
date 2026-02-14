import { describe, expect, test } from 'vitest';
import { createBerryPickrControllerManager } from '../src';

describe('controller manager', () => {
  test('registers and destroys managed controllers', () => {
    const manager = createBerryPickrControllerManager();
    const first = manager.create({ defaultValue: '#111111' });
    const second = manager.create({ defaultValue: '#222222' });

    expect(manager.list()).toHaveLength(2);
    expect(manager.get(first.instanceId)).toBe(first);

    manager.unregister(first.instanceId);
    expect(manager.list()).toHaveLength(1);

    manager.destroy();
    expect(manager.list()).toHaveLength(0);

    second.destroy();
  });

  test('handles high instance counts', () => {
    const manager = createBerryPickrControllerManager();

    const controllers = Array.from({ length: 60 }, (_, index) =>
      manager.create({
        defaultValue: `#${(index + 1).toString(16).padStart(6, '0')}`
      })
    );

    expect(manager.list()).toHaveLength(60);
    controllers.forEach((controller) => {
      expect(manager.get(controller.instanceId)).toBe(controller);
    });

    manager.destroy();
    expect(manager.list()).toHaveLength(0);
  });
});
