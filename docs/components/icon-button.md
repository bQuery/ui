# Icon Button

Use `bq-icon-button` for compact icon-only actions such as refresh, close, open-menu, favorite, or toolbar controls.

## Basic Usage

```html
<bq-icon-button label="Open filters">
  <span aria-hidden="true">☰</span>
</bq-icon-button>
```

## Title Fallback

If you already need a tooltip-like title, you can use `title` as the accessible-name fallback when `label` is omitted. If both are provided, `label` remains the primary accessible name.

```html
<bq-icon-button title="Refresh results">
  <span aria-hidden="true">↻</span>
</bq-icon-button>
```

## Loading State

```html
<bq-icon-button label="Sync data" loading>
  <span aria-hidden="true">⟳</span>
</bq-icon-button>
```

Loading icon buttons expose `aria-busy="true"` and announce a localized loading message to assistive technologies.

## As a Link

```html
<bq-icon-button
  href="https://example.com/settings"
  label="Open settings"
  title="Settings"
>
  <span aria-hidden="true">⚙</span>
</bq-icon-button>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `primary \| secondary \| outline \| ghost \| danger` | `ghost` | Visual style |
| `size` | `sm \| md \| lg` | `md` | Button size |
| `disabled` | `boolean` | `false` | Disables interaction |
| `loading` | `boolean` | `false` | Shows spinner and disables interaction |
| `label` | `string` | — | Preferred accessible label for the control |
| `title` | `string` | — | Optional tooltip and accessible-name fallback |
| `href` | `string` | — | Renders as `<a>` when set |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `bq-click` | `{ originalEvent: MouseEvent }` | Fired on click when not disabled/loading |

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | The icon content |

## CSS Parts

| Part | Description |
|------|-------------|
| `button` | The inner `<button>` or `<a>` element |

## Accessibility Notes

- Always provide `label` unless `title` already conveys the full action name.
- If neither `label` nor `title` is provided, the component falls back to a localized generic label so the control never becomes unnamed.
- Mark decorative icon content with `aria-hidden="true"` so screen readers announce only the control label.
- Prefer `bq-button` when the action should show visible text.
