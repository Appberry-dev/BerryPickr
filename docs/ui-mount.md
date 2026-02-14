# UI Mount Guide

## When to use

Use this page when you want BerryPickr's default UI and need precise behavior around popovers, inline mode, focus, visibility, and runtime updates.

## Quick example

```ts
import { createBerryPickrController, mountBerryPickrUI } from 'berrypickr';
import 'berrypickr/styles/base.css';

const controller = createBerryPickrController({ defaultValue: '#486dff' });

const mount = mountBerryPickrUI(controller, {
  target: '#color-trigger',
  mode: 'popover',
  closeOnOutsideClick: true,
  closeOnEscape: true,
  autoReposition: true
});

mount.show();
```

## Options/Methods

## `BerryPickrUIOptions`

| Option | Type | Default | Behavior |
| --- | --- | --- | --- |
| `target` | `string \| HTMLElement` | required | Trigger or inline anchor element |
| `container` | `string \| HTMLElement` | `document.body` | Host container for popover app node |
| `mode` | `'popover' \| 'inline'` | `'popover'` | Rendering strategy |
| `showAlways` | `boolean` | `false` | Forces open behavior (also true in inline mode) |
| `closeOnEscape` | `boolean` | `true` | Escape key close for popover mode |
| `closeOnOutsideClick` | `boolean` | `true` | Outside pointer close for popover mode |
| `closeOnScroll` | `boolean` | `false` | Close popover when scroll detected |
| `autoReposition` | `boolean` | `true` | Repositions open popover |
| `adjustableInputNumbers` | `boolean` | `true` | Enables numeric keyboard/wheel adjustments in input controller |
| `components` | `Partial<BerryPickrComponents>` | all `true` | Toggles preview/palette/hue/alpha/input/save/cancel/clear |
| `i18n` | `Partial<BerryPickrI18n>` | built-in labels | Overrides ARIA labels and button text |

<DocsCallout type="info" title="Alpha component with lockAlpha">
If controller `lockAlpha` is true, `components.alpha` is forced off even if enabled in UI options.
</DocsCallout>

## Mode matrix

| Mode | Placement | Open behavior | Typical use |
| --- | --- | --- | --- |
| `popover` | Appended to `container` | Toggle via trigger; can auto-close | Form controls and settings panels |
| `inline` | Inserted after target | Always visible while not disabled | Embedded editors and side panes |

`showAlways` in popover mode behaves similarly to inline visibility: if not disabled, the UI remains open.

## `BerryPickrUIMount` methods

| Method | Returns | Notes |
| --- | --- | --- |
| `show()` | `boolean` | Requests controller open state |
| `hide()` | `boolean` | Hidden only when not force-open (`inline`/`showAlways`) |
| `isOpen()` | `boolean` | Reflects effective open state |
| `getController()` | `BerryPickrController` | Access attached controller |
| `update(next)` | `void` | Live updates options without remounting |
| `focus(part?)` | `boolean` | Focuses `palette`/`hue`/`alpha`/`input` if visible |
| `destroy({ remove? })` | `void` | Destroys listeners/controllers and optionally removes app node |

## `mount.update()` constraints

`mount.update()` **cannot** change:

- `target`
- `container`

Attempting either throws an error. Remount instead:

```ts
mount.destroy({ remove: true });
const nextMount = mountBerryPickrUI(controller, {
  target: '#new-trigger',
  container: '#new-overlay-host',
  mode: 'popover'
});
```

## Component visibility and i18n

```ts
mount.update({
  components: {
    clear: false,
    cancel: false
  },
  i18n: {
    toggle: 'Open color editor',
    dialog: 'Brand color picker dialog'
  }
});
```

## Gotchas

- Missing `target` selector throws during mount creation.
- Popover close behaviors are ignored in inline mode.
- `hide()` returns `false` when UI is force-open by mode/settings.

## Related pages

- [Controller Guide](/controller)
- [Bindings Guide](/bindings)
- [Integrations](/integrations)
- [Accessibility](/accessibility)
