const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

/**
 * Axis mode for slider interaction.
 */
export type SliderAxis = '2d' | 'x' | 'y';

/**
 * Public API for slider synchronization and teardown.
 */
export interface SliderController {
  set(x: number, y?: number): void;
  destroy(): void;
}

interface SliderOptions {
  axis: SliderAxis;
  track: HTMLElement;
  knob: HTMLElement;
  onChange: (x: number, y: number) => void;
  onEnd: () => void;
}

/**
 * Creates a pointer/keyboard slider controller for palette, hue, or alpha tracks.
 *
 * @param options Slider axis, DOM nodes, and interaction callbacks.
 * @returns Controller with `set` and `destroy` methods.
 */
export const createSliderController = ({ axis, track, knob, onChange, onEnd }: SliderOptions): SliderController => {
  let dragging = false;
  let current = { x: 0, y: 0 };

  const syncAria = (): void => {
    if (track.getAttribute('role') !== 'slider') {
      return;
    }

    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');

    const value = axis === 'y' ? current.y * 100 : current.x * 100;
    track.setAttribute('aria-valuenow', (Math.round(value * 100) / 100).toString());
    track.setAttribute('aria-orientation', axis === 'y' ? 'vertical' : 'horizontal');
  };

  const render = (): void => {
    if (axis === 'x') {
      knob.style.left = `${current.x * 100}%`;
      knob.style.top = '50%';
      syncAria();
      return;
    }

    if (axis === 'y') {
      knob.style.left = '50%';
      knob.style.top = `${current.y * 100}%`;
      syncAria();
      return;
    }

    knob.style.left = `${current.x * 100}%`;
    knob.style.top = `${current.y * 100}%`;
    syncAria();
  };

  const moveFromPointer = (event: PointerEvent): void => {
    const rect = track.getBoundingClientRect();
    const x = clamp01((event.clientX - rect.left) / rect.width);
    const y = clamp01((event.clientY - rect.top) / rect.height);

    current = {
      x: axis === 'y' ? 0.5 : x,
      y: axis === 'x' ? 0.5 : y
    };

    render();
    onChange(current.x, current.y);
  };

  const onPointerDown = (event: PointerEvent): void => {
    dragging = true;
    track.setPointerCapture(event.pointerId);
    moveFromPointer(event);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!dragging) {
      return;
    }
    moveFromPointer(event);
  };

  const onPointerUp = (): void => {
    if (!dragging) {
      return;
    }

    dragging = false;
    onEnd();
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    const step = event.shiftKey ? 0.05 : 0.01;

    if (axis === 'x') {
      if (event.key === 'ArrowLeft') {
        current.x = clamp01(current.x - step);
      } else if (event.key === 'ArrowRight') {
        current.x = clamp01(current.x + step);
      } else {
        return;
      }
    } else if (axis === 'y') {
      if (event.key === 'ArrowUp') {
        current.y = clamp01(current.y - step);
      } else if (event.key === 'ArrowDown') {
        current.y = clamp01(current.y + step);
      } else {
        return;
      }
    } else {
      if (event.key === 'ArrowLeft') {
        current.x = clamp01(current.x - step);
      } else if (event.key === 'ArrowRight') {
        current.x = clamp01(current.x + step);
      } else if (event.key === 'ArrowUp') {
        current.y = clamp01(current.y - step);
      } else if (event.key === 'ArrowDown') {
        current.y = clamp01(current.y + step);
      } else {
        return;
      }
    }

    render();
    onChange(current.x, current.y);
    onEnd();
    event.preventDefault();
  };

  track.addEventListener('pointerdown', onPointerDown);
  track.addEventListener('pointermove', onPointerMove);
  track.addEventListener('pointerup', onPointerUp);
  track.addEventListener('pointercancel', onPointerUp);
  track.addEventListener('keydown', onKeyDown);

  render();

  return {
    set(x: number, y = 0.5): void {
      current.x = clamp01(x);
      current.y = clamp01(y);
      render();
    },
    destroy(): void {
      track.removeEventListener('pointerdown', onPointerDown);
      track.removeEventListener('pointermove', onPointerMove);
      track.removeEventListener('pointerup', onPointerUp);
      track.removeEventListener('pointercancel', onPointerUp);
      track.removeEventListener('keydown', onKeyDown);
    }
  };
};
