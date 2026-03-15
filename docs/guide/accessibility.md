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

## ARIA Live Regions

Toasts use `role="alert"` / `role="status"` and will be announced by screen readers automatically.

You can also use the `announce()` utility for custom announcements:

```typescript
import { announce } from '@bquery/ui/utils';

announce('File uploaded successfully');
announce('Error: File too large', 'assertive');
```

## Keyboard Patterns

| Component | Keys |
|-----------|------|
| Button | `Enter`, `Space` |
| Dialog | `Escape` to close, `Tab` traps focus |
| Tabs | `Arrow Left/Right`, `Home`, `End` |
| Accordion | `Enter`, `Space` to toggle |
| Select | Native `<select>` keyboard |
| Slider | `Arrow` keys, `Home`, `End`, `Page Up/Down` |
