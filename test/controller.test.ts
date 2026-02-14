import { describe, expect, test, vi } from 'vitest';
import { createBerryPickrController } from '../src';

describe('BerryPickr controller', () => {
  test('emits metadata on change and commit', () => {
    const controller = createBerryPickrController({
      defaultValue: '#112233',
      formats: ['hex', 'rgba']
    });

    const onChange = vi.fn();
    const onCommit = vi.fn();

    controller.on('change', onChange);
    controller.on('commit', onCommit);

    expect(controller.setValue('#445566', { source: 'api' })).toBe(true);

    const changeEvent = onChange.mock.calls[0]?.[0];
    expect(changeEvent).toBeDefined();
    expect(changeEvent.instanceId).toMatch(/^bp_/);
    expect(changeEvent.transactionId).toContain(changeEvent.instanceId);
    expect(changeEvent.value?.to('hex')).toBe('#445566');

    const transactionId = controller.commit({ source: 'commit' });
    expect(transactionId).toBeTypeOf('string');
    expect(onCommit).toHaveBeenCalledTimes(1);

    controller.destroy();
  });

  test('supports undo and redo history', () => {
    const controller = createBerryPickrController({ defaultValue: '#101010' });

    controller.setValue('#202020');
    controller.setValue('#303030');

    expect(controller.undo()).toBe(true);
    expect(controller.getState().value?.to('hex')).toBe('#202020');

    expect(controller.redo()).toBe(true);
    expect(controller.getState().value?.to('hex')).toBe('#303030');

    controller.destroy();
  });

  test('supports cancel and multi-context values', () => {
    const controller = createBerryPickrController({ defaultValue: '#111111' });

    controller.commit();
    controller.setValue('#222222');
    expect(controller.cancel()).toBe(true);
    expect(controller.getState().value?.to('hex')).toBe('#111111');

    expect(controller.selectContext('hover')).toBe(true);
    expect(controller.setValue('#333333', { source: 'context' })).toBe(true);
    expect(controller.getContextValue('hover')?.to('hex')).toBe('#333333');

    expect(controller.selectContext('default')).toBe(true);
    expect(controller.getState().value?.to('hex')).toBe('#111111');

    controller.destroy();
  });

  test('applies presets and tracks recent colors on commit', () => {
    const controller = createBerryPickrController({
      presets: {
        brand: ['#202020', '#404040']
      }
    });

    expect(controller.applyPreset('brand', 1)).toBe(true);
    controller.commit();

    expect(controller.getState().value?.to('hex')).toBe('#404040');
    expect(controller.getRecentColors()[0]?.to('hex')).toBe('#404040');

    controller.destroy();
  });

  test('runs plugin hooks', () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();

    const controller = createBerryPickrController({
      plugins: [
        {
          name: 'spy-plugin',
          onChange,
          onCommit
        }
      ]
    });

    controller.setValue('#121212');
    controller.commit();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledTimes(1);

    controller.destroy();
  });

  test('emits pluginError when plugin hook throws and policy is emit', () => {
    const controller = createBerryPickrController({
      pluginErrorPolicy: 'emit',
      plugins: [
        {
          name: 'broken',
          onChange: () => {
            throw new Error('boom');
          }
        }
      ]
    });

    const onPluginError = vi.fn();
    controller.on('pluginError', onPluginError);

    expect(controller.setValue('#121212')).toBe(true);
    expect(onPluginError).toHaveBeenCalledTimes(1);
    expect(onPluginError.mock.calls[0]?.[0].plugin).toBe('broken');
    expect(onPluginError.mock.calls[0]?.[0].phase).toBe('change');

    controller.destroy();
  });

  test('throws plugin errors when policy is throw', () => {
    const controller = createBerryPickrController({
      pluginErrorPolicy: 'throw',
      plugins: [
        {
          name: 'broken',
          onCommit: () => {
            throw new Error('commit fail');
          }
        }
      ]
    });

    expect(() => controller.commit()).toThrowError('commit fail');
    controller.destroy();
  });

  test('ensures non-empty formats when lockAlpha filters requested formats', () => {
    const controller = createBerryPickrController({
      lockAlpha: true,
      formats: ['rgba', 'hsla', 'hexa']
    });

    expect(controller.getFormats().length).toBeGreaterThan(0);
    expect(controller.getFormats()).toEqual(['hex', 'rgb', 'hsl', 'hsv', 'cmyk']);
    expect(controller.getFormat()).toBe('hex');

    controller.destroy();
  });

  test('captures setup and teardown plugin failures with emit policy', () => {
    const controller = createBerryPickrController({
      pluginErrorPolicy: 'emit',
      plugins: [
        {
          name: 'setup-fail',
          setup: () => {
            throw new Error('setup fail');
          }
        },
        {
          name: 'teardown-fail',
          setup: () => {
            return () => {
              throw new Error('teardown fail');
            };
          }
        }
      ]
    });

    const onPluginError = vi.fn();
    controller.on('pluginError', onPluginError);
    controller.setValue('#abcdef');
    controller.destroy();

    const phases = onPluginError.mock.calls.map((call) => call[0].phase);
    expect(phases).toContain('teardown');
  });
});
