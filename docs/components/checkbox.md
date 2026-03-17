# Checkbox

The `bq-checkbox` component is an accessible checkbox input supporting checked, indeterminate, and disabled states with optional hint text.

## Basic Usage

```html
<bq-checkbox label="Accept terms and conditions"></bq-checkbox>
```

## Checked

```html
<bq-checkbox label="Receive notifications" checked></bq-checkbox>
```

## Indeterminate

```html
<bq-checkbox label="Select all" indeterminate></bq-checkbox>
```

## With Hint

```html
<bq-checkbox
  label="Marketing emails"
  hint="We'll send you updates about new features and promotions."
></bq-checkbox>
```

## Disabled

```html
<bq-checkbox label="Inactive option" disabled></bq-checkbox>
<bq-checkbox label="Locked selection" checked disabled></bq-checkbox>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | `string` | — | Checkbox label text |
| `checked` | `boolean` | `false` | Whether the checkbox is checked |
| `indeterminate` | `boolean` | `false` | Displays the indeterminate (mixed) state |
| `disabled` | `boolean` | `false` | Disables the checkbox |
| `name` | `string` | — | Form field name |
| `value` | `string` | — | Value submitted with the form |
| `hint` | `string` | — | Helper text displayed below the label |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `bq-change` | `{ checked: boolean }` | Fired when the checked state changes |

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | Custom label content (overrides the `label` property) |

## CSS Parts

| Part | Description |
|------|-------------|
| `wrapper` | The outer checkbox wrapper |
| `control` | The checkbox input control |
| `input` | The native checkbox input |
| `label` | Label text element |
| `hint` | Hint text element |
