# Theming

`@bquery/ui` uses CSS custom properties (variables) for all design tokens. You can override any token at any scope.

## Global Token Override

```css
:root {
  --bq-color-primary-600: #7c3aed;   /* purple primary */
  --bq-color-primary-700: #6d28d9;
  --bq-radius-lg: 0.75rem;           /* larger border radius */
  --bq-font-family-sans: 'Roboto', sans-serif;
}
```

## Using `applyThemeTokens`

```typescript
import { applyThemeTokens } from '@bquery/ui/theme';

applyThemeTokens({
  '--bq-color-primary-600': '#7c3aed',
  '--bq-color-primary-700': '#6d28d9',
});
```

## Available Tokens

### Colors
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
| `--bq-font-size-md` | `1rem` |
| `--bq-font-weight-semibold` | `600` |

### Spacing & Radius
| Token | Default |
|-------|---------|
| `--bq-space-4` | `1rem` |
| `--bq-radius-lg` | `0.5rem` |
| `--bq-radius-full` | `9999px` |

### Motion
| Token | Default |
|-------|---------|
| `--bq-duration-fast` | `150ms` |
| `--bq-easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
