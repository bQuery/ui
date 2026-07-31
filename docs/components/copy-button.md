# Copy Button

`bq-copy-button` copies text to the clipboard and confirms that it did.

The confirmation is the point: without it a copy button is indistinguishable
from a dead one. The icon and the accessible name both switch to the confirmed
state for a moment, then switch back.

## Basic Usage

```html
<bq-copy-button value="npm install @bquery/ui"></bq-copy-button>
```

## Copying another element

For the common "copy the code in that block" case, point `from` at a selector.
It is resolved against the containing document or shadow root:

```html
<code id="install">npm install @bquery/ui</code>
<bq-copy-button from="#install"></bq-copy-button>
```

## Variants

```html
<bq-copy-button value="x" variant="ghost"></bq-copy-button>
<bq-copy-button value="x" variant="outline"></bq-copy-button>
<bq-copy-button value="x" variant="solid"></bq-copy-button>
```

## Events

```js
document.querySelector('bq-copy-button').addEventListener('bq-copy', (e) => {
  console.log(e.detail.value, e.detail.ok);
});
```

`ok` is `false` when the clipboard write was refused — for instance in a
browser that blocks it outside a user gesture. The button stays in its idle
state in that case rather than claiming success.

## Properties

| Property       | Type      | Default   | Description                                    |
| -------------- | --------- | --------- | ---------------------------------------------- |
| `value`        | `string`  | `''`      | Text to copy                                   |
| `from`         | `string`  | `''`      | Selector whose text content is copied instead  |
| `label`        | `string`  | `''`      | Accessible name in the idle state              |
| `copied-label` | `string`  | `''`      | Accessible name after a successful copy        |
| `timeout`      | `number`  | `2000`    | How long the confirmed state lasts, in ms      |
| `disabled`     | `boolean` | `false`   |                                                |
| `variant`      | `string`  | `'ghost'` | `ghost` \| `outline` \| `solid`                |
| `size`         | `string`  | `'md'`    | `sm` \| `md` \| `lg`                           |

## Events

| Event     | Detail                             | Description              |
| --------- | ---------------------------------- | ------------------------ |
| `bq-copy` | `{ value: string, ok: boolean }`   | A copy was attempted     |

## CSS Parts

| Part     | Description       |
| -------- | ----------------- |
| `button` | The button element |

## Accessibility

- The button is named by `label`, and the name changes to `copied-label` while
  the confirmed state is showing.
- A polite live region announces the confirmation, so the feedback is not
  colour- and icon-only.
