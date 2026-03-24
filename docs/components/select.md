# Select

The `bq-select` component is a dropdown selection input with label, hint text, error state, form participation, and size options.

## Basic Usage

```html
<bq-select label="Country" placeholder="Choose a country">
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
  <option value="ca">Canada</option>
</bq-select>
```

## With Error

```html
<bq-select
  label="Department"
  error="Please select a department"
>
  <option value="">-- Select --</option>
  <option value="eng">Engineering</option>
  <option value="design">Design</option>
</bq-select>
```

## With Placeholder

```html
<bq-select label="Role" placeholder="Select a role">
  <option value="admin">Admin</option>
  <option value="editor">Editor</option>
  <option value="viewer">Viewer</option>
</bq-select>
```

## Preselected Value

```html
<bq-select label="Plan" value="pro" hint="You can change this later.">
  <option value="free">Free</option>
  <option value="pro">Pro</option>
  <option value="enterprise">Enterprise</option>
</bq-select>
```

## Disabled

```html
<bq-select label="Plan" value="pro" disabled>
  <option value="free">Free</option>
  <option value="pro">Pro</option>
  <option value="enterprise">Enterprise</option>
</bq-select>
```

## Sizes

```html
<bq-select label="Small" size="sm">
  <option value="a">Option A</option>
</bq-select>

<bq-select label="Medium (default)" size="md">
  <option value="a">Option A</option>
</bq-select>

<bq-select label="Large" size="lg">
  <option value="a">Option A</option>
</bq-select>
```

## Properties

| Property      | Type             | Default | Description                                     |
| ------------- | ---------------- | ------- | ----------------------------------------------- |
| `label`       | `string`         | —       | Select label                                    |
| `value`       | `string`         | —       | Currently selected value                        |
| `placeholder` | `string`         | —       | Placeholder text when no option is selected     |
| `name`        | `string`         | —       | Form field name                                 |
| `disabled`    | `boolean`        | `false` | Disables the select                             |
| `required`    | `boolean`        | `false` | Marks the field as required                     |
| `error`       | `string`         | —       | Error message displayed below the select        |
| `hint`        | `string`         | —       | Helpful supporting text shown below the control |
| `size`        | `sm \| md \| lg` | `md`    | Select size                                     |

## Events

| Event       | Detail              | Description                           |
| ----------- | ------------------- | ------------------------------------- |
| `bq-change` | `{ value: string }` | Fired when the selected value changes |

## Slots

| Slot        | Description                               |
| ----------- | ----------------------------------------- |
| *(default)* | `<option>` elements for the dropdown list |

## CSS Parts

| Part     | Description               |
| -------- | ------------------------- |
| `field`  | The outer field wrapper   |
| `label`  | Label text element        |
| `select` | The native select control |
| `hint`   | Supporting hint text      |
| `error`  | Error message element     |

## Accessibility

- The native `<select>` is associated with its visible label through `for` / `id`.
- Hint and error text are linked with `aria-describedby` when present.
- The `value` prop now stays synchronized with the rendered native control and the hidden form proxy.
