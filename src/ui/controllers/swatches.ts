import type { BerryPickrColor } from '../../types';

/**
 * Public API for rendering and selecting swatch buttons.
 */
export interface SwatchesController {
  render(swatches: BerryPickrColor[]): void;
  setActive(color: BerryPickrColor | null): void;
  destroy(): void;
}

interface SwatchesOptions {
  ownerDocument: Document;
  container: HTMLElement;
  label: string;
  onSelect: (index: number) => void;
}

/**
 * Creates a swatch list controller for rendering and selecting preset colors.
 *
 * @param options DOM references and selection callback.
 * @returns Swatch controller for render/highlight/teardown operations.
 */
export const createSwatchesController = ({ ownerDocument, container, label, onSelect }: SwatchesOptions): SwatchesController => {
  let buttons: HTMLButtonElement[] = [];

  const clear = (): void => {
    for (const button of buttons) {
      button.remove();
    }
    buttons = [];
  };

  const clickHandlers = new Map<HTMLButtonElement, (event: Event) => void>();

  return {
    render(swatches): void {
      for (const [button, handler] of clickHandlers) {
        button.removeEventListener('click', handler);
      }
      clickHandlers.clear();
      clear();

      swatches.forEach((color, index) => {
        const button = ownerDocument.createElement('button');
        button.type = 'button';
        button.className = 'bp-swatch';
        button.style.setProperty('--bp-swatch-color', color.to('rgba'));
        button.dataset.hexa = color.to('hexa');
        button.setAttribute('aria-label', `${label} ${index + 1}`);

        const handler = (): void => onSelect(index);
        button.addEventListener('click', handler);
        clickHandlers.set(button, handler);

        buttons.push(button);
        container.appendChild(button);
      });
    },
    setActive(color): void {
      const match = color?.to('hexa');

      buttons.forEach((button) => {
        button.classList.toggle('is-active', Boolean(match && button.dataset.hexa === match));
      });
    },
    destroy(): void {
      for (const [button, handler] of clickHandlers) {
        button.removeEventListener('click', handler);
      }
      clickHandlers.clear();
      clear();
    }
  };
};
