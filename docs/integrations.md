# Framework and Runtime Integrations

## When to use

Use this page when embedding BerryPickr in React, Vue, Svelte, iframes, or shadow DOM hosts.

## Quick example

```ts
import { createBerryPickrController, mountBerryPickrUI } from 'berrypickr';

const controller = createBerryPickrController({ defaultValue: '#486dff' });
mountBerryPickrUI(controller, { target: '#color-target', mode: 'popover' });
```

## Options/Methods

## React

### Uncontrolled controller (recommended default)

```tsx
import { useRef } from 'react';
import { useBerryPickrController, useMountedBerryPickrUI } from 'berrypickr/react';

export function BrandColorField() {
  const targetRef = useRef<HTMLButtonElement | null>(null);
  const { controller, state } = useBerryPickrController({
    controllerOptions: {
      defaultValue: '#486dff'
    }
  });

  useMountedBerryPickrUI(controller, targetRef, {
    uiOptions: { mode: 'popover' }
  });

  return <button ref={targetRef}>{state.value?.to('hex') ?? 'Pick color'}</button>;
}
```

### Controlled value pattern

```tsx
const { controller } = useBerryPickrController({
  value: externalColor,
  onChange: ({ value }) => {
    setExternalColor(value?.to('hexa') ?? null);
  }
});
```

## Vue

### Uncontrolled pattern

```ts
import { ref } from 'vue';
import { useVueBerryPickrController, useMountedVueBerryPickrUI } from 'berrypickr/vue';

const target = ref<HTMLElement | null>(null);
const { controller, state } = useVueBerryPickrController({ defaultValue: '#486dff' });

useMountedVueBerryPickrUI(controller, target, {
  uiOptions: { mode: 'popover' }
});
```

### Controlled options pattern

```ts
const options = ref({ value: '#334455', formats: ['hex', 'rgba'] as const });
const { controller } = useVueBerryPickrController(options);

watchEffect(() => {
  options.value.value = externalThemeColor.value;
});
```

## Svelte

### Store helper

```ts
import { createSvelteBerryPickrStore } from 'berrypickr/svelte';

const { controller, state, destroy } = createSvelteBerryPickrStore({
  defaultValue: '#486dff'
});
```

### Action mount

```svelte
<script lang="ts">
  import { berryPickr, createSvelteBerryPickrStore } from 'berrypickr/svelte';
  const { controller } = createSvelteBerryPickrStore({ defaultValue: '#486dff' });
</script>

<button use:berryPickr={{ controller, uiOptions: { mode: 'popover' } }}>Pick color</button>
```

## Iframe integration

Use a target and container from the iframe document so event boundaries and positioning stay inside that context.

```ts
const iframeDoc = iframe.contentDocument;
const target = iframeDoc?.querySelector<HTMLElement>('#color-button');

if (iframeDoc && target) {
  mountBerryPickrUI(controller, {
    target,
    container: iframeDoc.body,
    closeOnOutsideClick: true,
    closeOnEscape: true
  });
}
```

## Shadow DOM integration

Use target and container from the same shadow root.

```ts
const root = host.shadowRoot;
const target = root?.querySelector<HTMLElement>('#color-button');

if (root && target) {
  mountBerryPickrUI(controller, {
    target,
    container: root.querySelector<HTMLElement>('.overlay-layer') ?? target.parentElement ?? target,
    mode: 'popover'
  });
}
```

## Gotchas

- Framework wrappers do not auto-import base CSS; import `berrypickr/styles/base.css` once.
- In React, remounting target nodes can invalidate existing mount refs.
- For iframe/shadow hosts, mixing documents/roots for `target` and `container` causes close and positioning issues.

## Related pages

- [Quickstart](/quickstart)
- [UI Mount Guide](/ui-mount)
- [Controller Guide](/controller)
- [Troubleshooting](/troubleshooting)
