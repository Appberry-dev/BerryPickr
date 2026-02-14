import { parseColor } from './core/color';
import type { BerryPickrContrastResult } from './types';

type RgbaTuple = [number, number, number, number];

const WHITE: RgbaTuple = [255, 255, 255, 1];

const toLinear = (channel: number): number => {
  const normalized = channel / 255;
  if (normalized <= 0.03928) {
    return normalized / 12.92;
  }

  return ((normalized + 0.055) / 1.055) ** 2.4;
};

const blend = (foreground: RgbaTuple, background: RgbaTuple): RgbaTuple => {
  const alpha = foreground[3] + background[3] * (1 - foreground[3]);
  if (alpha === 0) {
    return [0, 0, 0, 0];
  }

  const red = (foreground[0] * foreground[3] + background[0] * background[3] * (1 - foreground[3])) / alpha;
  const green = (foreground[1] * foreground[3] + background[1] * background[3] * (1 - foreground[3])) / alpha;
  const blue = (foreground[2] * foreground[3] + background[2] * background[3] * (1 - foreground[3])) / alpha;

  return [red, green, blue, alpha];
};

const luminance = (rgba: RgbaTuple): number => {
  const [r, g, b] = rgba;
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const round = (value: number, places = 2): number => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const toOpaqueRgba = (rgba: RgbaTuple): RgbaTuple => {
  if (rgba[3] >= 1) {
    return rgba;
  }

  return blend(rgba, WHITE);
};

/**
 * Computes WCAG contrast ratio between two colors.
 *
 * @param foreground Foreground color in any supported color format.
 * @param background Background color in any supported color format.
 * @returns Contrast ratio, or `null` when either color cannot be parsed.
 */
export const getContrastRatio = (foreground: string, background: string): number | null => {
  const fg = parseColor(foreground);
  const bg = parseColor(background);

  if (!fg || !bg) {
    return null;
  }

  const bgOpaque = toOpaqueRgba(bg.toRGBA());
  const fgOpaque = blend(fg.toRGBA(), bgOpaque);

  const light = Math.max(luminance(fgOpaque), luminance(bgOpaque));
  const dark = Math.min(luminance(fgOpaque), luminance(bgOpaque));

  return (light + 0.05) / (dark + 0.05);
};

/**
 * Returns contrast analysis flags against WCAG thresholds.
 *
 * @param foreground Foreground color in any supported color format.
 * @param background Background color in any supported color format.
 * @returns A contrast result object, or `null` when either color is invalid.
 */
export const analyzeContrast = (foreground: string, background: string): BerryPickrContrastResult | null => {
  const ratio = getContrastRatio(foreground, background);
  if (ratio === null) {
    return null;
  }

  const roundedRatio = round(ratio, 2);

  return {
    ratio: roundedRatio,
    wcagAA: roundedRatio >= 4.5,
    wcagAAA: roundedRatio >= 7,
    wcagAALarge: roundedRatio >= 3,
    wcagAAALarge: roundedRatio >= 4.5,
    foreground,
    background
  };
};
