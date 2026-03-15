# Input

The `bq-input` component is a fully accessible text input with label, error, hint, and prefix/suffix slot support.

## Basic Usage

```html
<bq-input label="Name" placeholder="John Doe" />
```

## With Error

```html
<bq-input
  label="Email"
  type="email"
  value="not-an-email"
  error="Please enter a valid email address"
/>
```

## With Hint

```html
<bq-input
  label="Password"
  type="password"
  hint="At least 8 characters, one uppercase letter"
/>
```

## Required Field

```html
<bq-input label="Username" required />
```

## Disabled & Readonly

```html
<bq-input label="Read Only" value="Can't change this" readonly />
<bq-input label="Disabled" value="Disabled" disabled />
```

## Sizes

```html
<bq-input size="sm" placeholder="Small" />
<bq-input size="md" placeholder="Medium (default)" />
<bq-input size="lg" placeholder="Large" />
```

## With Icons (Slots)

```html
<bq-input label="Search" placeholder="Search…">
  <span slot="prefix">🔍</span>
</bq-input>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | `string` | — | Input label |
| `type` | `string` | `text` | HTML input type |
| `value` | `string` | — | Input value |
| `placeholder` | `string` | — | Placeholder text |
| `name` | `string` | — | Form field name |
| `size` | `sm \| md \| lg` | `md` | Input size |
| `disabled` | `boolean` | `false` | Disables input |
| `readonly` | `boolean` | `false` | Makes input read-only |
| `required` | `boolean` | `false` | Marks as required |
| `error` | `string` | — | Error message |
| `hint` | `string` | — | Hint / helper text |
| `maxlength` | `string` | — | Maximum character count |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `bq-input` | `{ value: string }` | Fired on each keystroke |
| `bq-change` | `{ value: string }` | Fired when value is committed |
| `bq-focus` | — | Fired on focus |
| `bq-blur` | — | Fired on blur |

## Slots

| Slot | Description |
|------|-------------|
| `prefix` | Leading icon/element inside the input |
| `suffix` | Trailing icon/element inside the input |
