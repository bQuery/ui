# Rating

The `bq-rating` component is a star rating input.

## Basic Usage

```html
<bq-rating value="4"></bq-rating>
```

## Read-only and Disabled

```html
<bq-rating value="3" readonly></bq-rating>
<bq-rating value="3" disabled></bq-rating>
```

`readonly` displays the value without allowing changes. `disabled` additionally dims the control.

## Custom Scale

```html
<bq-rating value="7" max="10"></bq-rating>
```

## Clearable

With `clearable`, selecting the current value resets the rating to `0`:

```html
<bq-rating value="3" clearable></bq-rating>
```

## Sizes

```html
<bq-rating value="3" size="sm"></bq-rating>
<bq-rating value="3" size="md"></bq-rating>
<bq-rating value="3" size="lg"></bq-rating>
```

## Handling Changes

```js
rating.addEventListener('bq-change', (event) => {
  console.log(event.detail.value); // 4
});
```

## Forms

Set `name` to take part in native form submission:

```html
<form>
  <bq-rating name="score" value="4"></bq-rating>
  <button type="submit">Send</button>
</form>
```

The component keeps a hidden input in sync, so `new FormData(form).get('score')` returns the current rating.

## Properties

| Property    | Type      | Default | Description                                   |
| ----------- | --------- | ------- | --------------------------------------------- |
| `value`     | `number`  | `0`     | Current rating                                |
| `max`       | `number`  | `5`     | Number of stars                               |
| `readonly`  | `boolean` | `false` | Display only                                  |
| `disabled`  | `boolean` | `false` | Disable interaction                           |
| `clearable` | `boolean` | `false` | Re-selecting the current value clears it      |
| `size`      | `string`  | `'md'`  | `sm` \| `md` \| `lg`                          |
| `label`     | `string`  | `''`    | Accessible label                              |
| `name`      | `string`  | `''`    | Form field name                               |

## Events

| Event       | Detail              | Description             |
| ----------- | ------------------- | ----------------------- |
| `bq-change` | `{ value: number }` | The rating changed      |

## CSS Parts

| Part     | Description        |
| -------- | ------------------ |
| `rating` | The group wrapper  |
| `star`   | An individual star |

## Keyboard

| Key                      | Action                  |
| ------------------------ | ----------------------- |
| <kbd>→</kbd> / <kbd>↑</kbd> | Increase by one      |
| <kbd>←</kbd> / <kbd>↓</kbd> | Decrease by one      |
| <kbd>Home</kbd>          | Clear to `0`            |
| <kbd>End</kbd>           | Set to `max`            |

## Accessibility

- The control exposes `role="radiogroup"` and each star `role="radio"`, with `aria-readonly` and `aria-disabled` reflecting the current mode.
- Only the active star is in the tab order; arrow keys move within the group, matching the WAI-ARIA radio-group pattern.
- Every star has an `aria-label` describing the value it would set, and a polite live region announces the current rating.
- Values are clamped to `0…max`, so an out-of-range `value` attribute cannot produce an inconsistent state.
