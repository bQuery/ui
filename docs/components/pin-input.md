# Pin Input

`bq-pin-input` collects a short code — a one-time password, a PIN, an invite
code — in a row of single-character cells.

## Basic Usage

```html
<bq-pin-input label="Verification code" length="6"></bq-pin-input>
```

## Behaviour

- Typing a character fills the current cell and moves to the next one.
- Backspace clears the current cell; on an empty cell it steps back and clears
  the previous one, so holding it deletes the whole code.
- Pasting spreads the code across the cells from wherever the caret is,
  overwriting rather than inserting.
- Arrow keys, `Home` and `End` move between cells.
- Clicking a partly filled row lands on the first empty cell.

The first cell carries `autocomplete="one-time-code"`, so iOS and Android
offer a code arriving by SMS.

## Character types

```html
<bq-pin-input type="numeric" length="6"></bq-pin-input>
<bq-pin-input type="alphanumeric" length="5"></bq-pin-input>
<bq-pin-input type="text" length="4"></bq-pin-input>
```

Characters outside the chosen type are rejected as they are typed, so a
numeric field never shows a stray letter.

## Masked

```html
<bq-pin-input label="PIN" length="4" mask></bq-pin-input>
```

## Events

```js
const pin = document.querySelector('bq-pin-input');

pin.addEventListener('bq-complete', (e) => {
  // Fires once the last cell is filled
  verify(e.detail.value);
});
```

## Forms

The component mirrors its value into a hidden input, so it submits with a
plain `<form>` and participates in constraint validation:

```html
<form>
  <bq-pin-input name="code" length="6" required></bq-pin-input>
  <bq-button type="submit">Verify</bq-button>
</form>
```

## Properties

| Property     | Type      | Default     | Description                            |
| ------------ | --------- | ----------- | -------------------------------------- |
| `length`     | `number`  | `6`         | Number of cells                        |
| `value`      | `string`  | `''`        | Current code                           |
| `name`       | `string`  | `''`        | Form field name                        |
| `type`       | `string`  | `'numeric'` | `numeric` \| `alphanumeric` \| `text`  |
| `mask`       | `boolean` | `false`     | Obscure the characters                 |
| `disabled`   | `boolean` | `false`     |                                        |
| `readonly`   | `boolean` | `false`     |                                        |
| `required`   | `boolean` | `false`     |                                        |
| `label`      | `string`  | `''`        | Visible label                          |
| `hint`       | `string`  | `''`        | Helper text                            |
| `error`      | `string`  | `''`        | Error message; non-empty = error state |
| `size`       | `string`  | `'md'`      | `sm` \| `md` \| `lg`                   |

## Events

| Event         | Detail                | Description                     |
| ------------- | --------------------- | ------------------------------- |
| `bq-input`    | `{ value: string }`   | The code changed                |
| `bq-change`   | `{ value: string }`   | The code changed                |
| `bq-complete` | `{ value: string }`   | Every cell is now filled        |

## CSS Parts

| Part    | Description            |
| ------- | ---------------------- |
| `field` | The outer wrapper      |
| `label` | The label element      |
| `cells` | The row of cells       |
| `cell`  | A single cell          |
| `hint`  | The hint text          |
| `error` | The error message      |

## Accessibility

- The cells sit in a labelled `role="group"`, and each one is named
  "Digit *n* of *m*".
- A polite live region announces how many characters have been entered, so a
  screen-reader user knows the code is progressing.
