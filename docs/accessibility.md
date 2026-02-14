# Accessibility

## When to use

Use this page before release and during regression testing to keep keyboard and assistive technology behavior reliable.

## Quick example

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

## Options/Methods

## Keyboard interaction matrix

| Element | Expected interaction |
| --- | --- |
| Trigger (`target`) | Enter/Space opens in popover mode |
| Palette | Arrow keys adjust saturation/value |
| Hue slider | Arrow keys adjust hue |
| Alpha slider | Arrow keys adjust alpha (unless lockAlpha) |
| Input | Direct text entry; optional adjustable numeric controls |
| Save/Cancel/Clear buttons | Enter/Space activate actions |
| Popover dialog | Escape closes when `closeOnEscape` is true |

## ARIA label map

These are set via `i18n` options and defaults from mount runtime:

| `i18n` key | Applied to |
| --- | --- |
| `dialog` | Picker app container `aria-label` |
| `toggle` | Trigger `aria-label` |
| `palette` | Palette slider `aria-label` |
| `hue` | Hue slider `aria-label` |
| `alpha` | Alpha slider `aria-label` |
| `swatch` | Swatch container/controls label |
| `input` | Color input `aria-label` |
| `save` / `cancel` / `clear` | Button text labels |

## Localization guidance

- Replace all `i18n` fields when your UI language is not English.
- Keep labels action-oriented and short.
- Ensure translated strings still distinguish save/cancel/clear semantics.

## Automated checks in this repository

- Playwright keyboard interaction tests
- Playwright ARIA and escape-close tests
- Axe (`@axe-core/playwright`) scans for serious/critical issues

Run:

```bash
pnpm test:e2e
```

## Pre-release checklist

- Keyboard-only navigation reaches all visible controls
- Focus ring is visible in your skin/theme
- Escape close behavior is validated in popover mode
- Color contrast of text/buttons meets product accessibility targets
- i18n labels match product language and terminology

## Gotchas

- Hiding components (`components.* = false`) changes tab sequence; retest keyboard order.
- Over-aggressive custom CSS can remove visible focus indicators.
- Disabling close-on-escape can trap users in modal-like flows unless another explicit close path is obvious.

## Related pages

- [UI Mount Guide](/ui-mount)
- [Styling Guide](/styling)
- [Troubleshooting](/troubleshooting)
- [FAQ](/faq)
