import { colorFromHsva } from '../core/color';
import type { BerryPickrColor, BerryPickrFormat } from '../types';
import type { InputController } from './controllers/input';
import type { SliderController } from './controllers/slider';
import type { SwatchesController } from './controllers/swatches';
import type { BerryPickrDomRefs } from './dom';

const DEFAULT_HSVA: [number, number, number, number] = [0, 100, 100, 1];

interface SyncColorUiOptions {
  dom: BerryPickrDomRefs;
  sliders: {
    palette: SliderController;
    hue: SliderController;
    alpha: SliderController;
  };
  inputController: InputController;
  swatchesController: SwatchesController;
  current: BerryPickrColor | null;
  saved: BerryPickrColor | null;
  format: BerryPickrFormat;
  precision: number;
}

/**
 * Synchronizes all color-driven UI surfaces from controller state.
 *
 * @param options Current color snapshot and component references.
 */
export const syncColorUi = ({
  dom,
  sliders,
  inputController,
  swatchesController,
  current,
  saved,
  format,
  precision
}: SyncColorUiOptions): void => {
  const currentValue = current?.to('rgba', precision) ?? 'transparent';
  const savedValue = saved?.to('rgba', precision) ?? 'transparent';

  dom.preview.current.style.setProperty('--bp-color', currentValue);
  dom.preview.saved.style.setProperty('--bp-color', savedValue);
  dom.trigger.style.setProperty('--bp-color', currentValue);

  const hsva = current?.toHSVA() ?? DEFAULT_HSVA;
  const hueColor = colorFromHsva([hsva[0], 100, 100, 1]).to('rgba', precision);
  dom.palette.track.style.background = `
      linear-gradient(to top, rgba(0, 0, 0, ${hsva[3]}), rgba(0, 0, 0, 0)),
      linear-gradient(to right, rgba(255, 255, 255, ${hsva[3]}), ${hueColor})
    `;

  const alphaStart = colorFromHsva([hsva[0], hsva[1], hsva[2], 0]).to('rgba', precision);
  const alphaEnd = colorFromHsva([hsva[0], hsva[1], hsva[2], 1]).to('rgba', precision);
  dom.alpha.track.style.background = `linear-gradient(to right, ${alphaStart}, ${alphaEnd})`;

  sliders.palette.set(hsva[1] / 100, 1 - hsva[2] / 100);
  sliders.hue.set(hsva[0] / 360);
  sliders.alpha.set(hsva[3]);

  inputController.setValue(current ? current.to(format, precision) : '');
  swatchesController.setActive(current);
};

interface SyncFormatUiOptions {
  dom: BerryPickrDomRefs;
  format: BerryPickrFormat;
}

/**
 * Marks the active output format button in the format strip.
 *
 * @param options DOM references and currently selected format.
 */
export const syncFormatUi = ({ dom, format }: SyncFormatUiOptions): void => {
  for (const [nextFormat, button] of dom.formats.entries()) {
    button.classList.toggle('is-active', nextFormat === format);
  }
};

interface SyncDisabledUiOptions {
  dom: BerryPickrDomRefs;
  disabled: boolean;
}

/**
 * Toggles disabled visuals and behavior state on the root UI container.
 *
 * @param options DOM references and disabled state.
 */
export const syncDisabledUi = ({ dom, disabled }: SyncDisabledUiOptions): void => {
  dom.app.classList.toggle('is-disabled', disabled);
};
