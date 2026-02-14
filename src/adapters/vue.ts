import { onBeforeUnmount, shallowRef, toValue, watch, type MaybeRefOrGetter, type ShallowRef } from 'vue';
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
 * Return payload for `useVueBerryPickrController`.
 */
export interface UseVueBerryPickrControllerResult {
  controller: ShallowRef<BerryPickrController>;
  state: ShallowRef<BerryPickrStateSnapshot>;
}

/**
 * Options for mounting BerryPickr UI in Vue.
 */
export interface VueBerryPickrMountOptions {
  uiOptions?: Omit<BerryPickrUIOptions, 'target'>;
  removeOnUnmount?: boolean;
}

const resolveTarget = (value: MaybeRefOrGetter<HTMLElement | null | undefined>): HTMLElement | null => {
  return toValue(value) ?? null;
};

/**
 * Creates a BerryPickr controller and a reactive state snapshot in Vue.
 *
 * @param options Optional controller options or ref/getter.
 * @returns Shallow refs for controller instance and latest state.
 */
export const useVueBerryPickrController = (
  options?: MaybeRefOrGetter<BerryPickrControllerOptions>
): UseVueBerryPickrControllerResult => {
  const initial = options ? toValue(options) : undefined;
  const controller = shallowRef(createBerryPickrController(initial));
  const state = shallowRef(controller.value.getState());

  const unsubscribe = controller.value.subscribe((next) => {
    state.value = next;
  });

  if (options) {
    watch(
      () => toValue(options),
      (next) => {
        controller.value.updateOptions(next);
        if ('value' in next) {
          controller.value.setValue(next.value ?? null, {
            source: 'options'
          });
        }
        state.value = controller.value.getState();
      },
      {
        deep: true
      }
    );
  }

  onBeforeUnmount(() => {
    unsubscribe();
    controller.value.destroy();
  });

  return {
    controller,
    state
  };
};

/**
 * Mounts BerryPickr UI in Vue and updates it as refs change.
 *
 * @param controller Controller instance or ref/getter.
 * @param target Mount target element or ref/getter.
 * @param options Optional UI options or ref/getter.
 * @returns Shallow ref holding the active mount handle.
 */
export const useMountedVueBerryPickrUI = (
  controller: MaybeRefOrGetter<BerryPickrController>,
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options?: MaybeRefOrGetter<VueBerryPickrMountOptions>
): ShallowRef<BerryPickrUIMount | null> => {
  const mounted = shallowRef<BerryPickrUIMount | null>(null);
  let removeOnUnmount = true;

  const stop = watch(
    [() => toValue(controller), () => resolveTarget(target)],
    ([nextController, nextTarget], _previous, onCleanup) => {
      if (!nextTarget) {
        return;
      }

      const nextOptions = toValue(options);
      removeOnUnmount = nextOptions?.removeOnUnmount ?? true;
      const mount = mountBerryPickrUI(nextController, {
        ...(nextOptions?.uiOptions ?? {}),
        target: nextTarget
      });

      mounted.value = mount;

      onCleanup(() => {
        mount.destroy({
          remove: removeOnUnmount
        });

        if (mounted.value === mount) {
          mounted.value = null;
        }
      });
    },
    {
      immediate: true,
      flush: 'post'
    }
  );

  const stopOptions = watch(
    () => toValue(options),
    (nextOptions) => {
      removeOnUnmount = nextOptions?.removeOnUnmount ?? true;
      mounted.value?.update(nextOptions?.uiOptions ?? {});
    },
    {
      deep: true
    }
  );

  onBeforeUnmount(() => {
    stop();
    stopOptions();
  });

  return mounted;
};
