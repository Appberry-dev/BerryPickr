# Styling Guide

## When to use

Use this page when you want BerryPickr to match your product brand while keeping default UI structure and interactions.

## Quick example

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

## Options/Methods

BerryPickr ships two style assets:

- `berrypickr/styles/base.css`: required structural and interaction styles
- `berrypickr/styles/skin-template.css`: starter token set to copy into app CSS

### `.bp-app` skin token contract

| Token | Default in `base.css` | Purpose |
| --- | --- | --- |
| `--bp-surface` | `#ffffff` | Base panel surface |
| `--bp-text` | `#19213a` | Primary text color |
| `--bp-muted` | `#54607f` | Secondary text and passive controls |
| `--bp-border` | `rgba(19, 33, 58, 0.12)` | Borders and separators |
| `--bp-shadow` | `0 18px 36px rgba(19, 33, 58, 0.2)` | Popover shadow depth |
| `--bp-accent` | `#245fd1` | Active format/save emphasis |
| `--bp-danger` | `#ac2f44` | Cancel/clear emphasis |
| `--bp-focus` | `rgba(36, 95, 209, 0.35)` | Keyboard focus ring |
| `--bp-radius` | `16px` | Component corner radius |
| `--bp-swatch-color` | `#000` | Internal swatch rendering variable |

## Practical skin recipes

## 1) Neutral dashboard skin

```css
.bp-app {
  --bp-surface: #ffffff;
  --bp-text: #1b2438;
  --bp-muted: #5d6882;
  --bp-border: rgba(35, 48, 83, 0.14);
  --bp-shadow: 0 16px 34px rgba(24, 35, 64, 0.18);
  --bp-accent: #2b69df;
  --bp-danger: #bb3f5a;
  --bp-focus: rgba(43, 105, 223, 0.36);
}
```

## 2) Warm editorial skin

```css
.bp-app {
  --bp-surface: #fff9f4;
  --bp-text: #342125;
  --bp-muted: #7f6163;
  --bp-border: rgba(142, 86, 71, 0.24);
  --bp-shadow: 0 20px 38px rgba(135, 83, 70, 0.2);
  --bp-accent: #c65a2d;
  --bp-danger: #c03e5a;
  --bp-focus: rgba(198, 90, 45, 0.36);
  --bp-radius: 14px;
}
```

## 3) Slate contrast skin

```css
.bp-app {
  --bp-surface: #111827;
  --bp-text: #eef2ff;
  --bp-muted: #b8c2e5;
  --bp-border: rgba(220, 228, 255, 0.22);
  --bp-shadow: 0 24px 46px rgba(3, 8, 22, 0.55);
  --bp-accent: #79a9ff;
  --bp-danger: #f57b8e;
  --bp-focus: rgba(121, 169, 255, 0.45);
}
```

## Gotchas

- Only overriding tokens is safest; modifying structural selectors can break positioning and interaction states.
- Keep `--bp-focus` high-contrast against the surface for keyboard users.
- If you apply dark skins, validate slider and text contrast in your target contexts.

## Related pages

- [UI Mount Guide](/ui-mount)
- [Accessibility](/accessibility)
- [Recipes](/recipes)
- [API Index](/api)
