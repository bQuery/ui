# Pagination

The `bq-pagination` component provides page navigation with previous/next buttons, numbered pages, and ellipsis for large page ranges.

## Basic Usage

```html
<bq-pagination page="1" total="10"></bq-pagination>
```

## With Sibling Count

```html
<bq-pagination page="5" total="20" sibling-count="2"></bq-pagination>
```

## Disabled

```html
<bq-pagination page="1" total="10" disabled></bq-pagination>
```

## Properties

| Property        | Type      | Default | Description                                  |
| --------------- | --------- | ------- | -------------------------------------------- |
| `page`          | `number`  | `1`     | Current page (1-based)                       |
| `total`         | `number`  | `1`     | Total number of pages                        |
| `sibling-count` | `number`  | `1`     | Number of visible sibling pages on each side |
| `disabled`      | `boolean` | `false` | Disables all interactions                    |

## Events

| Event            | Detail             | Description                   |
| ---------------- | ------------------ | ----------------------------- |
| `bq-page-change` | `{ page: number }` | Fired when a page is selected |

## CSS Parts

| Part         | Description                |
| ------------ | -------------------------- |
| `nav`        | The `<nav>` wrapper        |
| `pagination` | The inner button container |

## Accessibility

- Wrapped in `<nav>` with an `aria-label`.
- The current page button has `aria-current="page"`.
- Previous and next buttons are automatically disabled at the boundaries.
