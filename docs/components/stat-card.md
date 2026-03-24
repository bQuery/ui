# Stat Card

The `bq-stat-card` component is a compact dashboard primitive for KPI summaries, analytics overviews, and settings surfaces that need a quick metric + context pairing.

It is intentionally lightweight: use it when you need a polished, theme-aware metric card without introducing a full charting or dashboard framework.

## Import

```ts
import '@bquery/ui/components/stat-card';
```

## Basic Usage

```html
<bq-stat-card
  label="Monthly revenue"
  value="$128k"
  change="+12.4%"
  hint="Compared with the previous 30 days."
  trend="up"
></bq-stat-card>
```

## With Icon Slot

```html
<bq-stat-card
  label="Incident resolution"
  value="94%"
  change="-1.8%"
  hint="SLA within the current quarter."
  trend="down"
>
  <span slot="icon" aria-hidden="true">⚡</span>
</bq-stat-card>
```

## Sizes

Use `size="sm"` when the card needs to fit tighter dashboards, narrow mobile layouts, or dense admin surfaces.

```html
<bq-stat-card label="Open tickets" value="18" size="sm"></bq-stat-card>
<bq-stat-card label="Open tickets" value="18" size="md"></bq-stat-card>
```

## Loading State

When data is still loading, the component can render an internal skeleton layout while preserving accessible status text.

```html
<bq-stat-card
  label="Active users"
  loading
></bq-stat-card>
```

## Additional Supporting Content

The default slot can render extra supporting content such as inline badges, notes, or actions below the hint text.

```html
<bq-stat-card
  label="Deployments"
  value="42"
  change="+6"
  trend="up"
  hint="Production deployments this week."
>
  <bq-badge variant="success">Healthy</bq-badge>
</bq-stat-card>
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `''` | Short metric label shown at the top of the card. |
| `value` | `string` | `''` | Primary value, such as a count, percentage, or formatted currency amount. |
| `change` | `string` | `''` | Secondary comparison value, such as `+12%` or `-4`. |
| `hint` | `string` | `''` | Supporting explanatory text shown below the value row. |
| `trend` | `up \| down \| neutral` | `neutral` | Visual tone for the `change` pill. Invalid values fall back to `neutral`. |
| `size` | `sm \| md` | `md` | Controls spacing and value sizing. Invalid values fall back to `md`. |
| `loading` | `boolean` | `false` | Displays an internal loading skeleton and sets `aria-busy="true"`. |

## Slots

| Slot | Description |
| --- | --- |
| *(default)* | Additional supporting content rendered below the hint text. |
| `icon` | Optional icon, avatar, or badge rendered in the top-right corner. |

## CSS Parts

| Part | Description |
| --- | --- |
| `card` | Outer metric surface |
| `header` | Top row containing the label and icon slot |
| `label` | Metric label |
| `value` | Primary metric value |
| `change` | Trend/change pill |
| `hint` | Supporting description |
| `loading` | Internal loading layout wrapper |

## Accessibility Notes

- The outer surface uses semantic `<article>` markup.
- `label` is connected to the card with `aria-labelledby`, and `hint` is connected with `aria-describedby`.
- `loading` sets `aria-busy="true"` and exposes a localized screen-reader status message.
- Keep the `change` text meaningful on its own. For example, prefer `+12.4%` or `12 fewer incidents` over a color-only status.

## Localization Notes

- Keep `label`, `value`, `change`, and `hint` fully localizable in the host application.
- The built-in loading announcement uses the shared library locale, so custom locales continue to work without extra wiring.
- Use locale-aware formatting for numbers, currencies, and percentages before passing the resulting strings to the component.

## Theming Notes

- The component uses shared tokens for background, border, text, success/danger emphasis, spacing, radius, and shadow.
- Override host-level tokens for brand alignment, or target internal elements with `::part(card)`, `::part(value)`, and `::part(change)` for more specific customization.
