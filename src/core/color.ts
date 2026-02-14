import type { BerryPickrColor, BerryPickrFormat } from '../types';

type HSVA = [number, number, number, number];
type RGBA = [number, number, number, number];
type HSLA = [number, number, number, number];
type CMYK = [number, number, number, number];

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const normalizeHue = (value: number): number => {
  const hue = value % 360;
  return hue < 0 ? hue + 360 : hue;
};

const round = (value: number, precision: number): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const formatNumber = (value: number, precision: number): string => round(value, precision).toString();

/**
 * Converts HSVA channels to RGBA channels.
 *
 * @param hsva Hue/saturation/value/alpha tuple.
 * @returns RGBA tuple in `[0-255, 0-255, 0-255, 0-1]`.
 */
export const hsvaToRgba = ([h, s, v, a]: HSVA): RGBA => {
  const hue = normalizeHue(h) / 60;
  const sat = clamp(s, 0, 100) / 100;
  const val = clamp(v, 0, 100) / 100;
  const i = Math.floor(hue);
  const f = hue - i;
  const p = val * (1 - sat);
  const q = val * (1 - sat * f);
  const t = val * (1 - sat * (1 - f));

  const mod = i % 6;
  const r = [val, q, p, p, t, val][mod] ?? val;
  const g = [t, val, val, q, p, p][mod] ?? val;
  const b = [p, p, t, val, val, q][mod] ?? val;

  return [r * 255, g * 255, b * 255, clamp(a, 0, 1)];
};

/**
 * Converts RGBA channels to HSVA channels.
 *
 * @param rgba Red/green/blue/alpha tuple.
 * @returns HSVA tuple in `[0-360, 0-100, 0-100, 0-1]`.
 */
export const rgbaToHsva = (rgba: RGBA): HSVA => {
  const [red, green, blue, alpha] = rgba;
  const r = clamp(red, 0, 255) / 255;
  const g = clamp(green, 0, 255) / 255;
  const b = clamp(blue, 0, 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
  }

  return [
    normalizeHue(hue * 60),
    max === 0 ? 0 : (delta / max) * 100,
    max * 100,
    clamp(alpha, 0, 1)
  ];
};

/**
 * Converts HSVA channels to HSLA channels.
 *
 * @param hsva Hue/saturation/value/alpha tuple.
 * @returns HSLA tuple in `[0-360, 0-100, 0-100, 0-1]`.
 */
export const hsvaToHsla = ([h, s, v, a]: HSVA): HSLA => {
  const sat = clamp(s, 0, 100) / 100;
  const val = clamp(v, 0, 100) / 100;
  const lightness = val * (1 - sat / 2);
  let nextS = 0;

  if (lightness !== 0 && lightness !== 1) {
    nextS = (val - lightness) / Math.min(lightness, 1 - lightness);
  }

  return [normalizeHue(h), nextS * 100, lightness * 100, clamp(a, 0, 1)];
};

/**
 * Converts HSLA channels to HSVA channels.
 *
 * @param hsla Hue/saturation/lightness/alpha tuple.
 * @returns HSVA tuple in `[0-360, 0-100, 0-100, 0-1]`.
 */
export const hslaToHsva = (hsla: HSLA): HSVA => {
  const [h, s, l, a] = hsla;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const value = light + sat * Math.min(light, 1 - light);
  const newS = value === 0 ? 0 : 2 * (1 - light / value);

  return [normalizeHue(h), newS * 100, value * 100, clamp(a, 0, 1)];
};

/**
 * Converts HSVA channels to CMYK channels.
 *
 * @param hsva Hue/saturation/value/alpha tuple.
 * @returns CMYK tuple in percentages.
 */
export const hsvaToCmyk = (hsva: HSVA): CMYK => {
  const [r, g, b] = hsvaToRgba(hsva);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);

  if (k >= 1) {
    return [0, 0, 0, 100];
  }

  const c = ((1 - rn - k) / (1 - k)) * 100;
  const m = ((1 - gn - k) / (1 - k)) * 100;
  const y = ((1 - bn - k) / (1 - k)) * 100;

  return [c, m, y, k * 100];
};

/**
 * Converts CMYK channels to HSVA channels.
 *
 * @param cmyk Cyan/magenta/yellow/key tuple in percentages.
 * @returns HSVA tuple in `[0-360, 0-100, 0-100, 0-1]`.
 */
export const cmykToHsva = (cmyk: CMYK): HSVA => {
  const [c, m, y, k] = cmyk;
  const cn = clamp(c, 0, 100) / 100;
  const mn = clamp(m, 0, 100) / 100;
  const yn = clamp(y, 0, 100) / 100;
  const kn = clamp(k, 0, 100) / 100;

  const r = 255 * (1 - cn) * (1 - kn);
  const g = 255 * (1 - mn) * (1 - kn);
  const b = 255 * (1 - yn) * (1 - kn);

  return rgbaToHsva([r, g, b, 1]);
};

const rgbaToHex = (rgba: RGBA, withAlpha: boolean): string => {
  const [r, g, b, a] = rgba;
  const channels = [r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0'));
  if (withAlpha) {
    channels.push(Math.round(clamp(a, 0, 1) * 255).toString(16).padStart(2, '0'));
  }
  return `#${channels.join('').toUpperCase()}`;
};

const HEX_PATTERN = /^[0-9a-f]+$/i;
const NUMBER_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;
const NUMBER_WITH_UNIT_PATTERN = /^([+-]?(?:\d+\.?\d*|\.\d+))(deg|grad|rad|turn)?$/i;

const parseNumericToken = (token: string): number | null => {
  const normalized = token.trim();
  if (!NUMBER_PATTERN.test(normalized)) {
    return null;
  }

  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
};

const parsePercentToken = (token: string): number | null => {
  if (!token.endsWith('%')) {
    return null;
  }

  const value = parseNumericToken(token.slice(0, -1));
  return value === null ? null : value;
};

const parseHueToken = (token: string): number | null => {
  const match = token.trim().match(NUMBER_WITH_UNIT_PATTERN);
  if (!match || match[1] === undefined) {
    return null;
  }

  const numeric = Number.parseFloat(match[1]);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  const unit = match[2]?.toLowerCase() ?? 'deg';
  switch (unit) {
    case 'deg':
      return numeric;
    case 'grad':
      return numeric * 0.9;
    case 'rad':
      return numeric * (180 / Math.PI);
    case 'turn':
      return numeric * 360;
    default:
      return null;
  }
};

const parseRgbChannelToken = (token: string): number | null => {
  const percent = parsePercentToken(token);
  if (percent !== null) {
    return clamp((percent / 100) * 255, 0, 255);
  }

  const value = parseNumericToken(token);
  if (value === null) {
    return null;
  }

  return clamp(value, 0, 255);
};

const parseAlphaToken = (token: string): number | null => {
  const percent = parsePercentToken(token);
  if (percent !== null) {
    return clamp(percent / 100, 0, 1);
  }

  const value = parseNumericToken(token);
  if (value === null) {
    return null;
  }

  return clamp(value, 0, 1);
};

const parsePercentLikeToken = (token: string): number | null => {
  const percent = parsePercentToken(token);
  if (percent !== null) {
    return clamp(percent, 0, 100);
  }

  const value = parseNumericToken(token);
  if (value === null) {
    return null;
  }

  return clamp(value, 0, 100);
};

interface FunctionalParts {
  channels: string[];
  alpha: string | null;
}

const parseFunctionalParts = (body: string, channelCount: number): FunctionalParts | null => {
  if (body.includes(',')) {
    if (body.includes('/')) {
      return null;
    }

    const parts = body.split(',').map((part) => part.trim());
    if (parts.some((part) => part.length === 0)) {
      return null;
    }

    if (parts.length !== channelCount && parts.length !== channelCount + 1) {
      return null;
    }

    const channels = parts.slice(0, channelCount);
    if (channels.length !== channelCount) {
      return null;
    }

    return {
      channels,
      alpha: parts[channelCount] ?? null
    };
  }

  const slashParts = body.split('/');
  if (slashParts.length > 2) {
    return null;
  }

  const channelSource = slashParts[0]?.trim();
  if (!channelSource) {
    return null;
  }

  const channels = channelSource.split(/\s+/).filter(Boolean);
  if (channels.length !== channelCount) {
    return null;
  }

  if (slashParts.length === 1) {
    return { channels, alpha: null };
  }

  const alphaSource = slashParts[1]?.trim();
  if (!alphaSource) {
    return null;
  }

  const alphaTokens = alphaSource.split(/\s+/).filter(Boolean);
  if (alphaTokens.length !== 1 || alphaTokens[0] === undefined) {
    return null;
  }

  return {
    channels,
    alpha: alphaTokens[0]
  };
};

const parseFunctionBody = (input: string, names: string[]): { name: string; body: string } | null => {
  const match = input.trim().match(/^([a-z]+)\((.*)\)$/i);
  if (!match || match[1] === undefined || match[2] === undefined) {
    return null;
  }

  const name = match[1].toLowerCase();
  if (!names.includes(name)) {
    return null;
  }

  return {
    name,
    body: match[2].trim()
  };
};

const parseHex = (input: string): HSVA | null => {
  const value = input.replace('#', '').trim();
  if (![3, 4, 6, 8].includes(value.length)) {
    return null;
  }

  if (!HEX_PATTERN.test(value)) {
    return null;
  }

  const normalized = value.length <= 4 ? value.split('').map((ch) => ch + ch).join('') : value;
  const hasAlpha = normalized.length === 8;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const a = hasAlpha ? Number.parseInt(normalized.slice(6, 8), 16) / 255 : 1;

  if ([r, g, b, a].some((part) => Number.isNaN(part))) {
    return null;
  }

  return rgbaToHsva([r, g, b, a]);
};

const parseRgb = (input: string): HSVA | null => {
  const parsed = parseFunctionBody(input, ['rgb', 'rgba']);
  if (!parsed) {
    return null;
  }

  const parts = parseFunctionalParts(parsed.body, 3);
  if (!parts) {
    return null;
  }

  if (parsed.name === 'rgb' && input.includes(',') && parts.alpha !== null) {
    return null;
  }

  if (parsed.name === 'rgba' && parts.alpha === null) {
    return null;
  }

  const [rToken, gToken, bToken] = parts.channels;
  if (!rToken || !gToken || !bToken) {
    return null;
  }

  const r = parseRgbChannelToken(rToken);
  const g = parseRgbChannelToken(gToken);
  const b = parseRgbChannelToken(bToken);
  if (r === null || g === null || b === null) {
    return null;
  }

  if (parts.alpha === null) {
    return rgbaToHsva([r, g, b, 1]);
  }

  const alpha = parseAlphaToken(parts.alpha);
  if (alpha === null) {
    return null;
  }

  return rgbaToHsva([r, g, b, alpha]);
};

const parseHsl = (input: string): HSVA | null => {
  const parsed = parseFunctionBody(input, ['hsl', 'hsla']);
  if (!parsed) {
    return null;
  }

  const parts = parseFunctionalParts(parsed.body, 3);
  if (!parts) {
    return null;
  }

  if (parsed.name === 'hsl' && input.includes(',') && parts.alpha !== null) {
    return null;
  }

  if (parsed.name === 'hsla' && parts.alpha === null) {
    return null;
  }

  const [hToken, sToken, lToken] = parts.channels;
  if (!hToken || !sToken || !lToken) {
    return null;
  }

  const h = parseHueToken(hToken);
  const s = parsePercentLikeToken(sToken);
  const l = parsePercentLikeToken(lToken);
  if (h === null || s === null || l === null) {
    return null;
  }

  if (parts.alpha === null) {
    return hslaToHsva([normalizeHue(h), s, l, 1]);
  }

  const alpha = parseAlphaToken(parts.alpha);
  if (alpha === null) {
    return null;
  }

  return hslaToHsva([normalizeHue(h), s, l, alpha]);
};

const parseHsv = (input: string): HSVA | null => {
  const parsed = parseFunctionBody(input, ['hsv', 'hsva']);
  if (!parsed) {
    return null;
  }

  const parts = parseFunctionalParts(parsed.body, 3);
  if (!parts) {
    return null;
  }

  if (parsed.name === 'hsv' && parts.alpha !== null && input.includes(',')) {
    return null;
  }

  if (parsed.name === 'hsva' && parts.alpha === null) {
    return null;
  }

  const [hToken, sToken, vToken] = parts.channels;
  if (!hToken || !sToken || !vToken) {
    return null;
  }

  const h = parseHueToken(hToken);
  const s = parsePercentLikeToken(sToken);
  const v = parsePercentLikeToken(vToken);
  if (h === null || s === null || v === null) {
    return null;
  }

  if (parts.alpha === null) {
    return [normalizeHue(h), s, v, 1];
  }

  const alpha = parseAlphaToken(parts.alpha);
  if (alpha === null) {
    return null;
  }

  return [normalizeHue(h), s, v, alpha];
};

const parseCmyk = (input: string): HSVA | null => {
  const parsed = parseFunctionBody(input, ['cmyk']);
  if (!parsed) {
    return null;
  }

  if (parsed.body.includes('/')) {
    return null;
  }

  const parts = parsed.body.includes(',')
    ? parsed.body.split(',').map((part) => part.trim())
    : parsed.body.split(/\s+/).filter(Boolean);

  if (parts.length !== 4 || parts.some((part) => part.length === 0)) {
    return null;
  }

  const channels = parts.map((part) => parsePercentLikeToken(part));
  const [c, m, y, k] = channels;
  if (
    c === null ||
    c === undefined ||
    m === null ||
    m === undefined ||
    y === null ||
    y === undefined ||
    k === null ||
    k === undefined
  ) {
    return null;
  }

  return cmykToHsva([c, m, y, k]);
};

let namedColorContext: CanvasRenderingContext2D | null | undefined;

const getNamedColorContext = (): CanvasRenderingContext2D | null => {
  if (namedColorContext !== undefined) {
    return namedColorContext;
  }

  if (typeof document === 'undefined') {
    namedColorContext = null;
    return namedColorContext;
  }

  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
    namedColorContext = null;
    return namedColorContext;
  }

  const canvas = document.createElement('canvas');
  try {
    namedColorContext = canvas.getContext('2d');
  } catch {
    namedColorContext = null;
  }

  return namedColorContext;
};

const parseNamedColor = (input: string): HSVA | null => {
  const context = getNamedColorContext();
  if (!context) {
    return null;
  }

  const sentinel = '#010203';
  context.fillStyle = sentinel;
  context.fillStyle = input;
  if (context.fillStyle === sentinel) {
    return null;
  }

  const normalized = context.fillStyle;
  if (normalized.startsWith('#')) {
    return parseHex(normalized);
  }

  if (normalized.startsWith('rgb')) {
    return parseRgb(normalized);
  }

  return null;
};

const parseToHsva = (input: string): HSVA | null => {
  const value = input.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith('#')) {
    return parseHex(value);
  }

  const lower = value.toLowerCase();
  if (lower.startsWith('rgb')) {
    return parseRgb(value);
  }

  if (lower.startsWith('hsl')) {
    return parseHsl(value);
  }

  if (lower.startsWith('hsv')) {
    return parseHsv(value);
  }

  if (lower.startsWith('cmyk')) {
    return parseCmyk(value);
  }

  if (/^[a-z]+$/i.test(value)) {
    return parseNamedColor(value);
  }

  return null;
};

/**
 * Concrete immutable color implementation used across BerryPickr runtime APIs.
 */
export class BerryPickrColorImpl implements BerryPickrColor {
  private readonly hsva: HSVA;

  constructor(hsva: HSVA) {
    this.hsva = [normalizeHue(hsva[0]), clamp(hsva[1], 0, 100), clamp(hsva[2], 0, 100), clamp(hsva[3], 0, 1)];
  }

  static fromHsva(hsva: HSVA): BerryPickrColorImpl {
    return new BerryPickrColorImpl(hsva);
  }

  clone(): BerryPickrColorImpl {
    return new BerryPickrColorImpl(this.toHSVA());
  }

  toRGBA(): RGBA {
    return hsvaToRgba(this.hsva);
  }

  toHSVA(): HSVA {
    return [...this.hsva] as HSVA;
  }

  toHSLA(): HSLA {
    return hsvaToHsla(this.hsva);
  }

  toCMYK(): CMYK {
    return hsvaToCmyk(this.hsva);
  }

  toHEXA(): string {
    return rgbaToHex(this.toRGBA(), true);
  }

  to(format: BerryPickrFormat, precision = 2): string {
    switch (format) {
      case 'hex':
        return rgbaToHex(this.toRGBA(), false);
      case 'hexa':
        return rgbaToHex(this.toRGBA(), true);
      case 'rgb': {
        const [r, g, b] = this.toRGBA();
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
      }
      case 'rgba': {
        const [r, g, b, a] = this.toRGBA();
        return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${formatNumber(a, precision)})`;
      }
      case 'hsl': {
        const [h, s, l] = this.toHSLA();
        return `hsl(${formatNumber(h, precision)}, ${formatNumber(s, precision)}%, ${formatNumber(l, precision)}%)`;
      }
      case 'hsla': {
        const [h, s, l, a] = this.toHSLA();
        return `hsla(${formatNumber(h, precision)}, ${formatNumber(s, precision)}%, ${formatNumber(l, precision)}%, ${formatNumber(a, precision)})`;
      }
      case 'hsv': {
        const [h, s, v] = this.toHSVA();
        return `hsv(${formatNumber(h, precision)}, ${formatNumber(s, precision)}%, ${formatNumber(v, precision)}%)`;
      }
      case 'hsva': {
        const [h, s, v, a] = this.toHSVA();
        return `hsva(${formatNumber(h, precision)}, ${formatNumber(s, precision)}%, ${formatNumber(v, precision)}%, ${formatNumber(a, precision)})`;
      }
      case 'cmyk': {
        const [c, m, y, k] = this.toCMYK();
        return `cmyk(${formatNumber(c, precision)}%, ${formatNumber(m, precision)}%, ${formatNumber(y, precision)}%, ${formatNumber(k, precision)}%)`;
      }
      default:
        return rgbaToHex(this.toRGBA(), true);
    }
  }
}

/**
 * Parses a color string into a BerryPickr color instance.
 *
 * @param input Color string in supported CSS/function formats.
 * @param options Optional parser flags.
 * @returns Parsed color, or `null` when input is invalid.
 */
export const parseColor = (
  input: string,
  options?: {
    lockAlpha?: boolean;
  }
): BerryPickrColorImpl | null => {
  const parsed = parseToHsva(input);
  if (!parsed) {
    return null;
  }

  if (options?.lockAlpha) {
    parsed[3] = 1;
  }

  return BerryPickrColorImpl.fromHsva(parsed);
};

/**
 * Creates a color instance from raw HSVA channels.
 *
 * @param hsva Hue/saturation/value/alpha tuple.
 * @returns Color instance wrapping the provided HSVA channels.
 */
export const colorFromHsva = (hsva: HSVA): BerryPickrColorImpl => BerryPickrColorImpl.fromHsva(hsva);
