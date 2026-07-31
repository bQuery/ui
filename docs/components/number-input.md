# Number Input

The `bq-number-input` component is a numeric field with stepper buttons, range clamping and step snapping.

## Basic Usage

```html
<bq-number-input label="Quantity" value="1" min="1" max="99"></bq-number-input>
```

## Step and Precision

Values are snapped to the `step` grid and clamped to `[min, max]`:

```html
<bq-number-input label="Weight" value="2.5" min="0" max="10" step="0.5"></bq-number-input>
```

Display precision is derived from `step` — `step="0.5"` shows one decimal — which also avoids floating-point drift such as `0.30000000000000004`. Override it with `precision`:

```html
<bq-number-input value="1" step="0.1" precision="3"></bq-number-input>
```

## Prefix and Suffix

```html
<bq-number-input label="Price" value="20" min="0" step="0.01">
  <span slot="prefix">€</span>
</bq-number-input>

<bq-number-input label="Duration" value="30" min="0" step="5">
  <span slot="suffix">min</span>
</bq-number-input>
```

## Hint and Error

```html
<bq-number-input label="Seats" value="4" hint="Between 1 and 20"></bq-number-input>
<bq-number-input label="Seats" value="99" error="Maximum is 20"></bq-number-input>
```

## States

```html
<bq-number-input label="Locked" value="5" readonly></bq-number-input>
<bq-number-input label="Unavailable" value="5" disabled></bq-number-input>
```

## Handling Changes

```js
input.addEventListener('bq-input', (event) => {
  console.log('typing', event.detail.value);
});

input.addEventListener('bq-change', (event) => {
  console.log('committed', event.detail.value);
});
```

`bq-input` fires on each keystroke with the raw value. `bq-change` fires on commit (blur or a stepper button) with the normalized value — typing is never interrupted by mid-edit clamping.

## Forms

```html
<form>
  <bq-number-input name="quantity" value="2" min="1"></bq-number-input>
  <button type="submit">Send</button>
</form>
```

## Properties

| Property      | Type      | Default | Description                                            |
| ------------- | --------- | ------- | ------------------------------------------------------ |
| `value`       | `number`  | `0`     | Current value                                          |
| `min`         | `number`  | `-∞`    | Lower bound                                            |
| `max`         | `number`  | `+∞`    | Upper bound                                            |
| `step`        | `number`  | `1`     | Increment and snapping grid                            |
| `precision`   | `number`  | `-1`    | Decimal places (`-1` derives them from `step`)         |
| `label`       | `string`  | `''`    | Field label                                            |
| `placeholder` | `string`  | `''`    | Placeholder text                                       |
| `name`        | `string`  | `''`    | Form field name                                        |
| `size`        | `string`  | `'md'`  | `sm` \| `md` \| `lg`                                   |
| `disabled`    | `boolean` | `false` | Disable the field                                      |
| `readonly`    | `boolean` | `false` | Prevent editing                                        |
| `required`    | `boolean` | `false` | Mark the field required                                |
| `error`       | `string`  | `''`    | Error message; marks the field invalid                 |
| `hint`        | `string`  | `''`    | Helper text                                            |

## Slots

| Slot     | Description                                |
| -------- | ------------------------------------------ |
| `prefix` | Content before the field, e.g. a currency  |
| `suffix` | Content after the field, e.g. a unit       |

## Events

| Event       | Detail              | Description                          |
| ----------- | ------------------- | ------------------------------------ |
| `bq-input`  | `{ value: number }` | The field value changed while typing |
| `bq-change` | `{ value: number }` | A normalized value was committed     |

## CSS Parts

| Part        | Description             |
| ----------- | ----------------------- |
| `field`     | The outer wrapper       |
| `label`     | The label element       |
| `control`   | The input row           |
| `input`     | The native input        |
| `decrement` | The decrement button    |
| `increment` | The increment button    |
| `hint`      | Helper text             |
| `error`     | Error message           |

## Accessibility

- The label is a real `<label>` bound to the input via `for`/`id`.
- Hint and error text are linked with `aria-describedby`; an error also sets `aria-invalid` and `role="alert"`.
- Stepper buttons carry localized `aria-label`s and are removed from the tab order — the field itself is the tab stop, and native <kbd>↑</kbd>/<kbd>↓</kbd> already step the value.
- A stepper button is disabled once its bound is reached, so the limit is conveyed non-visually.
- The native spin buttons are hidden in favour of the styled ones, which stay full-size and easy to hit on touch.
