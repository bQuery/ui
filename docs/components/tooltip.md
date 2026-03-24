# Tooltip

The `bq-tooltip` component shows a contextual popup on hover or focus of its trigger element.

## Basic Usage

```html
<bq-tooltip content="More information">
  <bq-button>Hover me</bq-button>
</bq-tooltip>
```

## Placement

```html
<bq-tooltip content="Top" placement="top"><bq-button>Top</bq-button></bq-tooltip>
<bq-tooltip content="Bottom" placement="bottom"><bq-button>Bottom</bq-button></bq-tooltip>
<bq-tooltip content="Left" placement="left"><bq-button>Left</bq-button></bq-tooltip>
<bq-tooltip content="Right" placement="right"><bq-button>Right</bq-button></bq-tooltip>
```

## Custom Delay

```html
<bq-tooltip content="Slow tooltip" delay="500">
  <bq-button>Hover (500ms delay)</bq-button>
</bq-tooltip>
```

## Properties

| Property    | Type     | Default | Description                            |
| ----------- | -------- | ------- | -------------------------------------- |
| `content`   | `string` | —       | Tooltip text                           |
| `placement` | `string` | `'top'` | `top` \| `bottom` \| `left` \| `right` |
| `delay`     | `number` | `200`   | Show delay in milliseconds             |

## Slots

| Slot        | Description         |
| ----------- | ------------------- |
| *(default)* | The trigger element |

## CSS Parts

| Part      | Description       |
| --------- | ----------------- |
| `tooltip` | The tooltip popup |

## Accessibility

- The tooltip has `role="tooltip"`.
- The trigger element is automatically linked to the tooltip with `aria-describedby`.
- The tooltip is hidden with `opacity: 0` by default and becomes visible on hover/focus.
- Pressing `Escape` dismisses the tooltip.
- The animation respects `prefers-reduced-motion`.
