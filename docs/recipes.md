# Recipes

## When to use

Use these copy-paste patterns to implement common production workflows without designing the controller flow from scratch.

## Quick example

```ts
import { createBerryPickrController } from 'berrypickr';

const controller = createBerryPickrController({ defaultValue: '#486dff' });
```

## Options/Methods

## 1) Commit-only downstream updates

Use this when live editing should not trigger expensive persistence.

```ts
import { createCssVarBinding } from 'berrypickr';

createCssVarBinding({
  controller,
  target: ':root',
  variable: '--brand-color-preview',
  format: 'hexa',
  event: 'change'
});

createCssVarBinding({
  controller,
  target: ':root',
  variable: '--brand-color',
  format: 'hexa',
  event: 'commit'
});

controller.on('commit', ({ transactionId, value }) => {
  persistTheme({ transactionId, color: value?.to('hexa') ?? null });
});
```

## 2) Multi-context theme tokens

Use this to manage default and interactive state colors.

```ts
controller.selectContext('default');
controller.setValue('#2f6ae0');
controller.commit();

controller.selectContext('hover');
controller.setValue('#2452b1');
controller.commit();

controller.selectContext('active');
controller.setValue('#1f438d');
controller.commit();

createCssVarBinding({ controller, target: ':root', variable: '--button-default', context: 'default', format: 'hex' });
createCssVarBinding({ controller, target: ':root', variable: '--button-hover', context: 'hover', format: 'hex' });
createCssVarBinding({ controller, target: ':root', variable: '--button-active', context: 'active', format: 'hex' });
```

## 3) Presets + recent colors workflow

```ts
const controller = createBerryPickrController({
  presets: {
    brand: ['#1f5eff', '#7b54f6', '#ea5a8f'],
    semantic: ['#2f9e6a', '#d88f1f', '#c4475f']
  },
  recentColors: {
    limit: 16,
    storageKey: 'my-app:recent-colors',
    storage: {
      load(key) {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as string[]) : [];
      },
      save(key, colors) {
        localStorage.setItem(key, JSON.stringify(colors));
      }
    }
  }
});

controller.applyPreset('brand', 0);
controller.commit();
```

## 4) Plugin telemetry hook

```ts
const telemetryPlugin = {
  name: 'telemetry',
  onChange(event, state) {
    track('picker_change', {
      source: event.source,
      context: event.context,
      format: state.format,
      transactionId: event.transactionId
    });
  },
  onCommit(event) {
    track('picker_commit', {
      value: event.value?.to('hexa') ?? null,
      transactionId: event.transactionId
    });
  }
};

const controller = createBerryPickrController({
  defaultValue: '#486dff',
  plugins: [telemetryPlugin],
  pluginErrorPolicy: 'emit'
});
```

## Gotchas

- `recent` updates on `commit`; preview-only edits do not affect recents.
- `applyPreset` returns `false` for missing category/index.
- If you depend on transaction ordering, always log `transactionId` not timestamps alone.

## Related pages

- [Controller Guide](/controller)
- [Bindings Guide](/bindings)
- [Plugins Guide](/plugins)
- [API Index](/api)
