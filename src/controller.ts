import { colorFromHsva, parseColor } from './core/color';
import { TypedEventEmitter } from './core/events';
import type {
  ChangeSource,
  BerryPickrChangeEvent,
  BerryPickrColor,
  BerryPickrCommitEvent,
  BerryPickrCommitOptions,
  BerryPickrContext,
  BerryPickrController,
  BerryPickrControllerEvents,
  BerryPickrControllerOptions,
  BerryPickrEventMeta,
  BerryPickrFormat,
  BerryPickrHistoryChangeEvent,
  BerryPickrHistorySnapshot,
  BerryPickrOptionsChangeEvent,
  BerryPickrPlugin,
  BerryPickrPluginErrorEvent,
  BerryPickrPluginErrorPhase,
  BerryPickrPluginErrorPolicy,
  BerryPickrRecentColorStorage,
  BerryPickrSetValueOptions,
  BerryPickrStateSnapshot
} from './types';

const DEFAULT_FORMATS: BerryPickrFormat[] = ['hex', 'hexa', 'rgb', 'rgba', 'hsl', 'hsla', 'hsv', 'hsva', 'cmyk'];
const DEFAULT_LOCK_ALPHA_FORMATS: BerryPickrFormat[] = ['hex', 'rgb', 'hsl', 'hsv', 'cmyk'];
const CONTEXT_ORDER: BerryPickrContext[] = ['default', 'hover', 'active', 'focus', 'disabled'];
const DEFAULT_CONTEXT: BerryPickrContext = 'default';
const DEFAULT_HISTORY_LIMIT = 100;
const DEFAULT_RECENT_LIMIT = 24;
const DEFAULT_RECENT_STORAGE_KEY = 'berrypickr:recent';

interface HistoryEntry {
  context: BerryPickrContext;
  previous: BerryPickrColor | null;
  next: BerryPickrColor | null;
}

let instanceSeed = 0;

const nextInstanceId = (): string => {
  instanceSeed += 1;
  return `bp_${instanceSeed.toString(36)}`;
};

const toHexa = (color: BerryPickrColor | null): string | null => color?.to('hexa') ?? null;
const cloneColor = (color: BerryPickrColor | null): BerryPickrColor | null =>
  color ? colorFromHsva(color.toHSVA()) : null;

const equalColors = (left: BerryPickrColor | null, right: BerryPickrColor | null): boolean =>
  toHexa(left) === toHexa(right);

const sanitizeFormats = (formats: BerryPickrFormat[] | undefined, lockAlpha: boolean): BerryPickrFormat[] => {
  const base = formats?.length ? formats : DEFAULT_FORMATS;
  const uniq = Array.from(new Set(base));

  if (!lockAlpha) {
    return uniq;
  }

  const filtered = uniq.filter((format) => !['rgba', 'hsla', 'hsva', 'hexa'].includes(format));
  return filtered.length ? filtered : [...DEFAULT_LOCK_ALPHA_FORMATS];
};

const cloneContexts = (
  contexts: Record<BerryPickrContext, BerryPickrColor | null>
): Record<BerryPickrContext, BerryPickrColor | null> => {
  return {
    default: cloneColor(contexts.default),
    hover: cloneColor(contexts.hover),
    active: cloneColor(contexts.active),
    focus: cloneColor(contexts.focus),
    disabled: cloneColor(contexts.disabled)
  };
};

const cloneColorList = (colors: BerryPickrColor[]): BerryPickrColor[] =>
  colors.map((color) => colorFromHsva(color.toHSVA()));

const toHistorySnapshot = (history: HistoryEntry[], future: HistoryEntry[], limit: number): BerryPickrHistorySnapshot => {
  return {
    limit,
    length: history.length + future.length,
    index: history.length,
    canUndo: history.length > 0,
    canRedo: future.length > 0
  };
};

const parseInputColor = (input: string | null, lockAlpha: boolean): BerryPickrColor | null => {
  if (input === null) {
    return null;
  }

  return parseColor(input, { lockAlpha });
};

class BerryPickrControllerImpl implements BerryPickrController {
  readonly instanceId: string;

  private readonly emitter = new TypedEventEmitter<BerryPickrControllerEvents>();
  private readonly subscribers = new Set<(state: BerryPickrStateSnapshot) => void>();
  private readonly pluginCleanups: Array<{ plugin: BerryPickrPlugin; teardown: () => void }> = [];
  private readonly plugins: BerryPickrPlugin[];
  private pluginErrorPolicy: BerryPickrPluginErrorPolicy;

  private formats: BerryPickrFormat[];
  private format: BerryPickrFormat;
  private open = false;
  private disabled: boolean;
  private lockAlpha: boolean;
  private precision: number;

  private activeContext: BerryPickrContext;
  private contexts: Record<BerryPickrContext, BerryPickrColor | null>;
  private savedContexts: Record<BerryPickrContext, BerryPickrColor | null>;

  private swatches: BerryPickrColor[];
  private presets: Record<string, BerryPickrColor[]>;
  private recent: BerryPickrColor[] = [];

  private historyLimit: number;
  private history: HistoryEntry[] = [];
  private future: HistoryEntry[] = [];

  private transactionCounter = 0;
  private destroyed = false;

  private recentLimit: number;
  private recentStorageKey: string;
  private recentStorage: BerryPickrRecentColorStorage | undefined;

  constructor(options: BerryPickrControllerOptions = {}) {
    this.instanceId = nextInstanceId();
    this.lockAlpha = options.lockAlpha ?? false;
    this.formats = sanitizeFormats(options.formats, this.lockAlpha);
    this.format = options.format && this.formats.includes(options.format) ? options.format : this.formats[0] ?? 'hex';
    this.disabled = options.disabled ?? false;
    this.precision = options.precision ?? 2;

    this.activeContext = options.context ?? DEFAULT_CONTEXT;
    this.contexts = {
      default: null,
      hover: null,
      active: null,
      focus: null,
      disabled: null
    };

    const baseValueInput = options.value !== undefined ? options.value : options.defaultValue ?? null;
    const baseValue = parseInputColor(baseValueInput, this.lockAlpha);
    this.contexts[this.activeContext] = cloneColor(baseValue);

    if (options.contexts) {
      for (const context of CONTEXT_ORDER) {
        const input = options.contexts[context];
        if (input === undefined) {
          continue;
        }

        this.contexts[context] = parseInputColor(input, this.lockAlpha);
      }
    }

    this.savedContexts = cloneContexts(this.contexts);

    this.swatches = [];
    this.setSwatches(options.swatches ?? []);

    this.presets = {};
    this.setPresets(options.presets ?? {});

    this.historyLimit = Math.max(1, Math.floor(options.history?.limit ?? DEFAULT_HISTORY_LIMIT));
    this.recentLimit = Math.max(1, Math.floor(options.recentColors?.limit ?? DEFAULT_RECENT_LIMIT));
    this.recentStorageKey = options.recentColors?.storageKey ?? DEFAULT_RECENT_STORAGE_KEY;
    this.recentStorage = options.recentColors?.storage;
    this.loadRecentColorsFromStorage();

    this.plugins = options.plugins ?? [];
    this.pluginErrorPolicy = options.pluginErrorPolicy ?? 'emit';
    this.setupPlugins();
  }

  private nextMeta(): BerryPickrEventMeta {
    this.transactionCounter += 1;
    return {
      instanceId: this.instanceId,
      transactionId: `${this.instanceId}:${this.transactionCounter}`,
      timestamp: Date.now()
    };
  }

  private getHistorySnapshot(): BerryPickrHistorySnapshot {
    return toHistorySnapshot(this.history, this.future, this.historyLimit);
  }

  private emitHistoryChange(
    action: BerryPickrHistoryChangeEvent['action'],
    context: BerryPickrContext,
    meta: BerryPickrEventMeta
  ): void {
    this.emitter.emit('historyChange', {
      ...meta,
      action,
      context,
      history: this.getHistorySnapshot()
    });
  }

  private emitOptionsChange(changedKeys: string[], meta: BerryPickrEventMeta): void {
    const payload: BerryPickrOptionsChangeEvent = {
      ...meta,
      changedKeys,
      state: this.getState()
    };

    this.emitter.emit('optionsChange', payload);
  }

  private notifySubscribers(): void {
    const snapshot = this.getState();
    for (const listener of this.subscribers) {
      listener(snapshot);
    }
  }

  private setContextColor(context: BerryPickrContext, color: BerryPickrColor | null): void {
    this.contexts[context] = cloneColor(color);
  }

  private getContextColor(context: BerryPickrContext): BerryPickrColor | null {
    return cloneColor(this.contexts[context]);
  }

  private getActiveColor(): BerryPickrColor | null {
    return this.getContextColor(this.activeContext);
  }

  private getSavedActiveColor(): BerryPickrColor | null {
    return cloneColor(this.savedContexts[this.activeContext]);
  }

  private pushHistory(context: BerryPickrContext, previous: BerryPickrColor | null, next: BerryPickrColor | null): void {
    if (equalColors(previous, next)) {
      return;
    }

    this.history.push({
      context,
      previous: cloneColor(previous),
      next: cloneColor(next)
    });

    while (this.history.length > this.historyLimit) {
      this.history.shift();
    }

    this.future = [];
  }

  private withCommit(
    source: BerryPickrCommitEvent['source'],
    context: BerryPickrContext,
    meta: BerryPickrEventMeta
  ): void {
    const previousSavedValue = cloneColor(this.savedContexts[context]);
    const value = this.getContextColor(context);
    this.savedContexts[context] = cloneColor(value);

    this.pushRecentColor(value);

    const payload: BerryPickrCommitEvent = {
      ...meta,
      source,
      context,
      value: cloneColor(value),
      previousSavedValue
    };

    this.emitter.emit('commit', payload);
    this.notifyPluginsOnCommit(payload);

    this.notifySubscribers();
  }

  private pushRecentColor(color: BerryPickrColor | null): void {
    if (!color) {
      return;
    }

    const hex = color.to('hexa');
    const deduped = this.recent.filter((item) => item.to('hexa') !== hex);
    this.recent = [colorFromHsva(color.toHSVA()), ...deduped].slice(0, this.recentLimit);

    if (this.recentStorage) {
      try {
        this.recentStorage.save(
          this.recentStorageKey,
          this.recent.map((item) => item.to('hexa'))
        );
      } catch {
        // Persistence is optional and should never break controller usage.
      }
    }
  }

  private loadRecentColorsFromStorage(): void {
    if (!this.recentStorage) {
      return;
    }

    try {
      const loaded = this.recentStorage.load(this.recentStorageKey) ?? [];
      const parsed: BerryPickrColor[] = [];

      for (const value of loaded) {
        const color = parseColor(value, { lockAlpha: this.lockAlpha });
        if (color) {
          parsed.push(color);
        }
      }

      this.recent = parsed.slice(0, this.recentLimit);
    } catch {
      this.recent = [];
    }
  }

  private setupPlugins(): void {
    for (const plugin of this.plugins) {
      const teardown = this.invokePlugin(plugin, 'setup', () =>
        plugin.setup?.({
          instanceId: this.instanceId,
          getState: () => this.getState(),
          setValue: (input, opts) => this.setValue(input, opts),
          commit: (opts) => this.commit(opts),
          subscribe: (listener) => this.subscribe(listener)
        })
      );

      if (typeof teardown === 'function') {
        this.pluginCleanups.push({ plugin, teardown });
      }
    }
  }

  private emitPluginError(plugin: BerryPickrPlugin, phase: BerryPickrPluginErrorPhase, error: unknown): void {
    if (this.pluginErrorPolicy === 'throw') {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(`BerryPickr plugin "${plugin.name}" failed during "${phase}"`);
    }

    const payload: BerryPickrPluginErrorEvent = {
      ...this.nextMeta(),
      plugin: plugin.name,
      phase,
      error
    };

    this.emitter.emit('pluginError', payload);
  }

  private invokePlugin<T>(plugin: BerryPickrPlugin, phase: BerryPickrPluginErrorPhase, invoke: () => T): T | undefined {
    try {
      return invoke();
    } catch (error) {
      this.emitPluginError(plugin, phase, error);
      return undefined;
    }
  }

  private notifyPluginsOnChange(payload: BerryPickrChangeEvent): void {
    for (const plugin of this.plugins) {
      this.invokePlugin(plugin, 'change', () => {
        plugin.onChange?.(payload, this.getState());
      });
    }
  }

  private notifyPluginsOnCommit(payload: BerryPickrCommitEvent): void {
    for (const plugin of this.plugins) {
      this.invokePlugin(plugin, 'commit', () => {
        plugin.onCommit?.(payload, this.getState());
      });
    }
  }

  private toChangeEvent(
    source: ChangeSource,
    context: BerryPickrContext,
    previousValue: BerryPickrColor | null,
    value: BerryPickrColor | null,
    committed: boolean,
    meta: BerryPickrEventMeta
  ): BerryPickrChangeEvent {
    return {
      ...meta,
      source,
      context,
      previousValue: cloneColor(previousValue),
      value: cloneColor(value),
      committed
    };
  }

  getState(): BerryPickrStateSnapshot {
    const contexts: Record<BerryPickrContext, BerryPickrColor | null> = {
      default: cloneColor(this.contexts.default),
      hover: cloneColor(this.contexts.hover),
      active: cloneColor(this.contexts.active),
      focus: cloneColor(this.contexts.focus),
      disabled: cloneColor(this.contexts.disabled)
    };

    const presets: Record<string, BerryPickrColor[]> = {};
    for (const [category, colors] of Object.entries(this.presets)) {
      presets[category] = cloneColorList(colors);
    }

    presets.recent = cloneColorList(this.recent);

    return {
      instanceId: this.instanceId,
      value: this.getActiveColor(),
      savedValue: this.getSavedActiveColor(),
      format: this.format,
      formats: [...this.formats],
      open: this.open,
      disabled: this.disabled,
      swatches: cloneColorList(this.swatches),
      history: this.getHistorySnapshot(),
      context: this.activeContext,
      contexts,
      presets,
      recent: cloneColorList(this.recent),
      precision: this.precision,
      lockAlpha: this.lockAlpha
    };
  }

  subscribe(listener: (state: BerryPickrStateSnapshot) => void): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  setValue(input: string | null, opts?: BerryPickrSetValueOptions): boolean {
    if (this.destroyed) {
      return false;
    }

    const context = opts?.context ?? this.activeContext;
    const source = opts?.source ?? (input === null ? 'clear' : 'api');
    const previous = this.getContextColor(context);
    const next = parseInputColor(input, this.lockAlpha);

    if (input !== null && !next) {
      return false;
    }

    if (equalColors(previous, next)) {
      if (opts?.commit) {
        this.commit({ source });
      }
      return true;
    }

    this.setContextColor(context, next);
    this.pushHistory(context, previous, next);

    const meta = this.nextMeta();
    const payload = this.toChangeEvent(source, context, previous, next, Boolean(opts?.commit), meta);

    this.emitter.emit('change', payload);
    this.emitHistoryChange('push', context, meta);
    this.notifyPluginsOnChange(payload);

    this.notifySubscribers();

    if (opts?.commit) {
      this.withCommit(source, context, this.nextMeta());
    }

    return true;
  }

  setContextValue(context: BerryPickrContext, input: string | null, opts?: BerryPickrSetValueOptions): boolean {
    return this.setValue(input, {
      ...opts,
      context,
      source: opts?.source ?? 'context'
    });
  }

  getContextValue(context: BerryPickrContext): BerryPickrColor | null {
    return this.getContextColor(context);
  }

  selectContext(context: BerryPickrContext): boolean {
    if (this.destroyed || this.activeContext === context) {
      return false;
    }

    const previousValue = this.getActiveColor();
    this.activeContext = context;
    const value = this.getActiveColor();
    const meta = this.nextMeta();

    this.emitOptionsChange(['context'], meta);
    this.emitter.emit('change', this.toChangeEvent('context', context, previousValue, value, false, meta));
    this.notifySubscribers();

    return true;
  }

  commit(opts?: BerryPickrCommitOptions): string | null {
    if (this.destroyed) {
      return null;
    }

    const source = opts?.source ?? 'commit';
    const meta = this.nextMeta();
    this.withCommit(source, this.activeContext, meta);
    return meta.transactionId;
  }

  cancel(): boolean {
    if (this.destroyed) {
      return false;
    }

    const previous = this.getActiveColor();
    const saved = this.getSavedActiveColor();

    if (equalColors(previous, saved)) {
      return false;
    }

    this.setContextColor(this.activeContext, saved);
    this.pushHistory(this.activeContext, previous, saved);

    const meta = this.nextMeta();
    const payload = this.toChangeEvent('cancel', this.activeContext, previous, saved, false, meta);
    this.emitter.emit('change', payload);
    this.emitHistoryChange('push', this.activeContext, meta);
    this.notifyPluginsOnChange(payload);

    this.notifySubscribers();
    return true;
  }

  undo(): boolean {
    if (this.destroyed || this.history.length === 0) {
      return false;
    }

    const entry = this.history.pop();
    if (!entry) {
      return false;
    }

    this.future.push({
      context: entry.context,
      previous: cloneColor(entry.previous),
      next: cloneColor(entry.next)
    });

    this.activeContext = entry.context;
    this.setContextColor(entry.context, entry.previous);

    const meta = this.nextMeta();
    const payload = this.toChangeEvent('history', entry.context, entry.next, entry.previous, false, meta);
    this.emitter.emit('change', payload);
    this.emitHistoryChange('undo', entry.context, meta);
    this.notifyPluginsOnChange(payload);

    this.notifySubscribers();
    return true;
  }

  redo(): boolean {
    if (this.destroyed || this.future.length === 0) {
      return false;
    }

    const entry = this.future.pop();
    if (!entry) {
      return false;
    }

    this.history.push({
      context: entry.context,
      previous: cloneColor(entry.previous),
      next: cloneColor(entry.next)
    });

    this.activeContext = entry.context;
    this.setContextColor(entry.context, entry.next);

    const meta = this.nextMeta();
    const payload = this.toChangeEvent('history', entry.context, entry.previous, entry.next, false, meta);
    this.emitter.emit('change', payload);
    this.emitHistoryChange('redo', entry.context, meta);
    this.notifyPluginsOnChange(payload);

    this.notifySubscribers();
    return true;
  }

  updateOptions(next: Partial<BerryPickrControllerOptions>): void {
    if (this.destroyed) {
      return;
    }

    const changedKeys: string[] = [];
    const meta = this.nextMeta();

    if ('disabled' in next && next.disabled !== undefined && next.disabled !== this.disabled) {
      this.disabled = next.disabled;
      if (this.disabled && this.open) {
        this.open = false;
        this.emitter.emit('openChange', {
          ...meta,
          open: false
        });
      }
      changedKeys.push('disabled');
    }

    if ('format' in next && next.format !== undefined && next.format !== this.format && this.formats.includes(next.format)) {
      this.format = next.format;
      changedKeys.push('format');
    }

    if ('formats' in next && next.formats !== undefined) {
      this.formats = sanitizeFormats(next.formats, this.lockAlpha);
      if (!this.formats.includes(this.format)) {
        this.format = this.formats[0] ?? 'hex';
      }
      changedKeys.push('formats');
    }

    if ('swatches' in next && next.swatches !== undefined) {
      this.setSwatches(next.swatches);
      changedKeys.push('swatches');
    }

    if ('contexts' in next && next.contexts !== undefined) {
      for (const context of CONTEXT_ORDER) {
        const value = next.contexts[context];
        if (value !== undefined) {
          this.contexts[context] = parseInputColor(value, this.lockAlpha);
        }
      }
      changedKeys.push('contexts');
    }

    if ('context' in next && next.context && next.context !== this.activeContext) {
      this.activeContext = next.context;
      changedKeys.push('context');
    }

    if ('value' in next && next.value !== undefined) {
      const previous = this.getActiveColor();
      const parsed = parseInputColor(next.value, this.lockAlpha);
      if (next.value === null || parsed) {
        this.setContextColor(this.activeContext, parsed);

        if (!equalColors(previous, parsed)) {
          const payload = this.toChangeEvent('options', this.activeContext, previous, parsed, false, meta);
          this.emitter.emit('change', payload);
          this.notifyPluginsOnChange(payload);
        }
      }

      changedKeys.push('value');
    }

    if ('presets' in next && next.presets !== undefined) {
      this.setPresets(next.presets);
      changedKeys.push('presets');
    }

    if ('history' in next && next.history?.limit !== undefined) {
      this.historyLimit = Math.max(1, Math.floor(next.history.limit));
      while (this.history.length > this.historyLimit) {
        this.history.shift();
      }
      changedKeys.push('history.limit');
    }

    if ('precision' in next && next.precision !== undefined) {
      this.precision = next.precision;
      changedKeys.push('precision');
    }

    if ('recentColors' in next && next.recentColors !== undefined) {
      if (next.recentColors.limit !== undefined) {
        this.recentLimit = Math.max(1, Math.floor(next.recentColors.limit));
        this.recent = this.recent.slice(0, this.recentLimit);
      }

      if (next.recentColors.storageKey) {
        this.recentStorageKey = next.recentColors.storageKey;
      }

      if ('storage' in next.recentColors) {
        this.recentStorage = next.recentColors.storage;
      }

      this.loadRecentColorsFromStorage();
      changedKeys.push('recentColors');
    }

    if (
      'pluginErrorPolicy' in next &&
      next.pluginErrorPolicy !== undefined &&
      next.pluginErrorPolicy !== this.pluginErrorPolicy
    ) {
      this.pluginErrorPolicy = next.pluginErrorPolicy;
      changedKeys.push('pluginErrorPolicy');
    }

    if (changedKeys.length > 0) {
      this.emitOptionsChange(changedKeys, meta);
      this.notifySubscribers();
    }
  }

  setFormat(format: BerryPickrFormat): boolean {
    if (this.destroyed || !this.formats.includes(format) || this.format === format) {
      return false;
    }

    this.format = format;
    const meta = this.nextMeta();
    this.emitOptionsChange(['format'], meta);
    this.notifySubscribers();
    return true;
  }

  getFormat(): BerryPickrFormat {
    return this.format;
  }

  getFormats(): BerryPickrFormat[] {
    return [...this.formats];
  }

  setDisabled(disabled: boolean): void {
    if (this.destroyed || this.disabled === disabled) {
      return;
    }

    this.disabled = disabled;

    const meta = this.nextMeta();
    if (disabled && this.open) {
      this.open = false;
      this.emitter.emit('openChange', {
        ...meta,
        open: false
      });
    }

    this.emitOptionsChange(['disabled'], meta);
    this.notifySubscribers();
  }

  setOpen(open: boolean): boolean {
    if (this.destroyed || this.open === open || (this.disabled && open)) {
      return false;
    }

    this.open = open;
    const meta = this.nextMeta();

    this.emitter.emit('openChange', {
      ...meta,
      open
    });

    this.notifySubscribers();
    return true;
  }

  isOpen(): boolean {
    return this.open;
  }

  addSwatch(color: string): boolean {
    const parsed = parseColor(color, { lockAlpha: this.lockAlpha });
    if (!parsed) {
      return false;
    }

    this.swatches.push(parsed);
    const meta = this.nextMeta();
    this.emitOptionsChange(['swatches'], meta);
    this.notifySubscribers();
    return true;
  }

  removeSwatch(index: number): boolean {
    if (index < 0 || index >= this.swatches.length) {
      return false;
    }

    this.swatches.splice(index, 1);
    const meta = this.nextMeta();
    this.emitOptionsChange(['swatches'], meta);
    this.notifySubscribers();
    return true;
  }

  setSwatches(colors: string[]): void {
    const next: BerryPickrColor[] = [];
    for (const value of colors) {
      const parsed = parseColor(value, { lockAlpha: this.lockAlpha });
      if (parsed) {
        next.push(parsed);
      }
    }

    this.swatches = next;
  }

  setPresets(presets: Record<string, string[]>): void {
    const next: Record<string, BerryPickrColor[]> = {};

    for (const [category, values] of Object.entries(presets)) {
      const parsed: BerryPickrColor[] = [];

      for (const value of values) {
        const color = parseColor(value, { lockAlpha: this.lockAlpha });
        if (color) {
          parsed.push(color);
        }
      }

      next[category] = parsed;
    }

    this.presets = next;
  }

  getPresets(): Record<string, BerryPickrColor[]> {
    const output: Record<string, BerryPickrColor[]> = {};

    for (const [category, values] of Object.entries(this.presets)) {
      output[category] = cloneColorList(values);
    }

    output.recent = cloneColorList(this.recent);
    return output;
  }

  applyPreset(category: string, index: number, opts?: BerryPickrSetValueOptions): boolean {
    const source = opts?.source ?? 'preset';
    const colors = category === 'recent' ? this.recent : this.presets[category];
    const selected = colors?.[index];

    if (!selected) {
      return false;
    }

    return this.setValue(selected.to('hexa'), {
      ...opts,
      source
    });
  }

  getRecentColors(): BerryPickrColor[] {
    return cloneColorList(this.recent);
  }

  on<K extends keyof BerryPickrControllerEvents>(
    event: K,
    cb: (payload: BerryPickrControllerEvents[K]) => void
  ): () => void {
    return this.emitter.on(event, cb);
  }

  off<K extends keyof BerryPickrControllerEvents>(
    event: K,
    cb: (payload: BerryPickrControllerEvents[K]) => void
  ): void {
    this.emitter.off(event, cb);
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    const meta = this.nextMeta();

    for (const entry of this.pluginCleanups) {
      this.invokePlugin(entry.plugin, 'teardown', () => {
        entry.teardown();
      });
    }

    this.pluginCleanups.length = 0;
    this.subscribers.clear();

    this.emitter.emit('destroy', meta);
    this.emitter.clear();
  }
}

/**
 * Creates a headless BerryPickr controller instance.
 *
 * @param options Initial controller configuration.
 * @returns A new controller instance.
 */
export const createBerryPickrController = (options: BerryPickrControllerOptions = {}): BerryPickrController => {
  return new BerryPickrControllerImpl(options);
};

/**
 * Ordered list of supported interaction contexts.
 */
export const BERRY_PICKR_CONTEXTS: readonly BerryPickrContext[] = CONTEXT_ORDER;
