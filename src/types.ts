/**
 * Rendering mode for BerryPickr UI.
 */
export type BerryPickrMode = 'popover' | 'inline';
/**
 * Supported color serialization formats.
 */
export type BerryPickrFormat =
    | 'hex'
    | 'hexa'
    | 'rgb'
    | 'rgba'
    | 'hsl'
    | 'hsla'
    | 'hsv'
    | 'hsva'
    | 'cmyk';

/**
 * Origin of a color/state mutation.
 */
export type ChangeSource =
    | 'palette'
    | 'hue'
    | 'alpha'
    | 'input'
    | 'swatch'
    | 'api'
    | 'clear'
    | 'cancel'
    | 'history'
    | 'options'
    | 'context'
    | 'preset'
    | 'commit';

/**
 * Named UI/state context buckets used by the controller.
 */
export type BerryPickrContext = 'default' | 'hover' | 'active' | 'focus' | 'disabled';

/**
 * UI strings for accessibility labels and button text.
 */
export interface BerryPickrI18n {
    dialog: string;
    toggle: string;
    save: string;
    cancel: string;
    clear: string;
    swatch: string;
    input: string;
    palette: string;
    hue: string;
    alpha: string;
}

/**
 * Per-component visibility flags.
 */
export interface BerryPickrComponents {
    preview: boolean;
    palette: boolean;
    hue: boolean;
    alpha: boolean;
    input: boolean;
    save: boolean;
    cancel: boolean;
    clear: boolean;
}

/**
 * Runtime color object abstraction shared across APIs.
 */
export interface BerryPickrColor {
    to(format: BerryPickrFormat, precision?: number): string;
    toRGBA(): [number, number, number, number];
    toHSVA(): [number, number, number, number];
    toHSLA(): [number, number, number, number];
    toCMYK(): [number, number, number, number];
    toHEXA(): string;
}

/**
 * Storage adapter for recent colors.
 */
export interface BerryPickrRecentColorStorage {
    load(key: string): string[] | null | undefined;
    save(key: string, colors: string[]): void;
}

/**
 * Undo/redo history configuration.
 */
export interface BerryPickrHistoryOptions {
    limit?: number;
}

/**
 * Recent colors configuration.
 */
export interface BerryPickrRecentColorsOptions {
    limit?: number;
    storage?: BerryPickrRecentColorStorage;
    storageKey?: string;
}

/**
 * Preset groups keyed by category name.
 */
export type BerryPickrPresets = Record<string, string[]>;

/**
 * Optional behavior flags for `setValue`.
 */
export interface BerryPickrSetValueOptions {
    source?: ChangeSource;
    silent?: boolean;
    commit?: boolean;
    context?: BerryPickrContext;
}

/**
 * Optional behavior flags for `commit`.
 */
export interface BerryPickrCommitOptions {
    source?: ChangeSource;
}

/**
 * Constructor and runtime options for headless controllers.
 */
export interface BerryPickrControllerOptions {
    value?: string | null;
    defaultValue?: string | null;
    format?: BerryPickrFormat;
    formats?: BerryPickrFormat[];
    disabled?: boolean;
    lockAlpha?: boolean;
    precision?: number;
    swatches?: string[];
    history?: BerryPickrHistoryOptions;
    contexts?: Partial<Record<BerryPickrContext, string | null>>;
    context?: BerryPickrContext;
    presets?: BerryPickrPresets;
    recentColors?: BerryPickrRecentColorsOptions;
    plugins?: BerryPickrPlugin[];
    pluginErrorPolicy?: BerryPickrPluginErrorPolicy;
}

/**
 * Serializable history state.
 */
export interface BerryPickrHistorySnapshot {
    limit: number;
    length: number;
    index: number;
    canUndo: boolean;
    canRedo: boolean;
}

/**
 * Read-only snapshot returned by controller getters/subscriptions.
 */
export interface BerryPickrStateSnapshot {
    instanceId: string;
    value: BerryPickrColor | null;
    savedValue: BerryPickrColor | null;
    format: BerryPickrFormat;
    formats: BerryPickrFormat[];
    open: boolean;
    disabled: boolean;
    swatches: BerryPickrColor[];
    history: BerryPickrHistorySnapshot;
    context: BerryPickrContext;
    contexts: Record<BerryPickrContext, BerryPickrColor | null>;
    presets: Record<string, BerryPickrColor[]>;
    recent: BerryPickrColor[];
    precision: number;
    lockAlpha: boolean;
}

/**
 * Shared metadata included with controller events.
 */
export interface BerryPickrEventMeta {
    instanceId: string;
    transactionId: string;
    timestamp: number;
}

/**
 * Payload for value change events.
 */
export interface BerryPickrChangeEvent extends BerryPickrEventMeta {
    source: ChangeSource;
    context: BerryPickrContext;
    value: BerryPickrColor | null;
    previousValue: BerryPickrColor | null;
    committed: boolean;
}

/**
 * Payload for explicit commit/save events.
 */
export interface BerryPickrCommitEvent extends BerryPickrEventMeta {
    source: ChangeSource;
    context: BerryPickrContext;
    value: BerryPickrColor | null;
    previousSavedValue: BerryPickrColor | null;
}

/**
 * Payload for history stack mutations.
 */
export interface BerryPickrHistoryChangeEvent extends BerryPickrEventMeta {
    action: 'push' | 'undo' | 'redo' | 'clear';
    context: BerryPickrContext;
    history: BerryPickrHistorySnapshot;
}

/**
 * Payload emitted when runtime options are updated.
 */
export interface BerryPickrOptionsChangeEvent extends BerryPickrEventMeta {
    changedKeys: string[];
    state: BerryPickrStateSnapshot;
}

/**
 * Payload emitted when open state changes.
 */
export interface BerryPickrOpenChangeEvent extends BerryPickrEventMeta {
    open: boolean;
}

/**
 * Lifecycle phase where a plugin error occurred.
 */
export type BerryPickrPluginErrorPhase = 'setup' | 'change' | 'commit' | 'teardown';
/**
 * Policy for handling plugin runtime failures.
 */
export type BerryPickrPluginErrorPolicy = 'emit' | 'throw';

/**
 * Payload emitted when plugin callbacks throw.
 */
export interface BerryPickrPluginErrorEvent extends BerryPickrEventMeta {
    plugin: string;
    phase: BerryPickrPluginErrorPhase;
    error: unknown;
}

/**
 * Controller capabilities exposed to plugins.
 */
export interface BerryPickrPluginContext {
    instanceId: string;
    getState: () => BerryPickrStateSnapshot;
    setValue: (input: string | null, opts?: BerryPickrSetValueOptions) => boolean;
    commit: (opts?: BerryPickrCommitOptions) => string | null;
    subscribe: (listener: (state: BerryPickrStateSnapshot) => void) => () => void;
}

/**
 * Plugin contract for controller extensions.
 */
export interface BerryPickrPlugin {
    name: string;
    setup?: (context: BerryPickrPluginContext) => void | (() => void);
    onChange?: (event: BerryPickrChangeEvent, state: BerryPickrStateSnapshot) => void;
    onCommit?: (event: BerryPickrCommitEvent, state: BerryPickrStateSnapshot) => void;
}

/**
 * Event map for headless controller `.on`/`.off`.
 */
export interface BerryPickrControllerEvents {
    change: BerryPickrChangeEvent;
    commit: BerryPickrCommitEvent;
    historyChange: BerryPickrHistoryChangeEvent;
    optionsChange: BerryPickrOptionsChangeEvent;
    openChange: BerryPickrOpenChangeEvent;
    pluginError: BerryPickrPluginErrorEvent;
    destroy: BerryPickrEventMeta;
}

/**
 * Headless controller API for managing color state and events.
 */
export interface BerryPickrController {
    readonly instanceId: string;
    getState(): BerryPickrStateSnapshot;
    subscribe(listener: (state: BerryPickrStateSnapshot) => void): () => void;
    setValue(input: string | null, opts?: BerryPickrSetValueOptions): boolean;
    setContextValue(
        context: BerryPickrContext,
        input: string | null,
        opts?: BerryPickrSetValueOptions
    ): boolean;
    getContextValue(context: BerryPickrContext): BerryPickrColor | null;
    selectContext(context: BerryPickrContext): boolean;
    commit(opts?: BerryPickrCommitOptions): string | null;
    cancel(): boolean;
    undo(): boolean;
    redo(): boolean;
    updateOptions(next: Partial<BerryPickrControllerOptions>): void;
    setFormat(format: BerryPickrFormat): boolean;
    getFormat(): BerryPickrFormat;
    getFormats(): BerryPickrFormat[];
    setDisabled(disabled: boolean): void;
    setOpen(open: boolean): boolean;
    isOpen(): boolean;
    addSwatch(color: string): boolean;
    removeSwatch(index: number): boolean;
    setSwatches(colors: string[]): void;
    setPresets(presets: BerryPickrPresets): void;
    getPresets(): Record<string, BerryPickrColor[]>;
    applyPreset(category: string, index: number, opts?: BerryPickrSetValueOptions): boolean;
    getRecentColors(): BerryPickrColor[];
    on<K extends keyof BerryPickrControllerEvents>(
        event: K,
        cb: (payload: BerryPickrControllerEvents[K]) => void
    ): () => void;
    off<K extends keyof BerryPickrControllerEvents>(
        event: K,
        cb: (payload: BerryPickrControllerEvents[K]) => void
    ): void;
    destroy(): void;
}

/**
 * Target resolver for style bindings.
 */
export type BerryPickrBindingTarget = string | HTMLElement | (() => HTMLElement | null);

/**
 * Options for CSS variable bindings.
 */
export interface BerryPickrCssVarBindingConfig {
    controller: BerryPickrController;
    target: BerryPickrBindingTarget;
    variable: string;
    format?: BerryPickrFormat;
    fallback?: string;
    context?: BerryPickrContext;
    event?: 'change' | 'commit';
}

/**
 * Options for inline style bindings.
 */
export interface BerryPickrStyleBindingConfig {
    controller: BerryPickrController;
    target: BerryPickrBindingTarget;
    property: string;
    format?: BerryPickrFormat;
    fallback?: string;
    context?: BerryPickrContext;
    event?: 'change' | 'commit';
}

/**
 * Handle returned by style/css-var bindings.
 */
export interface BerryPickrBinding {
    sync(): boolean;
    destroy(): void;
}

/**
 * Contrast analysis result with WCAG pass/fail flags.
 */
export interface BerryPickrContrastResult {
    ratio: number;
    wcagAA: boolean;
    wcagAAA: boolean;
    wcagAALarge: boolean;
    wcagAAALarge: boolean;
    foreground: string;
    background: string;
}

/**
 * Registry API for working with multiple controller instances.
 */
export interface BerryPickrControllerManager {
    create(options?: BerryPickrControllerOptions): BerryPickrController;
    register(controller: BerryPickrController): void;
    unregister(instanceId: string): void;
    get(instanceId: string): BerryPickrController | undefined;
    list(): BerryPickrController[];
    destroy(): void;
}

/**
 * Handle returned by `mountBerryPickrUI`.
 */
export interface BerryPickrUIMount {
    show(): boolean;
    hide(): boolean;
    isOpen(): boolean;
    getController(): BerryPickrController;
    update(next: Partial<BerryPickrUIOptions>): void;
    focus(part?: BerryPickrUIFocusPart): boolean;
    destroy(opts?: { remove?: boolean }): void;
}

/**
 * Focus target for mount `.focus()` helpers.
 */
export type BerryPickrUIFocusPart = 'palette' | 'hue' | 'alpha' | 'input';

/**
 * UI-only mounting options for headless controllers.
 */
export interface BerryPickrUIOptions {
    target: string | HTMLElement;
    container?: string | HTMLElement;
    mode?: BerryPickrMode;
    showAlways?: boolean;
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnScroll?: boolean;
    autoReposition?: boolean;
    adjustableInputNumbers?: boolean;
    components?: Partial<BerryPickrComponents>;
    i18n?: Partial<BerryPickrI18n>;
}

/**
 * Normalized UI options used by the mounted runtime.
 */
export interface ResolvedBerryPickrUIOptions {
    target: HTMLElement;
    container: HTMLElement;
    ownerDocument: Document;
    ownerWindow: Window;
    mode: BerryPickrMode;
    showAlways: boolean;
    closeOnEscape: boolean;
    closeOnOutsideClick: boolean;
    closeOnScroll: boolean;
    autoReposition: boolean;
    adjustableInputNumbers: boolean;
    components: BerryPickrComponents;
    i18n: BerryPickrI18n;
}
