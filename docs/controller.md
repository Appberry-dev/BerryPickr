# Controller Guide

## When to use

Use this page when you are implementing serious product behavior around color state, history, presets, plugins, and event orchestration.

## Quick example

```ts
import { createBerryPickrController } from '@appberry/berrypickr';

const controller = createBerryPickrController({
  defaultValue: '#486dff',
  formats: ['hex', 'rgba', 'hsla'],
  history: { limit: 120 },
  recentColors: { limit: 24 },
  pluginErrorPolicy: 'emit'
});

controller.on('change', ({ source, transactionId, value }) => {
  console.log('change', source, transactionId, value?.to('rgba'));
});

controller.on('commit', ({ transactionId, value }) => {
  console.log('commit', transactionId, value?.to('hexa'));
});
```

## Options/Methods

## `createBerryPickrController(options)`

### `BerryPickrControllerOptions`

| Option | Type | Default | Behavior |
| --- | --- | --- | --- |
| `value` | `string \| null` | `undefined` | Initial controlled value; if provided, takes precedence over `defaultValue` |
| `defaultValue` | `string \| null` | `null` | Initial fallback color when `value` is not provided |
| `format` | `BerryPickrFormat` | First available format | Active format if included in `formats` |
| `formats` | `BerryPickrFormat[]` | `['hex','hexa','rgb','rgba','hsl','hsla','hsv','hsva','cmyk']` | Allowed output formats; deduped |
| `disabled` | `boolean` | `false` | Disables edits and blocks opening when UI is mounted |
| `lockAlpha` | `boolean` | `false` | Removes alpha-inclusive formats and forces alpha to 1 |
| `precision` | `number` | `2` | Decimal precision for formatted output |
| `swatches` | `string[]` | `[]` | Invalid colors are ignored during parse |
| `history.limit` | `number` | `100` | Max undo entries, clamped to at least `1` |
| `contexts` | `Partial<Record<Context, string \| null>>` | all `null` | Seed context-specific values |
| `context` | `BerryPickrContext` | `'default'` | Active context pointer |
| `presets` | `Record<string, string[]>` | `{}` | Preset groups; invalid colors are filtered out |
| `recentColors.limit` | `number` | `24` | Max recent entries, clamped to at least `1` |
| `recentColors.storage` | `{ load; save }` | `undefined` | Optional persistence adapter |
| `recentColors.storageKey` | `string` | `'berrypickr:recent'` | Key used for persistence adapter |
| `plugins` | `BerryPickrPlugin[]` | `[]` | Plugin callbacks on setup/change/commit/teardown |
| `pluginErrorPolicy` | `'emit' \| 'throw'` | `'emit'` | Plugin failure handling strategy |

<DocsCallout type="warning" title="Format filtering">
If `lockAlpha` is true, alpha formats (`hexa`, `rgba`, `hsla`, `hsva`) are removed. If all requested formats are alpha-based, controller falls back to `['hex', 'rgb', 'hsl', 'hsv', 'cmyk']`.
</DocsCallout>

### State and write methods

| Method | Returns | Notes |
| --- | --- | --- |
| `getState()` | `BerryPickrStateSnapshot` | Safe snapshot copy with colors, history, contexts, and flags |
| `subscribe(listener)` | `() => void` | Fires on every state update |
| `setValue(input, opts?)` | `boolean` | `false` for invalid non-null input; can auto-commit with `opts.commit` |
| `commit(opts?)` | `string \| null` | Emits `commit`; returns transaction ID unless destroyed |
| `cancel()` | `boolean` | Restores active context value to saved value |
| `undo()` | `boolean` | Pops history and applies previous entry |
| `redo()` | `boolean` | Reapplies next entry from future stack |
| `destroy()` | `void` | Emits `destroy`, runs plugin teardowns, clears listeners |

### Context methods

| Method | Returns | Notes |
| --- | --- | --- |
| `selectContext(context)` | `boolean` | Changes active context; emits `optionsChange` and `change` (`source: 'context'`) |
| `setContextValue(context, input, opts?)` | `boolean` | Shortcut for writing a specific context |
| `getContextValue(context)` | `BerryPickrColor \| null` | Snapshot-safe clone |

### UI coordination methods

| Method | Returns | Notes |
| --- | --- | --- |
| `setOpen(open)` | `boolean` | No-op if disabled and opening requested |
| `isOpen()` | `boolean` | Current open flag |
| `setDisabled(disabled)` | `void` | Closes open UI when set to true |
| `setFormat(format)` | `boolean` | Fails if format is unavailable |
| `getFormat()` | `BerryPickrFormat` | Active format |
| `getFormats()` | `BerryPickrFormat[]` | Current allowed formats |

### Swatches and presets

| Method | Returns | Notes |
| --- | --- | --- |
| `addSwatch(color)` | `boolean` | Invalid colors are rejected |
| `removeSwatch(index)` | `boolean` | Fails for out-of-range indices |
| `setSwatches(colors)` | `void` | Replaces and filters invalid values |
| `setPresets(presets)` | `void` | Replaces grouped preset palette |
| `getPresets()` | `Record<string, BerryPickrColor[]>` | Includes runtime `recent` group |
| `applyPreset(category, index, opts?)` | `boolean` | Supports `'recent'` as a category |
| `getRecentColors()` | `BerryPickrColor[]` | Most-recent-first committed colors |

## Events

### Event names

- `change`
- `commit`
- `historyChange`
- `optionsChange`
- `openChange`
- `pluginError`
- `destroy`

All payloads include `instanceId`, `transactionId`, and `timestamp`.

### Event examples

```ts
controller.on('change', ({ source, context, previousValue, value, transactionId }) => {
  console.log(source, context, transactionId, previousValue?.to('hexa'), value?.to('hexa'));
});

controller.on('historyChange', ({ action, history }) => {
  console.log(action, history.index, history.length, history.canUndo, history.canRedo);
});

controller.on('pluginError', ({ plugin, phase, error }) => {
  console.error(`[${plugin}] ${phase}`, error);
});
```

## Behavior notes

- `setValue('invalid')` returns `false`, emits nothing.
- `setValue` with same resolved color is a no-op; with `{ commit: true }`, it still commits.
- `commit()` only changes saved state and recents, not history stacks.
- `undo()`/`redo()` switch active context to the history entry context.
- Updating `disabled: true` closes the picker if currently open.

## Gotchas

- `updateOptions({ value })` emits `change` with `source: 'options'` when value differs.
- Updating `recentColors.storage` triggers a reload from storage key.
- `pluginErrorPolicy: 'throw'` can interrupt calling flows if plugin callbacks throw.

## Related pages

- [Concepts](/concepts)
- [UI Mount Guide](/ui-mount)
- [Plugins Guide](/plugins)
- [API Index](/api)
