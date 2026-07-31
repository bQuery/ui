# Theming

`@bquery/ui` uses CSS custom properties for all design tokens. You can override
any token at any scope.

Tokens come in two layers, and knowing which one you are reaching for saves a
lot of guesswork:

- **Primitives** — the raw palette and scales: `--bq-color-primary-600`,
  `--bq-space-4`, `--bq-radius-lg`. These are the same in light and dark.
- **Semantics** — what a primitive is being used *for*: `--bq-bg-base`,
  `--bq-text-muted`, `--bq-surface-overlay`, `--bq-focus-ring`. These change
  with the colour scheme.

Retheme with the primitives; reach for the semantics when you want a surface or
a piece of text to behave differently from the rest.

## Global token override

```css
:root {
  --bq-color-primary-600: #7c3aed;   /* purple primary */
  --bq-color-primary-700: #6d28d9;
  --bq-radius-lg: 0.75rem;           /* larger border radius */
  --bq-font-family-sans: 'Roboto', sans-serif;
}
```

## Scoped override

Custom properties inherit through shadow boundaries, so scoping a theme to part
of the page needs nothing special:

```css
.checkout {
  --bq-color-primary-600: #059669;
}
```

## Per-component override

Every component also honours tokens set on the element itself:

```html
<bq-button style="--bq-radius-lg: 9999px">Pill</bq-button>
```

## Using `applyThemeTokens`

```typescript
import { applyThemeTokens } from '@bquery/ui/theme';

applyThemeTokens({
  '--bq-color-primary-600': '#7c3aed',
  '--bq-color-primary-700': '#6d28d9',
});

// Or scoped to one element:
applyThemeTokens({ '--bq-radius-lg': '1rem' }, document.querySelector('.card-grid'));
```

Values set this way land in the element's inline style, so they outrank the
theme in both schemes. To override only one scheme, write a rule against
`[data-theme="dark"]` instead — see [Dark Mode](/guide/dark-mode).

## Semantic tokens

| Token                   | Used for                                              |
| ----------------------- | ----------------------------------------------------- |
| `--bq-bg-base`          | The page-level background a component sits on         |
| `--bq-bg-subtle`        | Quiet fills: table headers, inset panels              |
| `--bq-bg-muted`         | Stronger fills: disabled controls, hovered rows       |
| `--bq-bg-hover`         | Translucent hover wash; tints whatever is beneath it  |
| `--bq-bg-active`        | Translucent pressed wash                              |
| `--bq-bg-selected`      | Selected rows and options                             |
| `--bq-surface-raised`   | Cards — above the page                                |
| `--bq-surface-overlay`  | Menus, popovers, dialogs, toasts — above everything   |
| `--bq-surface-sunken`   | Wells and recessed areas                              |
| `--bq-text-base`        | Body text                                             |
| `--bq-text-muted`       | Secondary text, hints                                 |
| `--bq-text-subtle`      | Placeholders, disabled text                           |
| `--bq-text-inverse`     | Text on `--bq-bg-inverse`                             |
| `--bq-border-base`      | Dividers and quiet outlines                           |
| `--bq-border-emphasis`  | Control borders                                       |
| `--bq-border-strong`    | Borders that need to read at a glance                 |
| `--bq-border-focus`     | The border colour a focused control takes             |
| `--bq-focus-ring`       | The focus ring `box-shadow`                           |
| `--bq-overlay-backdrop` | Dialog and drawer scrims                              |

The surfaces are a stack — sunken, base, raised, overlay. In light mode they
are told apart by shadow; in dark mode shadows are invisible, so each level is
a slightly different lightness. That is why an overlay has its own token rather
than reusing `--bq-bg-base`.

## Primitive tokens

### Colors

Each of `primary`, `secondary`, `danger`, `success`, `warning` and `info` ships
a full 50–900 ramp.

| Token | Default |
|-------|---------|
| `--bq-color-primary-600` | `#2563eb` |
| `--bq-color-danger-600` | `#dc2626` |
| `--bq-color-success-600` | `#16a34a` |
| `--bq-color-warning-600` | `#d97706` |

### Typography

| Token | Default |
|-------|---------|
| `--bq-font-family-sans` | `'Inter', system-ui, ...` |
| `--bq-font-family-mono` | `'JetBrains Mono', ...` |
| `--bq-font-size-md` | `1rem` |
| `--bq-font-weight-semibold` | `600` |
| `--bq-line-height-normal` | `1.5` |
| `--bq-letter-spacing-wide` | `0.04em` |

### Spacing & radius

| Token | Default |
|-------|---------|
| `--bq-space-4` | `1rem` |
| `--bq-radius-lg` | `0.5rem` |
| `--bq-radius-full` | `9999px` |

### Control metrics

One height scale for everything that sits on a form row, so a button, an input
and a select line up on the same baseline.

| Token | Default |
|-------|---------|
| `--bq-control-height-sm` | `2rem` |
| `--bq-control-height-md` | `2.5rem` |
| `--bq-control-height-lg` | `3rem` |
| `--bq-control-padding-md` | `0.875rem` |
| `--bq-border-width-control` | `1.5px` |

### Elevation

| Token | Used for |
|-------|----------|
| `--bq-shadow-xs` | Buttons at rest |
| `--bq-shadow-sm` | Cards |
| `--bq-shadow-md` | Raised panels |
| `--bq-shadow-lg` | Menus, popovers, toasts |
| `--bq-shadow-xl` | Dialogs, drawers |

The dark theme replaces these with much stronger values: a shadow tuned for
white paper is invisible on a dark surface.

### Motion

| Token | Default |
|-------|---------|
| `--bq-duration-instant` | `75ms` |
| `--bq-duration-fast` | `150ms` |
| `--bq-duration-normal` | `200ms` |
| `--bq-easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--bq-easing-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` |

Every component honours `prefers-reduced-motion: reduce` by collapsing
durations, so you do not have to opt out per component.
