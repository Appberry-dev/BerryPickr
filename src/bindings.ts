import type {
  BerryPickrBinding,
  BerryPickrBindingTarget,
  BerryPickrColor,
  BerryPickrContext,
  BerryPickrCssVarBindingConfig,
  BerryPickrFormat,
  BerryPickrStateSnapshot,
  BerryPickrStyleBindingConfig
} from './types';

const resolveTarget = (target: BerryPickrBindingTarget): HTMLElement | null => {
  if (typeof target === 'function') {
    return target();
  }

  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target);
  }

  return target;
};

const getContextColor = (
  snapshot: BerryPickrStateSnapshot,
  context: BerryPickrContext | undefined
): BerryPickrColor | null => {
  if (context) {
    return snapshot.contexts[context] ?? null;
  }

  return snapshot.value;
};

const getColorValue = (
  snapshot: BerryPickrStateSnapshot,
  context: BerryPickrContext | undefined,
  format: BerryPickrFormat
): string | null => {
  const color = getContextColor(snapshot, context);
  return color ? color.to(format, snapshot.precision) : null;
};

const createSyncBinding = (
  event: 'change' | 'commit' | undefined,
  subscribeOnChange: (listener: (snapshot: BerryPickrStateSnapshot) => void) => () => void,
  subscribeOnCommit: (listener: (snapshot: BerryPickrStateSnapshot) => void) => () => void,
  sync: () => boolean
): (() => void) => {
  if (event === 'commit') {
    return subscribeOnCommit(() => {
      sync();
    });
  }

  return subscribeOnChange(() => {
    sync();
  });
};

/**
 * Binds the controller color to a CSS custom property on a target element.
 *
 * @param config Binding configuration for element resolution and formatting.
 * @returns A binding handle that can sync immediately or be destroyed.
 */
export const createCssVarBinding = (config: BerryPickrCssVarBindingConfig): BerryPickrBinding => {
  const format = config.format ?? 'hexa';

  const sync = (): boolean => {
    const target = resolveTarget(config.target);
    if (!target) {
      return false;
    }

    const snapshot = config.controller.getState();
    const value = getColorValue(snapshot, config.context, format) ?? config.fallback;

    if (value === undefined) {
      target.style.removeProperty(config.variable);
      return true;
    }

    target.style.setProperty(config.variable, value);
    return true;
  };

  const unsubscribe = createSyncBinding(
    config.event,
    (listener) => config.controller.subscribe(listener),
    (listener) => config.controller.on('commit', () => listener(config.controller.getState())),
    sync
  );

  sync();

  return {
    sync,
    destroy(): void {
      unsubscribe();
    }
  };
};

/**
 * Binds the controller color to a regular inline style property on a target element.
 *
 * @param config Binding configuration for element resolution and formatting.
 * @returns A binding handle that can sync immediately or be destroyed.
 */
export const createStyleBinding = (config: BerryPickrStyleBindingConfig): BerryPickrBinding => {
  const format = config.format ?? 'hexa';

  const sync = (): boolean => {
    const target = resolveTarget(config.target);
    if (!target) {
      return false;
    }

    const snapshot = config.controller.getState();
    const value = getColorValue(snapshot, config.context, format) ?? config.fallback;

    if (value === undefined) {
      target.style.removeProperty(config.property);
      return true;
    }

    target.style.setProperty(config.property, value);
    return true;
  };

  const unsubscribe = createSyncBinding(
    config.event,
    (listener) => config.controller.subscribe(listener),
    (listener) => config.controller.on('commit', () => listener(config.controller.getState())),
    sync
  );

  sync();

  return {
    sync,
    destroy(): void {
      unsubscribe();
    }
  };
};
