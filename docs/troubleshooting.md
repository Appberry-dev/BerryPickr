# Troubleshooting

## When to use

Use this page when BerryPickr behaves unexpectedly and you need fast diagnosis from symptom to root cause.

## Quick example

```ts
controller.on('pluginError', ({ plugin, phase, error, transactionId }) => {
  console.error(`[${plugin}] ${phase}`, transactionId, error);
});
```

## Options/Methods

## Symptom -> Cause -> Fix

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Picker never opens | Target selector does not resolve, or controller is disabled | Verify `target` element exists and call `controller.setDisabled(false)` |
| `setValue` returns `false` | Color string cannot be parsed | Validate format before calling; ensure supported syntax |
| `mount.update` throws about target/container | Attempted to change immutable mount options | Destroy mount and remount with new `target`/`container` |
| Alpha controls missing | `lockAlpha` is true | Set `lockAlpha: false` if alpha editing is required |
| Recent colors not persisting | No storage adapter or storage errors | Provide `recentColors.storage` and verify load/save logic |
| Plugin failures stop UI flow | `pluginErrorPolicy` is `'throw'` | Switch to `'emit'` for resilient runtime behavior |
| Styles not applied | Missing base stylesheet import | Import `@appberry/berrypickr/styles/base.css` once in app bundle |
| Outside click does not close | Non-popover mode or `closeOnOutsideClick: false` | Use popover mode and enable outside close |
| Escape key does not close | `closeOnEscape: false` or wrong document context | Enable option and ensure listeners are attached to correct owner document |

## Diagnostic checklist

1. Confirm resolved DOM context (`target`, `container`, iframe/shadow root ownership).
2. Inspect `controller.getState()` for `disabled`, `open`, `context`, and `formats`.
3. Verify event flow with `change`, `commit`, `openChange`, and `pluginError` listeners.
4. Validate integration lifecycle cleanup (`mount.destroy`, `controller.destroy`).

## Quick debug helper

```ts
const unsubscribe = controller.subscribe((state) => {
  console.log({
    open: state.open,
    disabled: state.disabled,
    context: state.context,
    value: state.value?.to('hexa') ?? null,
    format: state.format,
    history: state.history
  });
});

// later
unsubscribe();
```

## Gotchas

- In iframes, `target` and `container` must come from iframe document to keep close/positioning behavior correct.
- In shadow DOM, keep target and container in same shadow root.
- Destroying controller before mount can leave detached UI artifacts if `remove` is false.

## Related pages

- [Integrations](/integrations)
- [Controller Guide](/controller)
- [UI Mount Guide](/ui-mount)
- [FAQ](/faq)
