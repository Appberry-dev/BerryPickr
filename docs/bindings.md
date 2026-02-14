# Bindings Guide

## When to use

Use bindings when the `controller` should drive live CSS output without writing custom subscription glue.

## Quick example

```ts
import { createBerryPickrController, createCssVarBinding } from 'berrypickr';

const controller = createBerryPickrController({ defaultValue: '#486dff' });

const binding = createCssVarBinding({
  controller,
  target: ':root',
  variable: '--brand-color',
  format: 'hexa',
  event: 'commit'
});

controller.commit();
```

## Options/Methods

## `createCssVarBinding(config)`

| Option | Type | Default | Behavior |
| --- | --- | --- | --- |
| `controller` | `BerryPickrController` | required | Source snapshot/events |
| `target` | `string \| HTMLElement \| () => HTMLElement \| null` | required | Resolved on each sync |
| `variable` | `string` | required | CSS custom property name |
| `format` | `BerryPickrFormat` | `'hexa'` | Serialization format |
| `fallback` | `string` | `undefined` | Used when color is `null` |
| `context` | `BerryPickrContext` | active context | Reads specific context instead of active `value` |
| `event` | `'change' \| 'commit'` | `'change'` | Subscription trigger |

## `createStyleBinding(config)`

Same contract as CSS variable binding, but writes `property` on inline style.

| Option | Type | Default |
| --- | --- | --- |
| `property` | `string` | required |

## Binding handle

Both factories return:

```ts
interface BerryPickrBinding {
  sync(): boolean;
  destroy(): void;
}
```

- `sync()` returns `false` if target cannot be resolved.
- If color is `null` and no fallback is provided, the property is removed.

## Event strategy: `change` vs `commit`

- Use `event: 'change'` for live previews and gradients.
- Use `event: 'commit'` when downstream updates are expensive (saving themes, recomputing palettes, network sync).

```ts
createStyleBinding({
  controller,
  target: '#preview',
  property: 'background-color',
  format: 'rgba',
  event: 'change'
});

createCssVarBinding({
  controller,
  target: ':root',
  variable: '--persisted-brand-color',
  format: 'hexa',
  event: 'commit'
});
```

## Context-specific binding

```ts
createCssVarBinding({
  controller,
  target: ':root',
  variable: '--hover-color',
  format: 'hex',
  context: 'hover',
  fallback: '#000000'
});
```

## Gotchas

- A function target is resolved on each sync, so avoid expensive DOM queries.
- Bindings do not create controller state; ensure values exist for the chosen context.
- `destroy()` only unsubscribes, it does not clear CSS properties automatically.

## Related pages

- [Controller Guide](/controller)
- [UI Mount Guide](/ui-mount)
- [Recipes](/recipes)
- [Styling Guide](/styling)
