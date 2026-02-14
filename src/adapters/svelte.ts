import { readable, type Readable } from 'svelte/store';
import { createBerryPickrController } from '../controller';
import { mountBerryPickrUI } from '../mountBerryPickrUI';
import type {
  BerryPickrController,
  BerryPickrControllerOptions,
  BerryPickrStateSnapshot,
  BerryPickrUIOptions,
  BerryPickrUIMount
} from '../types';

/**
 * Shape of the Svelte store helper returned by `createSvelteBerryPickrStore`.
 */
export interface SvelteBerryPickrStore {
  controller: BerryPickrController;
  state: Readable<BerryPickrStateSnapshot>;
  destroy(): void;
}

/**
 * Parameters accepted by the Svelte `berryPickr` action.
 */
export interface SvelteBerryPickrActionParams {
  controller: BerryPickrController;
  uiOptions?: Omit<BerryPickrUIOptions, 'target'>;
  removeOnDestroy?: boolean;
}

/**
 * Creates a controller and exposes its state as a Svelte readable store.
 *
 * @param options Optional controller options.
 * @returns Store helper containing controller, state store, and destroy hook.
 */
export const createSvelteBerryPickrStore = (options?: BerryPickrControllerOptions): SvelteBerryPickrStore => {
  const controller = createBerryPickrController(options);

  const state = readable(controller.getState(), (set) => {
    return controller.subscribe((next) => {
      set(next);
    });
  });

  return {
    controller,
    state,
    destroy(): void {
      controller.destroy();
    }
  };
};

/**
 * Svelte action that mounts BerryPickr UI on a DOM node.
 *
 * @param node Host node used as the mount target.
 * @param params Controller and mount options.
 * @returns Standard Svelte action lifecycle handlers.
 */
export const berryPickr = (node: HTMLElement, params: SvelteBerryPickrActionParams) => {
  let current = params;
  let mount: BerryPickrUIMount = mountBerryPickrUI(current.controller, {
    ...(current.uiOptions ?? {}),
    target: node
  });

  return {
    update(next: SvelteBerryPickrActionParams): void {
      const changedController = next.controller !== current.controller;
      current = next;

      if (!changedController) {
        mount.update(next.uiOptions ?? {});
        return;
      }

      mount.destroy({
        remove: next.removeOnDestroy ?? true
      });

      mount = mountBerryPickrUI(next.controller, {
        ...(next.uiOptions ?? {}),
        target: node
      });
    },
    destroy(): void {
      mount.destroy({
        remove: current.removeOnDestroy ?? true
      });
    }
  };
};
