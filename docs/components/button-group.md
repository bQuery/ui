# Button Group

The `bq-button-group` component joins related buttons into a single visual control.

## Basic Usage

```html
<bq-button-group label="Text alignment">
  <bq-button variant="outline">Left</bq-button>
  <bq-button variant="outline">Center</bq-button>
  <bq-button variant="outline">Right</bq-button>
</bq-button-group>
```

## Attached

`attached` removes the gap so the buttons share borders and only the outer corners stay rounded:

```html
<bq-button-group attached label="Text alignment">
  <bq-button variant="outline">Left</bq-button>
  <bq-button variant="outline">Center</bq-button>
  <bq-button variant="outline">Right</bq-button>
</bq-button-group>
```

## Orientation

```html
<bq-button-group orientation="vertical" attached label="Actions">
  <bq-button variant="outline">Edit</bq-button>
  <bq-button variant="outline">Duplicate</bq-button>
  <bq-button variant="outline">Delete</bq-button>
</bq-button-group>
```

## Shared Size

Set `size` once on the group instead of on every button. A size set explicitly on a child always wins:

```html
<bq-button-group size="sm">
  <bq-button>Save</bq-button>
  <bq-button>Cancel</bq-button>
  <bq-button size="lg">Publish</bq-button>
</bq-button-group>
```

## Properties

| Property      | Type      | Default        | Description                                              |
| ------------- | --------- | -------------- | -------------------------------------------------------- |
| `orientation` | `string`  | `'horizontal'` | `horizontal` \| `vertical`                               |
| `size`        | `string`  | `''`           | `sm` \| `md` \| `lg` — forwarded to slotted buttons      |
| `attached`    | `boolean` | `false`        | Collapse the gap so buttons share borders                |
| `label`       | `string`  | `''`           | Accessible label for the group                           |

## Slots

| Slot        | Description                                                |
| ----------- | ---------------------------------------------------------- |
| *(default)* | Buttons (`bq-button`, `bq-icon-button` or native `button`)  |

## CSS Parts

| Part    | Description         |
| ------- | ------------------- |
| `group` | The group container |

## Accessibility

- The group exposes `role="group"` with an accessible name, so screen readers announce the buttons as one set.
- Buttons keep their own semantics and tab order; the group adds no keyboard behavior of its own.
- The focused button is lifted above its neighbours so its focus ring is never clipped by an adjacent border.
- For a single-choice control such as a view switcher, prefer [`bq-segmented-control`](./segmented-control), which has radio-group semantics.
