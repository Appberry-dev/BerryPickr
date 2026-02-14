/**
 * Runtime controls for popover positioning listeners.
 */
export interface PositioningController {
  reposition(): void;
  destroy(): void;
}

interface PositioningOptions {
  trigger: HTMLElement;
  app: HTMLElement;
  ownerWindow: Window;
  autoReposition: boolean;
  closeOnScroll: boolean;
  onScrollClose: () => void;
  isOpen: () => boolean;
}

/**
 * Creates viewport-aware positioning behavior for popover mode.
 *
 * @param options Trigger/app elements and placement behavior options.
 * @returns Positioning controller with `reposition` and `destroy` methods.
 */
export const createPositioningController = ({
  trigger,
  app,
  ownerWindow,
  autoReposition,
  closeOnScroll,
  onScrollClose,
  isOpen
}: PositioningOptions): PositioningController => {
  const reposition = (): void => {
    const triggerRect = trigger.getBoundingClientRect();
    const appRect = app.getBoundingClientRect();

    const margin = 10;
    let top = triggerRect.bottom + margin;
    let left = triggerRect.left;

    if (left + appRect.width > ownerWindow.innerWidth - margin) {
      left = ownerWindow.innerWidth - appRect.width - margin;
    }

    if (top + appRect.height > ownerWindow.innerHeight - margin) {
      top = triggerRect.top - appRect.height - margin;
    }

    app.style.left = `${Math.max(margin, left)}px`;
    app.style.top = `${Math.max(margin, top)}px`;
  };

  const handleWindow = (): void => {
    if (!isOpen()) {
      return;
    }

    if (closeOnScroll) {
      onScrollClose();
      return;
    }

    if (autoReposition) {
      reposition();
    }
  };

  if (autoReposition || closeOnScroll) {
    ownerWindow.addEventListener('scroll', handleWindow, true);
    ownerWindow.addEventListener('resize', handleWindow);
  }

  return {
    reposition,
    destroy(): void {
      if (autoReposition || closeOnScroll) {
        ownerWindow.removeEventListener('scroll', handleWindow, true);
        ownerWindow.removeEventListener('resize', handleWindow);
      }
    }
  };
};
