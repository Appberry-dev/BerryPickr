# API Index

## When to use

Use this page as a stable index of public BerryPickr exports and where each API is documented in detail.

## Quick example

```ts
import {
  version,
  BERRY_PICKR_CONTEXTS,
  createBerryPickrController,
  createBerryPickrControllerManager,
  mountBerryPickrUI,
  createCssVarBinding,
  createStyleBinding,
  getContrastRatio,
  analyzeContrast
} from 'berrypickr';
```

## Entry points

- `berrypickr`
- `berrypickr/react`
- `berrypickr/vue`
- `berrypickr/svelte`
- `berrypickr/styles/base.css`
- `berrypickr/styles/skin-template.css`

## Options/Methods

## Core exports (`berrypickr`)

| Export | Kind | Purpose | Detailed docs |
| --- | --- | --- | --- |
| `createBerryPickrController` | function | Create headless controller | [Controller](/controller) |
| `BERRY_PICKR_CONTEXTS` | constant | Ordered supported contexts | [Concepts](/concepts) |
| `createBerryPickrControllerManager` | function | Manage many controller instances | [Controller](/controller) |
| `mountBerryPickrUI` | function | Mount optional default UI | [UI Mount](/ui-mount) |
| `createCssVarBinding` | function | Bind color to CSS variable | [Bindings](/bindings) |
| `createStyleBinding` | function | Bind color to style property | [Bindings](/bindings) |
| `getContrastRatio` | function | Compute WCAG contrast ratio | This page |
| `analyzeContrast` | function | Ratio + AA/AAA flags | This page |
| `version` | constant | Package version string | This page |

## Framework exports

| Entry point | Exports | Guide |
| --- | --- | --- |
| `berrypickr/react` | `useBerryPickrController`, `useMountedBerryPickrUI` | [Integrations](/integrations) |
| `berrypickr/vue` | `useVueBerryPickrController`, `useMountedVueBerryPickrUI` | [Integrations](/integrations) |
| `berrypickr/svelte` | `createSvelteBerryPickrStore`, `berryPickr` | [Integrations](/integrations) |

## Utility APIs

### `version`

```ts
console.log(version); // e.g. "2.0.0"
```

### `BERRY_PICKR_CONTEXTS`

```ts
console.log(BERRY_PICKR_CONTEXTS);
// ['default', 'hover', 'active', 'focus', 'disabled']
```

### `createBerryPickrControllerManager()`

```ts
const manager = createBerryPickrControllerManager();

const first = manager.create({ defaultValue: '#3355ee' });
const second = manager.create({ defaultValue: '#db5f8f' });

console.log(manager.list().map((c) => c.instanceId));
manager.unregister(first.instanceId);
manager.destroy();
second.destroy();
```

### Contrast helpers

```ts
const ratio = getContrastRatio('#111827', '#ffffff');

const analysis = analyzeContrast('#111827', '#ffffff');
// {
//   ratio,
//   wcagAA,
//   wcagAAA,
//   wcagAALarge,
//   wcagAAALarge,
//   foreground,
//   background
// }
```

Both helpers return `null` when either color cannot be parsed.

## Public types

Commonly used public types include:

- `BerryPickrController`
- `BerryPickrControllerOptions`
- `BerryPickrUIOptions`
- `BerryPickrUIMount`
- `BerryPickrPlugin`
- `BerryPickrBinding`
- `BerryPickrContrastResult`

Import from `berrypickr`:

```ts
import type { BerryPickrControllerOptions, BerryPickrPlugin } from 'berrypickr';
```

## Gotchas

- This index covers stable public exports only.
- Legacy/internal APIs are intentionally excluded from handbook documentation.
- Types for framework adapters are exported from their adapter entry points.

## Related pages

- [Controller Guide](/controller)
- [UI Mount Guide](/ui-mount)
- [Bindings Guide](/bindings)
- [Integrations](/integrations)
- [Recipes](/recipes)
