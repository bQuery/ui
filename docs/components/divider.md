# Divider

The `bq-divider` component renders a horizontal or vertical visual separator with an optional center label.

## Basic Usage

```html
<bq-divider></bq-divider>
```

## With Label

```html
<bq-divider label="OR"></bq-divider>
```

## Vertical

```html
<div style="display: flex; height: 100px; align-items: center;">
  <span>Left</span>
  <bq-divider orientation="vertical"></bq-divider>
  <span>Right</span>
</div>
```

Vertical dividers can also render a label, which is laid out vertically to stay legible in narrow spaces.

## Variants

```html
<bq-divider variant="solid"></bq-divider>
<bq-divider variant="dashed"></bq-divider>
<bq-divider variant="dotted"></bq-divider>
```

## Properties

| Property      | Type     | Default        | Description                     |
| ------------- | -------- | -------------- | ------------------------------- |
| `orientation` | `string` | `'horizontal'` | `horizontal` \| `vertical`      |
| `variant`     | `string` | `'solid'`      | `solid` \| `dashed` \| `dotted` |
| `label`       | `string` | —              | Optional center label text      |

## CSS Parts

| Part      | Description            |
| --------- | ---------------------- |
| `divider` | The outer wrapper      |
| `line`    | The divider line(s)    |
| `label`   | The label text element |

## Accessibility

The component has `role="separator"` with `aria-orientation` set to the current orientation.
