# BerryPickr

BerryPickr is a headless-first color picker plugin with an optional default UI mount.
It gives you one typed color state engine (`controller`) that you can use with:

- the built-in UI mount (`mountBerryPickrUI`)
- your own custom UI
- plugin hooks for side effects (analytics, telemetry, policy checks)
- framework adapters for React, Vue, and Svelte

## Install

```bash
pnpm add @appberry/berrypickr
```

## Why BerryPickr

- Headless controller API with explicit commit flow (`setValue` vs `commit`)
- Built-in undo/redo and configurable history
- Context-aware values: `default`, `hover`, `active`, `focus`, `disabled`
- Plugin lifecycle hooks: `setup`, `onChange`, `onCommit`, teardown
- Safe plugin failure control with `pluginErrorPolicy: 'emit' | 'throw'`
- Optional UI mount with popover mode and runtime updates
- Binding helpers for CSS variables and inline styles
- WCAG contrast helpers (`getContrastRatio`, `analyzeContrast`)
- Official adapter entry points: `@appberry/berrypickr/react`, `@appberry/berrypickr/vue`, `@appberry/berrypickr/svelte`

## Quick Start

```ts
import {
  createBerryPickrController,
  mountBerryPickrUI,
  createCssVarBinding,
  type BerryPickrPlugin
} from '@appberry/berrypickr';
import '@appberry/berrypickr/styles/base.css';

const telemetryPlugin: BerryPickrPlugin = {
  name: 'telemetry',
  onCommit(event) {
    console.log('commit', event.transactionId, event.value?.to('hexa'));
  }
};

const controller = createBerryPickrController({
  defaultValue: '#486DFF',
  formats: ['hex', 'rgba', 'hsla'],
  history: { limit: 200 },
  plugins: [telemetryPlugin],
  pluginErrorPolicy: 'emit'
});

const mount = mountBerryPickrUI(controller, {
  target: '#color-target',
  mode: 'popover',
  closeOnEscape: true
});

createCssVarBinding({
  controller,
  target: ':root',
  variable: '--brand-color',
  format: 'hexa',
  event: 'commit'
});

controller.on('change', ({ value, source, transactionId }) => {
  console.log(source, transactionId, value?.to('rgba'));
});

// Update UI options without remounting.
mount.update({
  closeOnOutsideClick: false
});
```

Minimum lifecycle you should wire in production:

- `mount.destroy({ remove: true })` when host view unmounts
- `controller.destroy()` to release plugin teardown/listeners

## Styling

BerryPickr ships with two CSS assets:

- `@appberry/berrypickr/styles/base.css` (required structure + interactions)
- `@appberry/berrypickr/styles/skin-template.css` (starter theme tokens)

Use CSS variables on `.bp-app` to skin without rewriting component structure:

```css
.bp-app {
  --bp-surface: #f6f8ff;
  --bp-text: #1a2445;
  --bp-muted: #5d6888;
  --bp-border: rgba(30, 52, 107, 0.16);
  --bp-shadow: 0 22px 40px rgba(40, 66, 143, 0.25);
  --bp-accent: #2f67d1;
  --bp-danger: #be3f57;
  --bp-focus: rgba(47, 103, 209, 0.38);
  --bp-radius: 16px;
}
```

Recommended practice:

- Override tokens first; avoid structural CSS overrides unless necessary
- Keep focus ring token (`--bp-focus`) high-contrast in every theme
- Re-run keyboard and contrast checks after theme changes

## Accessibility

BerryPickr includes keyboard-first interactions and ARIA labeling hooks:

- Escape-to-close in popover mode (`closeOnEscape`)
- Keyboard interaction for palette and sliders
- Localizable `i18n` labels for dialog, toggle, controls, and actions
- E2E coverage in this repo (Playwright + axe)

```ts
mountBerryPickrUI(controller, {
  target: '#color-trigger',
  closeOnEscape: true,
  i18n: {
    dialog: 'Brand color dialog',
    toggle: 'Open brand color dialog',
    palette: 'Color palette',
    hue: 'Hue slider',
    alpha: 'Opacity slider'
  }
});
```

Accessibility checklist before release:

- Verify keyboard-only access to all visible controls
- Ensure visible focus states in your final skin
- Confirm translated `i18n` labels match product terminology
- Validate contrast for text/button labels in your theme

## Documentation

- Handbook index: [`docs/index.md`](docs/index.md)
- Quickstart: [`docs/quickstart.md`](docs/quickstart.md)
- Styling guide: [`docs/styling.md`](docs/styling.md)
- Accessibility guide: [`docs/accessibility.md`](docs/accessibility.md)
- Plugin guide + live demos: [`docs/plugins.md`](docs/plugins.md)
