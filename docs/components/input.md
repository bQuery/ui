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

## Password with Visibility Toggle

When `type="password"`, the input automatically renders a toggle button that allows users to show or hide the password. The toggle uses localized labels from the i18n system (`input.showPassword` / `input.hidePassword`).

```html
<bq-input label="Password" type="password" />
```

The toggle button:
- Shows `aria-pressed` state reflecting visibility
- Provides a localized `aria-label` for screen readers
- Switches the input type between `password` and `text`

## Character Counter

Use `show-counter` together with `maxlength` to display a character counter below the input. The counter uses the localized `input.characterCount` string.

```html
<bq-input
  label="Username"
  maxlength="20"
  show-counter
/>
```

The counter:
- Displays in the format "{count} of {max} characters"
- Turns red when the character limit is exceeded
- Includes `aria-live="polite"` for screen reader announcements
- Is linked to the input via `aria-describedby`

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
| `show-counter` | `boolean` | `false` | Show character counter (requires `maxlength`) |

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

## CSS Parts

| Part | Description |
|------|-------------|
| `field` | The field wrapper |
| `label` | Label text element |
| `input-wrap` | The input container with border |
| `input` | The native input element |
| `prefix` | Prefix slot wrapper |
| `suffix` | Suffix slot wrapper |
| `password-toggle` | The password visibility toggle button |
| `footer` | The footer area below the input |
| `error` | Error message element |
| `hint` | Hint text element |
| `counter` | Character counter element |

## Accessibility

- Links label to input via `for`/`id`
- Sets `aria-invalid` when error is present
- Links error/hint/counter to input via `aria-describedby`
- Password toggle has `aria-label` and `aria-pressed`
- Character counter uses `aria-live="polite"` for updates
- Required mark is `aria-hidden` (label itself conveys required state)

## Localization

The following i18n keys are used:

| Key | Default | Usage |
|-----|---------|-------|
| `input.showPassword` | "Show password" | Password toggle label (hidden state) |
| `input.hidePassword` | "Hide password" | Password toggle label (visible state) |
| `input.characterCount` | "{count} of {max} characters" | Character counter text |
