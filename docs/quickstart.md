# Quickstart

## When to use

Use this page when you want your first working BerryPickr integration quickly with clear `controller` and `mount` responsibilities.

## Prerequisites

- Node.js 20+
- A browser environment (BerryPickr is DOM-based)
- A trigger element in the page (for example, a button)

## Quick example

```ts
import { createBerryPickrController, mountBerryPickrUI } from 'berrypickr';
import 'berrypickr/styles/base.css';

const controller = createBerryPickrController({
  defaultValue: '#4169f6'
});

const mount = mountBerryPickrUI(controller, {
  target: '#color-target',
  mode: 'popover'
});

controller.on('change', ({ source, value, transactionId }) => {
  console.log(source, transactionId, value?.to('rgba'));
});
```

## First 10 minutes

1. Install the package.

```bash
pnpm add berrypickr
```

2. Import APIs and CSS.

```ts
import { createBerryPickrController, mountBerryPickrUI } from 'berrypickr';
import 'berrypickr/styles/base.css';
```

3. Create a `controller`.

```ts
const controller = createBerryPickrController({
  defaultValue: '#486dff',
  formats: ['hex', 'rgba', 'hsla'],
  precision: 2,
  history: { limit: 100 }
});
```

4. Create a UI `mount`.

```ts
const mount = mountBerryPickrUI(controller, {
  target: '#color-button',
  mode: 'popover',
  closeOnOutsideClick: true,
  closeOnEscape: true
});
```

5. Commit intentionally when your workflow saves color.

```ts
const saveButton = document.querySelector<HTMLButtonElement>('#save-brand-color');
saveButton?.addEventListener('click', () => {
  const transactionId = controller.commit({ source: 'commit' });
  console.log('saved with', transactionId);
});
```

6. Tear down when the host view unmounts.

```ts
mount.destroy({ remove: true });
controller.destroy();
```

## Options/Methods

### Useful controller options for first integrations

| Option | Default | Why set it early |
| --- | --- | --- |
| `defaultValue` | `null` | Gives users a stable starting color |
| `formats` | All formats | Limits output to what your product accepts |
| `history.limit` | `100` | Controls undo memory size |
| `pluginErrorPolicy` | `'emit'` | Keeps plugin failures observable but non-fatal |

### Methods you will use immediately

- `controller.setValue(input, opts?)`: update working color
- `controller.commit(opts?)`: persist saved color and receive `transactionId`
- `controller.cancel()`: revert active context to saved value
- `mount.show()` / `mount.hide()`: control popover visibility
- `mount.update(next)`: change UI behavior without remounting

## Gotchas

- Import `berrypickr/styles/base.css` or the mounted UI has no layout styling.
- `setValue('bad-color')` returns `false` and does not emit a change.
- `change` and `commit` are different events: `change` is live editing, `commit` is explicit save.
- `mount.update()` cannot change `target` or `container`; remount for that.

## Common mistakes

- Treating every `change` as final state write to storage.
- Destroying the `controller` but leaving the mounted DOM attached.
- Passing a selector that does not resolve to a real element.

## Related pages

- [Concepts](/concepts)
- [Controller Guide](/controller)
- [UI Mount Guide](/ui-mount)
- [Bindings Guide](/bindings)
