# Skeleton

The `bq-skeleton` component renders a shimmer loading placeholder in various shapes.

## Basic Usage

```html
<bq-skeleton></bq-skeleton>
```

## Variants

```html
<bq-skeleton variant="text"></bq-skeleton>
<bq-skeleton variant="circle" width="48px" height="48px"></bq-skeleton>
<bq-skeleton variant="rect" width="200px" height="120px"></bq-skeleton>
<bq-skeleton variant="card"></bq-skeleton>
```

## Multiple Text Lines

```html
<bq-skeleton variant="text" lines="3"></bq-skeleton>
```

## Custom Dimensions

```html
<bq-skeleton variant="rect" width="300px" height="200px"></bq-skeleton>
```

## Properties

| Property  | Type     | Default  | Description                                 |
| --------- | -------- | -------- | ------------------------------------------- |
| `variant` | `string` | `'text'` | `text` \| `circle` \| `rect` \| `card`      |
| `width`   | `string` | `'100%'` | CSS width value                             |
| `height`  | `string` | —        | CSS height value                            |
| `lines`   | `number` | `1`      | Number of text lines (for `variant="text"`) |

## CSS Parts

| Part       | Description                  |
| ---------- | ---------------------------- |
| `skeleton` | The skeleton element         |
| `lines`    | The container for text lines |

## Accessibility

The skeleton uses `prefers-reduced-motion` to disable the shimmer animation when the user requests reduced motion.
