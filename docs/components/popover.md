# Popover

The `bq-popover` component is a rich overlay anchored to a trigger. Unlike [`bq-tooltip`](./tooltip) — hover-activated and text-only — a popover holds interactive content, opens on click, and manages focus.

## Basic Usage

```html
<bq-popover heading="Filters">
  <bq-button slot="trigger">Open filters</bq-button>
  Choose how results are sorted.
</bq-popover>
```

## Placement

```html
<bq-popover placement="top">…</bq-popover>
<bq-popover placement="bottom-start">…</bq-popover>
<bq-popover placement="right">…</bq-popover>
```

Supported values are `top`, `bottom`, `left` and `right`, each optionally suffixed with `-start` or `-end` to align to an edge instead of the centre.

## Footer Actions

```html
<bq-popover heading="Delete project">
  <bq-button slot="trigger" variant="danger">Delete</bq-button>
  This cannot be undone.
  <bq-button slot="footer" variant="ghost">Cancel</bq-button>
  <bq-button slot="footer" variant="danger">Delete</bq-button>
</bq-popover>
```

## Without Chrome

```html
<bq-popover dismissible="false" arrow="false">
  <bq-button slot="trigger">Details</bq-button>
  Just the content.
</bq-popover>
```

## Controlling It

```js
popover.setAttribute('open', '');   // open
popover.removeAttribute('open');    // close

popover.addEventListener('bq-open', () => console.log('opened'));
popover.addEventListener('bq-close', () => console.log('closed'));
```

## Properties

| Property      | Type      | Default    | Description                                              |
| ------------- | --------- | ---------- | -------------------------------------------------------- |
| `open`        | `boolean` | `false`    | Whether the popover is open                              |
| `placement`   | `string`  | `'bottom'` | `top` \| `bottom` \| `left` \| `right` (+ `-start`/`-end`) |
| `heading`     | `string`  | `''`       | Optional title                                           |
| `dismissible` | `boolean` | `true`     | Show a close button                                      |
| `arrow`       | `boolean` | `true`     | Render a pointer arrow                                   |

## Slots

| Slot        | Description                     |
| ----------- | ------------------------------- |
| `trigger`   | Element that toggles the popover |
| *(default)* | Popover content                 |
| `footer`    | Footer actions                  |

## Events

| Event      | Detail | Description             |
| ---------- | ------ | ----------------------- |
| `bq-open`  | —      | The popover opened      |
| `bq-close` | —      | The popover closed      |

## CSS Parts

| Part      | Description          |
| --------- | -------------------- |
| `panel`   | The popover panel    |
| `arrow`   | The pointer arrow    |
| `header`  | Header row           |
| `heading` | Title element        |
| `close`   | Close button         |
| `content` | Content wrapper      |
| `footer`  | Footer wrapper       |

## Accessibility

- The panel exposes `role="dialog"`, labelled by the heading when one is set.
- The trigger receives `aria-expanded`, `aria-haspopup="dialog"` and `aria-controls`, kept in sync as the popover opens and closes.
- Opening moves focus to the first focusable element in the panel; <kbd>Escape</kbd> and the close button return focus to the trigger.
- Clicking outside closes the popover. That document listener only exists while the popover is open and is removed on disconnect.
- Use a genuinely focusable element (a button) in the `trigger` slot so keyboard users can reach it.
