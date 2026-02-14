import { createBerryPickrController } from './controller';
import type {
  BerryPickrController,
  BerryPickrControllerManager,
  BerryPickrControllerOptions
} from './types';

class BerryPickrControllerManagerImpl implements BerryPickrControllerManager {
  private readonly controllers = new Map<string, BerryPickrController>();

  create(options?: BerryPickrControllerOptions): BerryPickrController {
    const controller = createBerryPickrController(options);
    this.register(controller);

    controller.on('destroy', ({ instanceId }) => {
      this.unregister(instanceId);
    });

    return controller;
  }

  register(controller: BerryPickrController): void {
    this.controllers.set(controller.instanceId, controller);
  }

  unregister(instanceId: string): void {
    this.controllers.delete(instanceId);
  }

  get(instanceId: string): BerryPickrController | undefined {
    return this.controllers.get(instanceId);
  }

  list(): BerryPickrController[] {
    return Array.from(this.controllers.values());
  }

  destroy(): void {
    const current = Array.from(this.controllers.values());
    this.controllers.clear();

    for (const controller of current) {
      controller.destroy();
    }
  }
}

/**
 * Creates a registry for multiple BerryPickr controller instances.
 *
 * @returns A controller manager with create/register/list/get/destroy helpers.
 */
export const createBerryPickrControllerManager = (): BerryPickrControllerManager => {
  return new BerryPickrControllerManagerImpl();
};
