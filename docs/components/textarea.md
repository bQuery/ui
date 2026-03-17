# Textarea

The `bq-textarea` component is a multi-line text input with label, error, hint, and native form participation.

## Basic Usage

```html
<bq-textarea label="Message" placeholder="Type your message here"></bq-textarea>
```

## With Value

```html
<bq-textarea label="Bio" value="Hello, I'm a developer."></bq-textarea>
```

## Rows

```html
<bq-textarea label="Description" rows="6"></bq-textarea>
```

## Required

```html
<bq-textarea label="Feedback" required></bq-textarea>
```

## Error State

```html
<bq-textarea label="Comment" error="This field is required."></bq-textarea>
```

## Hint Text

```html
<bq-textarea label="Notes" hint="Max 500 characters." maxlength="500"></bq-textarea>
```

## Disabled & Readonly

```html
<bq-textarea label="Locked" value="Cannot edit" disabled></bq-textarea>
<bq-textarea label="View only" value="Read-only content" readonly></bq-textarea>
```

## Properties

| Property      | Type      | Default | Description                  |
| ------------- | --------- | ------- | ---------------------------- |
| `label`       | `string`  | —       | Visible label text           |
| `value`       | `string`  | —       | Current value                |
| `placeholder` | `string`  | —       | Placeholder text             |
| `name`        | `string`  | —       | Form field name              |
| `rows`        | `number`  | `4`     | Visible row count            |
| `disabled`    | `boolean` | `false` | Disables the textarea        |
| `readonly`    | `boolean` | `false` | Makes the textarea read-only |
| `required`    | `boolean` | `false` | Marks as required            |
| `error`       | `string`  | —       | Error message                |
| `hint`        | `string`  | —       | Hint text                    |
| `maxlength`   | `string`  | —       | Maximum character count      |

## Events

| Event       | Detail              | Description             |
| ----------- | ------------------- | ----------------------- |
| `bq-input`  | `{ value: string }` | Fired on each keystroke |
| `bq-change` | `{ value: string }` | Fired on commit/blur    |
| `bq-focus`  | —                   | Fired on focus          |
| `bq-blur`   | —                   | Fired on blur           |

## CSS Parts

| Part       | Description           |
| ---------- | --------------------- |
| `field`    | The field wrapper     |
| `label`    | Label text element    |
| `textarea` | The native textarea   |
| `error`    | Error message element |
| `hint`     | Hint text element     |

## Form Participation

The component creates a hidden input proxy for native `<form>` submission carrying the `name` and current `value`.
