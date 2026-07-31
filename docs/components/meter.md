# Meter

`bq-meter` shows a scalar measurement inside a known range — disk usage,
password strength, a budget, a rating average.

## Meter or progress?

They look alike and mean different things. A **progress bar** runs from nothing
to done and only ever moves forward; it answers *how far along is this task*. A
**meter** shows a level that can sit anywhere and move in either direction; it
answers *is this reading healthy*. Use `bq-progress` for the former.

## Basic Usage

```html
<bq-meter label="Storage used" value="64" show-value></bq-meter>
```

## Bands

`low`, `high` and `optimum` follow the semantics of the native `<meter>`
element. The bands split the range in three; `optimum` says which part is
good, and the bar colours itself accordingly.

Lower is better — disk usage:

```html
<bq-meter label="Disk" value="94" low="40" high="80" optimum="0" show-value></bq-meter>
```

Higher is better — battery:

```html
<bq-meter label="Battery" value="12" low="20" high="80" optimum="100" show-value></bq-meter>
```

Without any bands the meter stays in the accent colour, which is the right
default when the value has no good or bad end.

## Custom value text

```html
<bq-meter label="Storage" value="72" value-text="72 GB of 100 GB" show-value></bq-meter>
```

`value-text` is what both the label and `aria-valuetext` use, so the spoken and
the visible reading stay in step.

## Properties

| Property     | Type      | Default | Description                                |
| ------------ | --------- | ------- | ------------------------------------------ |
| `value`      | `number`  | `0`     | Current reading; clamped into the range    |
| `min`        | `number`  | `0`     | Range start                                |
| `max`        | `number`  | `100`   | Range end                                  |
| `low`        | `number`  | —       | Upper bound of the low band                |
| `high`       | `number`  | —       | Lower bound of the high band               |
| `optimum`    | `number`  | —       | Where in the range is best                 |
| `label`      | `string`  | `''`    | Visible label and accessible name          |
| `value-text` | `string`  | `''`    | Overrides the rendered and spoken reading  |
| `show-value` | `boolean` | `false` | Show the reading next to the label         |
| `size`       | `string`  | `'md'`  | `sm` \| `md` \| `lg`                       |

## CSS Parts

| Part    | Description        |
| ------- | ------------------ |
| `field` | The outer wrapper  |
| `label` | The label element  |
| `value` | The reading        |
| `track` | The bar background |
| `bar`   | The filled portion |

## Accessibility

- The track carries `role="meter"` with `aria-valuenow`, `aria-valuemin`,
  `aria-valuemax` and `aria-valuetext`.
- Colour is never the only signal: pair a graded meter with `show-value` or a
  `value-text` that states the reading.
- Under Windows high-contrast the bar falls back to the system highlight
  colour and the track gains a border.
