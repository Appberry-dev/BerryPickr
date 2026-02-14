import { colorFromHsva } from './core/color';
import { syncColorUi, syncDisabledUi, syncFormatUi } from './ui/sync';
import { createInputController, type InputController } from './ui/controllers/input';
import { createSliderController, type SliderController } from './ui/controllers/slider';
import { createSwatchesController, type SwatchesController } from './ui/controllers/swatches';
import { createDom } from './ui/dom';
import { createPositioningController, type PositioningController } from './ui/positioning';
import type {
  BerryPickrComponents,
  BerryPickrController,
  BerryPickrFormat,
  BerryPickrI18n,
  BerryPickrMode,
  BerryPickrStateSnapshot,
  BerryPickrUIFocusPart,
  BerryPickrUIOptions,
  BerryPickrUIMount
} from './types';

const DEFAULT_I18N: BerryPickrI18n = {
  dialog: 'Color berryPickr dialog',
  toggle: 'Toggle color berryPickr',
  save: 'Save',
  cancel: 'Cancel',
  clear: 'Clear',
  swatch: 'Color swatch',
  input: 'Color input',
  palette: 'Color palette',
  hue: 'Hue slider',
  alpha: 'Alpha slider'
};

const DEFAULT_COMPONENTS: BerryPickrComponents = {
  preview: true,
  palette: true,
  hue: true,
  alpha: true,
  input: true,
  save: true,
  cancel: true,
  clear: true
};

const DEFAULT_HSVA: [number, number, number, number] = [0, 100, 100, 1];

interface ResolvedMountOptions {
  target: HTMLElement;
  container: HTMLElement;
  ownerDocument: Document;
  ownerWindow: Window;
  mode: BerryPickrMode;
  showAlways: boolean;
  closeOnEscape: boolean;
  closeOnOutsideClick: boolean;
  closeOnScroll: boolean;
  autoReposition: boolean;
  adjustableInputNumbers: boolean;
  components: BerryPickrComponents;
  i18n: BerryPickrI18n;
}

const getGlobalDocument = (): Document => {
  if (typeof document === 'undefined') {
    throw new Error('mountBerryPickrUI requires a browser-like document.');
  }

  return document;
};

const isElement = (value: unknown): value is HTMLElement => {
  return Boolean(value) && typeof value === 'object' && (value as Node).nodeType === 1;
};

const resolveElement = (
  value: string | HTMLElement | undefined,
  ownerDocument: Document,
  fallback?: HTMLElement
): HTMLElement => {
  if (isElement(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const found = ownerDocument.querySelector<HTMLElement>(value);
    if (!found) {
      throw new Error(`BerryPickr UI could not resolve element: ${value}`);
    }
    return found;
  }

  if (fallback) {
    return fallback;
  }

  throw new Error('BerryPickr UI could not resolve a required element.');
};

const resolveMountOptions = (
  input: Partial<BerryPickrUIOptions>,
  previous: ResolvedMountOptions | undefined,
  lockAlpha: boolean
): ResolvedMountOptions => {
  const baseDocument =
    isElement(input.target) ? input.target.ownerDocument : previous?.ownerDocument ?? getGlobalDocument();
  const target = resolveElement(input.target ?? previous?.target, baseDocument);
  const ownerDocument = target.ownerDocument ?? baseDocument;
  const ownerWindow = ownerDocument.defaultView ?? window;
  const container = resolveElement(input.container ?? previous?.container, ownerDocument, ownerDocument.body as HTMLElement);

  if (previous && target !== previous.target) {
    throw new Error('mount.update() does not support changing `target`; remount instead.');
  }

  if (previous && container !== previous.container) {
    throw new Error('mount.update() does not support changing `container`; remount instead.');
  }

  return {
    target,
    container,
    ownerDocument,
    ownerWindow,
    mode: input.mode ?? previous?.mode ?? 'popover',
    showAlways: input.showAlways ?? previous?.showAlways ?? false,
    closeOnEscape: input.closeOnEscape ?? previous?.closeOnEscape ?? true,
    closeOnOutsideClick: input.closeOnOutsideClick ?? previous?.closeOnOutsideClick ?? true,
    closeOnScroll: input.closeOnScroll ?? previous?.closeOnScroll ?? false,
    autoReposition: input.autoReposition ?? previous?.autoReposition ?? true,
    adjustableInputNumbers: input.adjustableInputNumbers ?? previous?.adjustableInputNumbers ?? true,
    components: {
      ...DEFAULT_COMPONENTS,
      ...previous?.components,
      ...input.components,
      alpha: lockAlpha ? false : input.components?.alpha ?? previous?.components.alpha ?? DEFAULT_COMPONENTS.alpha
    },
    i18n: {
      ...DEFAULT_I18N,
      ...previous?.i18n,
      ...input.i18n
    }
  };
};

const equalFormats = (left: BerryPickrFormat[], right: BerryPickrFormat[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
};

/**
 * Mounts BerryPickr UI controls for an existing headless controller.
 *
 * @param controller Controller instance that owns the picker state.
 * @param options UI mounting and behavior options.
 * @returns A mount handle for show/hide/focus/update/destroy operations.
 */
export const mountBerryPickrUI = (controller: BerryPickrController, options: BerryPickrUIOptions): BerryPickrUIMount => {
  const initial = controller.getState();
  let resolved = resolveMountOptions(options, undefined, initial.lockAlpha);
  let destroyed = false;
  let renderedSwatchSignature = '';

  const dom = createDom({
    ...resolved,
    disabled: initial.disabled,
    formats: initial.formats
  });

  const getMutableHsva = (): [number, number, number, number] => {
    const current = controller.getState().value;
    return current ? current.toHSVA() : [...DEFAULT_HSVA];
  };

  const createInput = (): InputController =>
    createInputController({
      input: dom.input,
      adjustableNumbers: resolved.adjustableInputNumbers,
      onValueChange: (value) => {
        return controller.setValue(value, { source: 'input' });
      },
      onCommit: () => {
        // The headless controller has explicit commit APIs; blur/enter does not auto-commit by default.
      }
    });

  let inputController = createInput();

  const swatchesController: SwatchesController = createSwatchesController({
    ownerDocument: resolved.ownerDocument,
    container: dom.swatches,
    label: resolved.i18n.swatch,
    onSelect: (index) => {
      const selected = controller.getState().swatches[index];
      if (!selected) {
        return;
      }

      controller.setValue(selected.to('hexa'), { source: 'swatch' });
    }
  });

  const sliders: {
    palette: SliderController;
    hue: SliderController;
    alpha: SliderController;
  } = {
    palette: createSliderController({
      axis: '2d',
      track: dom.palette.track,
      knob: dom.palette.knob,
      onChange: (x, y) => {
        const hsva = getMutableHsva();
        hsva[1] = x * 100;
        hsva[2] = (1 - y) * 100;
        controller.setValue(colorFromHsva(hsva).to('hexa'), { source: 'palette' });
      },
      onEnd: () => {}
    }),
    hue: createSliderController({
      axis: 'x',
      track: dom.hue.track,
      knob: dom.hue.knob,
      onChange: (x) => {
        const hsva = getMutableHsva();
        hsva[0] = x * 360;
        controller.setValue(colorFromHsva(hsva).to('hexa'), { source: 'hue' });
      },
      onEnd: () => {}
    }),
    alpha: createSliderController({
      axis: 'x',
      track: dom.alpha.track,
      knob: dom.alpha.knob,
      onChange: (x) => {
        const state = controller.getState();
        const hsva = getMutableHsva();
        hsva[3] = state.lockAlpha ? 1 : x;
        controller.setValue(colorFromHsva(hsva).to('hexa'), { source: 'alpha' });
      },
      onEnd: () => {}
    })
  };

  const createPositioning = (): PositioningController =>
    createPositioningController({
      trigger: dom.trigger,
      app: dom.app,
      ownerWindow: resolved.ownerWindow,
      autoReposition: resolved.autoReposition,
      closeOnScroll: resolved.closeOnScroll,
      onScrollClose: () => {
        controller.setOpen(false);
      },
      isOpen: () => controller.isOpen()
    });

  let positioning = createPositioning();
  let formatButtonCleanup: Array<() => void> = [];
  const cleanup: Array<() => void> = [];

  const shouldForceOpen = (snapshot: BerryPickrStateSnapshot): boolean =>
    !snapshot.disabled && (resolved.mode === 'inline' || resolved.showAlways);
  const shouldAutoHidePopover = (): boolean => resolved.mode === 'popover' && !resolved.showAlways;

  const syncPlacement = (): void => {
    if (resolved.mode === 'inline') {
      if (!dom.app.classList.contains('is-inline')) {
        dom.app.classList.add('is-inline');
      }

      if (dom.app.previousElementSibling !== resolved.target || dom.app.parentElement !== resolved.target.parentElement) {
        resolved.target.insertAdjacentElement('afterend', dom.app);
      }
      return;
    }

    dom.app.classList.remove('is-inline');
    if (dom.app.parentElement !== resolved.container) {
      resolved.container.appendChild(dom.app);
    }
  };

  const applyVisibility = (): void => {
    dom.preview.container.hidden = !resolved.components.preview;
    dom.palette.track.hidden = !resolved.components.palette;
    dom.hue.track.hidden = !resolved.components.hue;
    dom.alpha.track.hidden = !resolved.components.alpha;
    dom.input.hidden = !resolved.components.input;
    dom.saveButton.hidden = !resolved.components.save;
    dom.cancelButton.hidden = !resolved.components.cancel;
    dom.clearButton.hidden = !resolved.components.clear;
  };

  const applyI18n = (): void => {
    dom.trigger.setAttribute('aria-label', resolved.i18n.toggle);
    dom.app.setAttribute('aria-label', resolved.i18n.dialog);
    dom.palette.track.setAttribute('aria-label', resolved.i18n.palette);
    dom.hue.track.setAttribute('aria-label', resolved.i18n.hue);
    dom.alpha.track.setAttribute('aria-label', resolved.i18n.alpha);
    dom.swatches.setAttribute('aria-label', resolved.i18n.swatch);
    dom.input.setAttribute('aria-label', resolved.i18n.input);
    dom.preview.saved.setAttribute('aria-label', resolved.i18n.cancel);
    dom.saveButton.textContent = resolved.i18n.save;
    dom.cancelButton.textContent = resolved.i18n.cancel;
    dom.clearButton.textContent = resolved.i18n.clear;
  };

  const unbindFormatButtons = (): void => {
    for (const teardown of formatButtonCleanup) {
      teardown();
    }
    formatButtonCleanup = [];
  };

  const bindFormatButtons = (): void => {
    unbindFormatButtons();
    for (const button of dom.formats.values()) {
      const onClick = (): void => {
        const nextFormat = button.dataset.format as BerryPickrFormat | undefined;
        if (nextFormat) {
          controller.setFormat(nextFormat);
        }
      };

      button.addEventListener('click', onClick);
      formatButtonCleanup.push(() => {
        button.removeEventListener('click', onClick);
      });
    }
  };

  const syncFormatButtons = (formats: BerryPickrFormat[]): void => {
    const current = Array.from(dom.formats.keys());
    if (equalFormats(current, formats)) {
      return;
    }

    unbindFormatButtons();
    for (const button of dom.formats.values()) {
      button.remove();
    }
    dom.formats.clear();

    for (const format of formats) {
      const button = resolved.ownerDocument.createElement('button');
      button.type = 'button';
      button.className = 'bp-format';
      button.dataset.format = format;
      button.textContent = format.toUpperCase();
      dom.formats.set(format, button);
      dom.formatStrip.appendChild(button);
    }

    bindFormatButtons();
  };

  const syncFromState = (snapshot: BerryPickrStateSnapshot): void => {
    if (shouldForceOpen(snapshot) && !snapshot.open) {
      controller.setOpen(true);
      return;
    }

    syncPlacement();
    applyVisibility();
    applyI18n();
    syncFormatButtons(snapshot.formats);

    const swatchSignature = snapshot.swatches.map((swatch) => swatch.to('hexa')).join(',');
    if (swatchSignature !== renderedSwatchSignature) {
      swatchesController.render(snapshot.swatches);
      renderedSwatchSignature = swatchSignature;
    }

    syncColorUi({
      dom,
      sliders,
      inputController,
      swatchesController,
      current: snapshot.value,
      saved: snapshot.savedValue,
      format: snapshot.format,
      precision: snapshot.precision
    });
    syncFormatUi({
      dom,
      format: snapshot.format
    });
    syncDisabledUi({
      dom,
      disabled: snapshot.disabled
    });

    const open = shouldForceOpen(snapshot) || snapshot.open;
    dom.app.classList.toggle('is-open', open);
    if (open && resolved.mode === 'popover') {
      positioning.reposition();
    }
  };

  const onToggle = (): void => {
    if (resolved.mode !== 'popover' || resolved.showAlways) {
      return;
    }

    if (controller.isOpen()) {
      controller.setOpen(false);
    } else {
      controller.setOpen(true);
    }
  };

  const onSave = (): void => {
    controller.commit({ source: 'commit' });
    if (shouldAutoHidePopover()) {
      controller.setOpen(false);
    }
  };

  const onCancel = (): void => {
    controller.cancel();
  };

  const onClear = (): void => {
    controller.setValue(null, { source: 'clear' });
    if (shouldAutoHidePopover()) {
      controller.setOpen(false);
    }
  };

  const onDocumentPointer = (event: PointerEvent): void => {
    if (!resolved.closeOnOutsideClick || !controller.isOpen() || resolved.mode !== 'popover') {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (dom.app.contains(target) || dom.trigger.contains(target)) {
      return;
    }

    controller.setOpen(false);
  };

  const onEscape = (event: KeyboardEvent): void => {
    if (!resolved.closeOnEscape || !controller.isOpen() || event.key !== 'Escape' || resolved.mode !== 'popover') {
      return;
    }

    controller.setOpen(false);
  };

  dom.trigger.addEventListener('click', onToggle);
  dom.saveButton.addEventListener('click', onSave);
  dom.cancelButton.addEventListener('click', onCancel);
  dom.preview.saved.addEventListener('click', onCancel);
  dom.clearButton.addEventListener('click', onClear);
  resolved.ownerDocument.addEventListener('pointerdown', onDocumentPointer);
  resolved.ownerDocument.addEventListener('keydown', onEscape);

  cleanup.push(() => dom.trigger.removeEventListener('click', onToggle));
  cleanup.push(() => dom.saveButton.removeEventListener('click', onSave));
  cleanup.push(() => dom.cancelButton.removeEventListener('click', onCancel));
  cleanup.push(() => dom.preview.saved.removeEventListener('click', onCancel));
  cleanup.push(() => dom.clearButton.removeEventListener('click', onClear));
  cleanup.push(() => resolved.ownerDocument.removeEventListener('pointerdown', onDocumentPointer));
  cleanup.push(() => resolved.ownerDocument.removeEventListener('keydown', onEscape));

  bindFormatButtons();
  const unsubscribe = controller.subscribe((snapshot) => {
    syncFromState(snapshot);
  });

  syncFromState(initial);

  return {
    show(): boolean {
      if (destroyed) {
        return false;
      }

      return controller.setOpen(true);
    },
    hide(): boolean {
      if (destroyed || shouldForceOpen(controller.getState())) {
        return false;
      }

      return controller.setOpen(false);
    },
    isOpen(): boolean {
      const state = controller.getState();
      return shouldForceOpen(state) || state.open;
    },
    getController(): BerryPickrController {
      return controller;
    },
    update(next: Partial<BerryPickrUIOptions>): void {
      if (destroyed) {
        return;
      }

      const previous = resolved;
      const snapshot = controller.getState();
      resolved = resolveMountOptions(next, resolved, snapshot.lockAlpha);

      const positioningChanged =
        previous.autoReposition !== resolved.autoReposition || previous.closeOnScroll !== resolved.closeOnScroll;
      if (positioningChanged) {
        positioning.destroy();
        positioning = createPositioning();
      }

      if (previous.adjustableInputNumbers !== resolved.adjustableInputNumbers) {
        inputController.destroy();
        inputController = createInput();
      }

      if (previous.i18n.swatch !== resolved.i18n.swatch) {
        renderedSwatchSignature = '';
      }

      syncFromState(snapshot);
    },
    focus(part: BerryPickrUIFocusPart = 'palette'): boolean {
      if (destroyed) {
        return false;
      }

      const target =
        part === 'input'
          ? dom.input
          : part === 'hue'
            ? dom.hue.track
            : part === 'alpha'
              ? dom.alpha.track
              : dom.palette.track;

      if (target.hidden) {
        return false;
      }

      target.focus();
      return true;
    },
    destroy(opts?: { remove?: boolean }): void {
      if (destroyed) {
        return;
      }

      destroyed = true;
      unsubscribe();
      unbindFormatButtons();

      for (const teardown of cleanup) {
        teardown();
      }

      sliders.palette.destroy();
      sliders.hue.destroy();
      sliders.alpha.destroy();
      inputController.destroy();
      swatchesController.destroy();
      positioning.destroy();

      dom.app.classList.remove('is-open');
      if (opts?.remove) {
        dom.app.remove();
      }
    }
  };
};
