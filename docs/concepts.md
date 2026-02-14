# Concepts

## When to use

Read this before deep implementation work so your team shares the same `controller` and `mount` mental model.

## Quick example

```ts
import { createBerryPickrController, mountBerryPickrUI } from '@appberry/berrypickr';

const controller = createBerryPickrController({
  defaultValue: '#2f72d6',
  context: 'default'
});

mountBerryPickrUI(controller, {
  target: '#picker-trigger',
  mode: 'popover'
});

controller.on('change', ({ source, context, transactionId }) => {
  console.log('change', source, context, transactionId);
});

controller.on('commit', ({ context, transactionId }) => {
  console.log('commit', context, transactionId);
});
```

## Core mental model

BerryPickr separates responsibilities into four layers:

- `controller`: source of truth for color state, contexts, history, and events
- `mount`: optional default UI that reads/writes through the controller
- `bindings`: output helpers that write controller color to CSS variables or style properties
- `adapters`: framework-specific wrappers that manage lifecycle with React/Vue/Svelte

## Event flow and transaction IDs

Every controller event includes:

- `instanceId`: controller identity
- `transactionId`: monotonically increasing ID per instance
- `timestamp`: event time

Use `transactionId` for:

- debug traces in analytics
- correlating `change` and `commit` behavior
- deterministic logging across plugins and UI consumers

## `change` vs `commit`

- `change`: emitted when working value changes (`setValue`, slider/input/swatch actions, undo/redo, cancel, options updates)
- `commit`: emitted only when you explicitly call `commit()` or when `setValue(..., { commit: true })`

A common workflow:

1. User edits continuously (`change`)
2. UI previews update live
3. User confirms save (`commit`)
4. App persists committed value

## Context model

BerryPickr keeps separate color buckets for stateful UI contexts:

- `default`
- `hover`
- `active`
- `focus`
- `disabled`

You can move between contexts and set values independently:

```ts
controller.selectContext('hover');
controller.setValue('#6f4cd6', { source: 'context' });

controller.selectContext('default');
controller.commit();
```

## Options/Methods

### Concepts mapped to APIs

| Concept | API | Notes |
| --- | --- | --- |
| Working color | `setValue` | Returns `false` on invalid input |
| Saved color | `commit`, `cancel` | `cancel` restores current context to saved value |
| Context switching | `selectContext`, `setContextValue` | Context change can emit `change` with source `'context'` |
| Open state | `setOpen`, `isOpen` | Used by popover UI mode |
| Time travel | `undo`, `redo` | History is context-aware |

## Gotchas

- Selecting a context changes what `state.value` points to.
- Committing updates recent colors; plain `change` does not.
- History entries are pushed when value actually changes, not on no-op writes.
- With `lockAlpha: true`, alpha-inclusive formats are removed from supported formats.

## Related pages

- [Quickstart](/quickstart)
- [Controller Guide](/controller)
- [UI Mount Guide](/ui-mount)
- [Recipes](/recipes)
