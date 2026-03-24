# Switch

The `bq-switch` component is a toggle switch form control.

## Basic Usage

```html
<bq-switch label="Enable notifications"></bq-switch>
```

## Checked

```html
<bq-switch label="Dark mode" checked></bq-switch>
```

## Sizes

```html
<bq-switch label="Small" size="sm"></bq-switch>
<bq-switch label="Medium" size="md"></bq-switch>
<bq-switch label="Large" size="lg"></bq-switch>
```

## Disabled

```html
<bq-switch label="Locked" disabled></bq-switch>
<bq-switch label="Locked on" checked disabled></bq-switch>
```

## Properties

| Property   | Type      | Default | Description              |
| ---------- | --------- | ------- | ------------------------ |
| `label`    | `string`  | —       | Visible label text       |
| `name`     | `string`  | —       | Form field name          |
| `checked`  | `boolean` | `false` | Whether the switch is on |
| `disabled` | `boolean` | `false` | Disables the switch      |
| `size`     | `string`  | `'md'`  | `sm` \| `md` \| `lg`     |

## Events

| Event       | Detail                 | Description                         |
| ----------- | ---------------------- | ----------------------------------- |
| `bq-change` | `{ checked: boolean }` | Fired when the toggle state changes |

## CSS Parts

| Part      | Description               |
| --------- | ------------------------- |
| `control` | The switch track          |
| `input`   | The native checkbox input |
| `thumb`   | The toggle thumb          |
| `label`   | Label text element        |

## Form Participation

The component creates a hidden input proxy for native `<form>` submission. The proxy submits `"on"` when checked and is empty when unchecked.

## Accessibility

- Uses a native `<input type="checkbox" role="switch">` for full keyboard and screen reader support.
- The toggle state is conveyed via `aria-checked`.
- The label is associated with the input via a wrapping `<label>` element.
