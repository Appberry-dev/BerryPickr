# FAQ

## When to use

Use this page for quick answers to recurring integration and runtime behavior questions.

## Quick example

```bash
pnpm check
pnpm docs:build
pnpm test:e2e
```

## Options/Methods

## Does BerryPickr support old browsers like IE11?

No. BerryPickr targets evergreen browsers.

## Is the controller usable without the default UI?

Yes. The core API is headless-first. You can skip `mountBerryPickrUI` and drive your own interface using `controller` state and events.

## Is there first-party React/Vue/Svelte support?

Yes:

- `@appberry/berrypickr/react`
- `@appberry/berrypickr/vue`
- `@appberry/berrypickr/svelte`

See [Integrations](/integrations).

## How do I theme the default picker?

Import `@appberry/berrypickr/styles/base.css`, then override `.bp-app` CSS tokens. See [Styling Guide](/styling).

## What is the difference between `change` and `commit`?

- `change` is live editing feedback.
- `commit` is explicit save intent and updates recent colors.

See [Concepts](/concepts).

## Why does `setValue` sometimes return `false`?

The input color string could not be parsed. Invalid non-null color input is rejected.

## Can `mount.update()` change `target` or `container`?

No. Changing either throws; destroy and remount instead.

## How do I keep plugin failures from crashing interactions?

Set `pluginErrorPolicy: 'emit'` and listen for `pluginError` events.

## How do I run the full quality suite?

```bash
pnpm check:ci
```

This runs lint, typecheck, unit tests, and Playwright e2e tests.

## Gotchas

- Missing CSS import is the most common setup issue.
- In embedded contexts (iframe/shadow DOM), ensure `target` and `container` belong to the same document/root.
- If your team persists on `change`, you may write too often; prefer `commit` for durable writes.

## Related pages

- [Quickstart](/quickstart)
- [Troubleshooting](/troubleshooting)
- [Accessibility](/accessibility)
- [API Index](/api)
