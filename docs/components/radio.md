# Radio

The `bq-radio` component is a radio button form control with label and hint text.

## Basic Usage

```html
<bq-radio name="color" value="red" label="Red"></bq-radio>
<bq-radio name="color" value="blue" label="Blue"></bq-radio>
<bq-radio name="color" value="green" label="Green"></bq-radio>
```

## Checked

```html
<bq-radio name="plan" value="pro" label="Pro plan" checked></bq-radio>
```

## With Hint

```html
<bq-radio
  name="plan"
  value="enterprise"
  label="Enterprise"
  hint="For large teams with advanced needs."
></bq-radio>
```

## Disabled

```html
<bq-radio name="plan" value="legacy" label="Legacy" disabled></bq-radio>
```

## Required

```html
<bq-radio name="plan" value="pro" label="Pro plan" required></bq-radio>
```

## Properties

| Property   | Type      | Default | Description                   |
| ---------- | --------- | ------- | ----------------------------- |
| `label`    | `string`  | —       | Visible label text            |
| `name`     | `string`  | —       | Radio group name              |
| `value`    | `string`  | —       | Radio value                   |
| `checked`  | `boolean` | `false` | Whether the radio is selected |
| `disabled` | `boolean` | `false` | Disables the radio            |
| `required` | `boolean` | `false` | Marks the radio as required   |
| `hint`     | `string`  | —       | Helper text below the label   |

## Events

| Event       | Detail                                | Description                      |
| ----------- | ------------------------------------- | -------------------------------- |
| `bq-change` | `{ value: string, checked: boolean }` | Fired when the selection changes |

## CSS Parts

| Part      | Description            |
| --------- | ---------------------- |
| `wrapper` | The outer wrapper      |
| `control` | The radio control area |
| `input`   | The native radio input |
| `label`   | Label text element     |
| `hint`    | Hint text element      |

## Form Participation

The component creates a hidden input proxy for native `<form>` submission. The proxy carries the `name` and `value` when checked.

## Accessibility

- Each radio renders a native `<input type="radio">` inside the shadow DOM for full keyboard support.
- The label is associated with the input via a wrapping `<label>` element.
- Use the `required` prop to mark mandatory radio fields; the required indicator is rendered visually and via `aria-required`.
