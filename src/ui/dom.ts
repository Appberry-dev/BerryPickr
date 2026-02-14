import type { BerryPickrComponents, BerryPickrFormat, BerryPickrI18n, BerryPickrMode } from '../types';

/**
 * Structured references to all DOM elements used by the UI runtime.
 */
export interface BerryPickrDomRefs {
  root: HTMLElement;
  app: HTMLElement;
  trigger: HTMLElement;
  preview: {
    current: HTMLElement;
    saved: HTMLElement;
    container: HTMLElement;
  };
  palette: {
    track: HTMLElement;
    knob: HTMLElement;
  };
  hue: {
    track: HTMLElement;
    knob: HTMLElement;
  };
  alpha: {
    track: HTMLElement;
    knob: HTMLElement;
  };
  swatches: HTMLElement;
  input: HTMLInputElement;
  formatStrip: HTMLElement;
  formats: Map<BerryPickrFormat, HTMLButtonElement>;
  saveButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
  clearButton: HTMLButtonElement;
}

interface DomOptions {
  target: HTMLElement;
  container: HTMLElement;
  ownerDocument: Document;
  mode: BerryPickrMode;
  showAlways: boolean;
  disabled: boolean;
  formats: BerryPickrFormat[];
  components: BerryPickrComponents;
  i18n: BerryPickrI18n;
}

const create = <T extends HTMLElement>(ownerDocument: Document, tag: string, className: string): T => {
  const node = ownerDocument.createElement(tag) as T;
  node.className = className;
  return node;
};

const createSlider = (
  ownerDocument: Document,
  className: string,
  ariaLabel: string
): { track: HTMLElement; knob: HTMLElement } => {
  const track = create<HTMLElement>(ownerDocument, 'div', `bp-slider ${className}`);
  track.setAttribute('role', 'slider');
  track.tabIndex = 0;
  track.setAttribute('aria-label', ariaLabel);

  const knob = create<HTMLElement>(ownerDocument, 'div', 'bp-slider-knob');
  track.appendChild(knob);
  return { track, knob };
};

/**
 * Builds and mounts BerryPickr DOM structure for the current configuration.
 *
 * @param options Resolved UI options and rendering flags.
 * @returns Structured references to all interactive DOM nodes.
 */
export const createDom = (options: DomOptions): BerryPickrDomRefs => {
  const { ownerDocument } = options;
  options.target.classList.add('bp-anchor');
  options.target.setAttribute('aria-label', options.i18n.toggle);

  const app = create<HTMLElement>(ownerDocument, 'section', 'bp-app');
  app.setAttribute('role', 'dialog');
  app.setAttribute('aria-label', options.i18n.dialog);

  const selection = create<HTMLElement>(ownerDocument, 'div', 'bp-selection');

  const previewContainer = create<HTMLElement>(ownerDocument, 'div', 'bp-preview');
  const previewSaved = create<HTMLButtonElement>(ownerDocument, 'button', 'bp-preview-chip bp-preview-saved');
  previewSaved.type = 'button';
  previewSaved.setAttribute('aria-label', options.i18n.cancel);
  const previewCurrent = create<HTMLElement>(ownerDocument, 'div', 'bp-preview-chip bp-preview-current');
  previewContainer.append(previewSaved, previewCurrent);

  const palette = createSlider(ownerDocument, 'bp-palette', options.i18n.palette);
  const hue = createSlider(ownerDocument, 'bp-hue', options.i18n.hue);
  const alpha = createSlider(ownerDocument, 'bp-alpha', options.i18n.alpha);

  selection.append(previewContainer, palette.track, hue.track, alpha.track);

  const swatches = create<HTMLElement>(ownerDocument, 'div', 'bp-swatches');
  swatches.setAttribute('aria-label', options.i18n.swatch);

  const controls = create<HTMLElement>(ownerDocument, 'div', 'bp-controls');
  const input = create<HTMLInputElement>(ownerDocument, 'input', 'bp-input');
  input.type = 'text';
  input.spellcheck = false;
  input.setAttribute('aria-label', options.i18n.input);

  const formatStrip = create<HTMLElement>(ownerDocument, 'div', 'bp-formats');
  const formatButtons = new Map<BerryPickrFormat, HTMLButtonElement>();

  for (const format of options.formats) {
    const button = create<HTMLButtonElement>(ownerDocument, 'button', 'bp-format');
    button.type = 'button';
    button.dataset.format = format;
    button.textContent = format.toUpperCase();
    formatButtons.set(format, button);
    formatStrip.appendChild(button);
  }

  const actions = create<HTMLElement>(ownerDocument, 'div', 'bp-actions');
  const saveButton = create<HTMLButtonElement>(ownerDocument, 'button', 'bp-btn bp-save');
  saveButton.type = 'button';
  saveButton.textContent = options.i18n.save;
  const cancelButton = create<HTMLButtonElement>(ownerDocument, 'button', 'bp-btn bp-cancel');
  cancelButton.type = 'button';
  cancelButton.textContent = options.i18n.cancel;
  const clearButton = create<HTMLButtonElement>(ownerDocument, 'button', 'bp-btn bp-clear');
  clearButton.type = 'button';
  clearButton.textContent = options.i18n.clear;

  actions.append(saveButton, cancelButton, clearButton);
  controls.append(input, formatStrip, actions);

  app.append(selection, swatches, controls);

  if (options.mode === 'inline') {
    options.target.insertAdjacentElement('afterend', app);
    app.classList.add('is-inline');
  } else {
    options.container.appendChild(app);
  }

  if (options.showAlways || options.mode === 'inline') {
    app.classList.add('is-open');
  }

  if (!options.components.preview) {
    previewContainer.hidden = true;
  }
  if (!options.components.palette) {
    palette.track.hidden = true;
  }
  if (!options.components.hue) {
    hue.track.hidden = true;
  }
  if (!options.components.alpha) {
    alpha.track.hidden = true;
  }
  if (!options.components.input) {
    input.hidden = true;
  }
  if (!options.components.save) {
    saveButton.hidden = true;
  }
  if (!options.components.cancel) {
    cancelButton.hidden = true;
  }
  if (!options.components.clear) {
    clearButton.hidden = true;
  }

  if (options.disabled) {
    app.classList.add('is-disabled');
  }

  return {
    root: app,
    app,
    trigger: options.target,
    preview: {
      current: previewCurrent,
      saved: previewSaved,
      container: previewContainer
    },
    palette,
    hue,
    alpha,
    swatches,
    input,
    formatStrip,
    formats: formatButtons,
    saveButton,
    cancelButton,
    clearButton
  };
};
