import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createBerryPickrController } from '../controller';
import { mountBerryPickrUI } from '../mountBerryPickrUI';
import type {
  BerryPickrChangeEvent,
  BerryPickrController,
  BerryPickrControllerOptions,
  BerryPickrStateSnapshot,
  BerryPickrUIOptions,
  BerryPickrUIMount
} from '../types';

/**
 * React hook options for creating and synchronizing a controller.
 */
export interface UseBerryPickrControllerOptions {
  controllerOptions?: BerryPickrControllerOptions;
  value?: string | null;
  onChange?: (event: BerryPickrChangeEvent, state: BerryPickrStateSnapshot) => void;
  destroyOnUnmount?: boolean;
}

/**
 * Return payload for `useBerryPickrController`.
 */
export interface UseBerryPickrControllerResult {
  controller: BerryPickrController;
  state: BerryPickrStateSnapshot;
}

/**
 * React hook options for mounting/unmounting the BerryPickr UI.
 */
export interface UseMountedBerryPickrUIOptions {
  uiOptions?: Omit<BerryPickrUIOptions, 'target'>;
  removeOnUnmount?: boolean;
}

const getServerSnapshot = (): BerryPickrStateSnapshot => {
  return {
    instanceId: 'server',
    value: null,
    savedValue: null,
    format: 'hex',
    formats: ['hex'],
    open: false,
    disabled: false,
    swatches: [],
    history: {
      limit: 1,
      length: 0,
      index: 0,
      canUndo: false,
      canRedo: false
    },
    context: 'default',
    contexts: {
      default: null,
      hover: null,
      active: null,
      focus: null,
      disabled: null
    },
    presets: {
      recent: []
    },
    recent: [],
    precision: 2,
    lockAlpha: false
  };
};

/**
 * Creates a stable controller instance and subscribes React state to it.
 *
 * @param options Hook options for controller lifecycle and state sync.
 * @returns Current controller reference and latest snapshot.
 */
export const useBerryPickrController = ({
  controllerOptions,
  value,
  onChange,
  destroyOnUnmount = true
}: UseBerryPickrControllerOptions = {}): UseBerryPickrControllerResult => {
  const controllerRef = useRef<BerryPickrController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = createBerryPickrController(controllerOptions);
  }

  const controller = controllerRef.current;

  useEffect(() => {
    if (!controllerOptions) {
      return;
    }

    controller.updateOptions(controllerOptions);

    if ('value' in controllerOptions) {
      controller.setValue(controllerOptions.value ?? null, {
        source: 'options'
      });
    }
  }, [controller, controllerOptions]);

  useEffect(() => {
    if (value === undefined) {
      return;
    }

    controller.setValue(value, {
      source: 'options'
    });
  }, [controller, value]);

  useEffect(() => {
    if (!onChange) {
      return;
    }

    return controller.on('change', (event) => {
      onChange(event, controller.getState());
    });
  }, [controller, onChange]);

  useEffect(() => {
    if (!destroyOnUnmount) {
      return;
    }

    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [controller, destroyOnUnmount]);

  const state = useSyncExternalStore(
    (listener) => controller.subscribe(() => listener()),
    () => controller.getState(),
    getServerSnapshot
  );

  return {
    controller,
    state
  };
};

/**
 * Mounts BerryPickr UI to a target element reference and keeps options in sync.
 *
 * @param controller Existing controller instance.
 * @param targetRef React ref that resolves to the mount target.
 * @param options Mount behavior and UI options.
 * @returns Mutable ref for the active mount handle.
 */
export const useMountedBerryPickrUI = (
  controller: BerryPickrController,
  targetRef: { current: HTMLElement | null },
  options: UseMountedBerryPickrUIOptions = {}
): { current: BerryPickrUIMount | null } => {
  const mountRef = useRef<BerryPickrUIMount | null>(null);
  const removeOnUnmountRef = useRef(options.removeOnUnmount ?? true);

  useEffect(() => {
    removeOnUnmountRef.current = options.removeOnUnmount ?? true;
  }, [options.removeOnUnmount]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const target = targetRef.current;
    if (!target) {
      return;
    }

    const mount = mountBerryPickrUI(controller, {
      ...(options.uiOptions ?? {}),
      target
    });

    mountRef.current = mount;

    return () => {
      mount.destroy({
        remove: removeOnUnmountRef.current
      });

      if (mountRef.current === mount) {
        mountRef.current = null;
      }
    };
  }, [controller, targetRef]);

  useEffect(() => {
    mountRef.current?.update(options.uiOptions ?? {});
  }, [options.uiOptions]);

  return mountRef;
};
