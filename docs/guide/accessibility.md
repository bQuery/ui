# Accessibility

All `@bquery/ui` components are built with accessibility as a first-class concern.

## What's Included

- **ARIA roles and attributes** — every component uses the correct semantic roles (`button`, `dialog`, `tab`, `progressbar`, etc.)
- **Keyboard navigation** — all interactive components support keyboard operation per WCAG 2.1 patterns
- **Focus management** — dialogs and drawers trap focus; focus is restored on close
- **Focus visible** — clear `:focus-visible` outlines styled with the `--bq-focus-ring` token
- **Screen reader announcements** — toasts and alerts use `aria-live` regions
- **Disabled states** — proper `aria-disabled` alongside the native `disabled` attribute
- **Error states** — `aria-invalid` and `aria-describedby` link errors to form fields
- **Reduced motion support** — animated components such as accordions, dialogs, drawers, spinners, progress indicators, skeletons, and toasts honor `prefers-reduced-motion`
- **Localized accessible copy** — controls such as password toggles, table states, spinners, empty states, and removable chips use the shared i18n layer for spoken labels and fallback text

## ARIA Live Regions

Toasts use `role="alert"` / `role="status"` and will be announced by screen readers automatically.

You can also use the `announce()` utility for custom announcements:

```typescript
import { announce } from '@bquery/ui/utils';

announce('File uploaded successfully');
announce('Error: File too large', 'assertive');
```

## Keyboard Patterns

| Component | Keys                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| Button    | `Enter`, `Space`                                                             |
| Dialog    | `Escape` to close, `Tab` traps focus                                         |
| Tabs      | `Arrow Left/Right`, `Home`, `End`                                            |
| Accordion | `Enter`, `Space` to toggle                                                   |
| Select    | Native `<select>` keyboard                                                   |
| Slider    | `Arrow` keys, `Home`, `End`, `Page Up/Down`                                  |
| Table     | `Enter` / `Space` on sortable headers                                        |
| Chip      | `Enter` and `Space` on the chip surface; remove button stays a native button |

## Recent 1.2.0 Improvements

- `bq-accordion` now wires `aria-controls` / `aria-labelledby` with stable unique IDs and exposes the panel as a named region.
- `bq-input` and `bq-textarea` character counters announce updates via `aria-live="polite"` and join `aria-describedby` automatically.
- `bq-table` localizes loading and empty-state text while keeping sortable headers keyboard-activatable.
- `bq-spinner` and `bq-empty-state` provide localized default status copy when authors omit custom labels.
