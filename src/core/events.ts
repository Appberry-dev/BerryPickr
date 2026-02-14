/**
 * Minimal typed event emitter used by controller and UI internals.
 */
export class TypedEventEmitter<Events extends object> {
  private listeners = new Map<keyof Events, Set<(payload: Events[keyof Events]) => void>>();

  on<K extends keyof Events>(event: K, callback: (payload: Events[K]) => void): () => void {
    const bucket = this.listeners.get(event) ?? new Set();
    bucket.add(callback as (payload: Events[keyof Events]) => void);
    this.listeners.set(event, bucket);

    return () => {
      bucket.delete(callback as (payload: Events[keyof Events]) => void);
    };
  }

  off<K extends keyof Events>(event: K, callback: (payload: Events[K]) => void): void {
    const bucket = this.listeners.get(event);
    if (!bucket) {
      return;
    }

    bucket.delete(callback as (payload: Events[keyof Events]) => void);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const bucket = this.listeners.get(event);
    if (!bucket) {
      return;
    }

    for (const listener of bucket) {
      listener(payload as Events[keyof Events]);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
