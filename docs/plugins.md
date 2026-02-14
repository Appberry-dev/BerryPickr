# Plugins Guide

## When to use

Use plugins when you need reusable side effects around color changes or commits (analytics, telemetry, policy checks, integrations).

## Quick example

```ts
import { createBerryPickrController, type BerryPickrPlugin } from 'berrypickr';

const auditPlugin: BerryPickrPlugin = {
  name: 'audit-plugin',
  onCommit(event) {
    console.log('committed', event.transactionId, event.value?.to('hexa'));
  }
};

const controller = createBerryPickrController({
  plugins: [auditPlugin],
  pluginErrorPolicy: 'emit'
});
```

## Live Plugin Demos

<DocsCallout type="tip" title="Try plugin behavior end-to-end">
Use these embedded demos to validate setup/teardown flow, change vs commit telemetry, and `pluginErrorPolicy` behavior without leaving the docs.
</DocsCallout>

<PluginLiveDemos />

Each demo validates one plugin responsibility:

- Lifecycle demo: confirms `setup` and teardown execution and cleanup timing.
- Telemetry demo: shows `onChange` and `onCommit` payload differences.
- Error policy demo: compares `pluginError` event emission (`emit`) against thrown exceptions (`throw`).

## Options/Methods

## Plugin contract

```ts
interface BerryPickrPlugin {
  name: string;
  setup?: (context: BerryPickrPluginContext) => void | (() => void);
  onChange?: (event: BerryPickrChangeEvent, state: BerryPickrStateSnapshot) => void;
  onCommit?: (event: BerryPickrCommitEvent, state: BerryPickrStateSnapshot) => void;
}
```

### Lifecycle phases

- `setup`: called once when controller is created
- `change`: called for every `change` event
- `commit`: called for every `commit` event
- `teardown`: called on `controller.destroy()` for setup cleanup

## Error handling (`pluginErrorPolicy`)

| Policy | Behavior |
| --- | --- |
| `'emit'` | Catches plugin callback failures and emits `pluginError` |
| `'throw'` | Rethrows plugin callback failures to caller |

```ts
controller.on('pluginError', ({ plugin, phase, error }) => {
  console.error(`[${plugin}] failed during ${phase}`, error);
});
```

## Robust plugin sample

```ts
import type {
  BerryPickrPlugin,
  BerryPickrChangeEvent,
  BerryPickrCommitEvent,
  BerryPickrStateSnapshot
} from 'berrypickr';

interface TelemetrySink {
  track(name: string, payload: Record<string, unknown>): void;
}

export const createTelemetryPlugin = (sink: TelemetrySink): BerryPickrPlugin => {
  const trackChange = (event: BerryPickrChangeEvent, state: BerryPickrStateSnapshot): void => {
    sink.track('berrypickr.change', {
      instanceId: event.instanceId,
      transactionId: event.transactionId,
      source: event.source,
      context: event.context,
      format: state.format,
      value: event.value?.to('hexa') ?? null
    });
  };

  const trackCommit = (event: BerryPickrCommitEvent): void => {
    sink.track('berrypickr.commit', {
      instanceId: event.instanceId,
      transactionId: event.transactionId,
      context: event.context,
      value: event.value?.to('hexa') ?? null
    });
  };

  return {
    name: 'telemetry',
    setup() {
      sink.track('berrypickr.setup', { at: Date.now() });
      return () => sink.track('berrypickr.teardown', { at: Date.now() });
    },
    onChange: trackChange,
    onCommit: trackCommit
  };
};
```

## Gotchas

- Keep `onChange` fast; it is high frequency.
- With `'throw'`, plugin exceptions can break user interaction flows.
- Treat teardown as required cleanup for listeners/timers opened in `setup`.

## Related pages

- [Controller Guide](/controller)
- [Concepts](/concepts)
- [Recipes](/recipes)
- [Troubleshooting](/troubleshooting)
