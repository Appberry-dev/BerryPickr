# BerryPickr

<div class="landing-section">
  <DocsHero />
</div>

## Choose Your Path

<div class="landing-section">
  <DocsFeatureCards />
</div>

## When to use

Use BerryPickr when you need one consistent color state engine across:

- App builders and dashboard products
- Design system tooling with custom UI skinning
- Framework integrations (React, Vue, Svelte)
- Accessibility-conscious color workflows with commit control

## Quick example

```ts
import { createBerryPickrController, mountBerryPickrUI, createCssVarBinding } from 'berrypickr';
import 'berrypickr/styles/base.css';

const controller = createBerryPickrController({
  defaultValue: '#486dff',
  formats: ['hex', 'rgba', 'hsla'],
  history: { limit: 120 }
});

const mount = mountBerryPickrUI(controller, {
  target: '#brand-color-trigger',
  mode: 'popover'
});

createCssVarBinding({
  controller,
  target: ':root',
  variable: '--brand-color',
  format: 'hexa',
  event: 'commit'
});

controller.on('commit', ({ transactionId, value }) => {
  console.log(transactionId, value?.to('hexa'));
});

mount.show();
```

## Live Playground

<DocsCallout type="tip" title="How to explore">
Edit the JSON options, recreate the picker, and watch how `change`, `commit`, `openChange`, and `pluginError` events flow in real time.
</DocsCallout>

<BerryPlayground />

## Plugin Live Demos

<DocsCallout type="info" title="Need plugin-specific examples?">
Open the [Plugins Guide live demos](/plugins#live-plugin-demos) to interact with focused plugin scenarios.
</DocsCallout>

The plugin demos cover:

- lifecycle setup and teardown behavior
- telemetry differences between `onChange` and `onCommit`
- failure handling with `pluginErrorPolicy: 'emit'` vs `'throw'`

## What BerryPickr gives you

- A headless `controller` with explicit commit and history semantics
- Optional UI `mount` that can be swapped or themed without replacing state logic
- Typed events with `instanceId`, `transactionId`, and timestamps for tracing
- Binding helpers for CSS custom properties and inline style outputs
- First-party framework adapters for React, Vue, and Svelte
- Plugin hooks with controlled error behavior (`emit` or `throw`)
- Utility exports for contrast analysis and controller orchestration

## Related pages

- [Quickstart](/quickstart)
- [Concepts](/concepts)
- [Controller Guide](/controller)
- [UI Mount Guide](/ui-mount)
- [API Index](/api)
