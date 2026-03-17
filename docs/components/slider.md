# Slider

The `bq-slider` component is a range slider input with optional visible value display.

## Basic Usage

```html
<bq-slider label="Volume" value="50"></bq-slider>
```

## Show Value

```html
<bq-slider label="Brightness" value="75" show-value></bq-slider>
```

## Custom Range

```html
<bq-slider label="Price" min="0" max="1000" step="50" value="250"></bq-slider>
```

## Disabled

```html
<bq-slider label="Locked" value="30" disabled></bq-slider>
```

## Properties

| Property     | Type      | Default | Description                        |
| ------------ | --------- | ------- | ---------------------------------- |
| `value`      | `number`  | `50`    | Current value                      |
| `min`        | `number`  | `0`     | Minimum value                      |
| `max`        | `number`  | `100`   | Maximum value                      |
| `step`       | `number`  | `1`     | Step increment                     |
| `label`      | `string`  | —       | Accessible label                   |
| `disabled`   | `boolean` | `false` | Disables the slider                |
| `show-value` | `boolean` | `false` | Displays the current value as text |

## Events

| Event       | Detail              | Description                     |
| ----------- | ------------------- | ------------------------------- |
| `bq-input`  | `{ value: number }` | Fired on each drag or keystroke |
| `bq-change` | `{ value: number }` | Fired on value commit           |

## CSS Parts

| Part      | Description            |
| --------- | ---------------------- |
| `wrapper` | The outer wrapper      |
| `label`   | The label text         |
| `value`   | The value display text |
| `input`   | The native range input |

## Accessibility

- `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` reflect the min, max, and current value.
- The live value display uses `aria-live="polite"` for screen reader announcements.

## Form Participation

The component creates a hidden input proxy for native `<form>` submission.
