# Spinner

The `bq-spinner` component is an animated circular loading indicator.

## Basic Usage

```html
<bq-spinner></bq-spinner>
```

## Sizes

```html
<bq-spinner size="xs"></bq-spinner>
<bq-spinner size="sm"></bq-spinner>
<bq-spinner size="md"></bq-spinner>
<bq-spinner size="lg"></bq-spinner>
<bq-spinner size="xl"></bq-spinner>
```

## Variants

```html
<bq-spinner variant="primary"></bq-spinner>
<bq-spinner variant="secondary"></bq-spinner>
<bq-spinner variant="danger"></bq-spinner>
<bq-spinner variant="success"></bq-spinner>
<bq-spinner variant="white"></bq-spinner>
```

## Custom Label

```html
<bq-spinner label="Processing your request"></bq-spinner>
```

## Properties

| Property  | Type     | Default     | Description                                                                     |
| --------- | -------- | ----------- | ------------------------------------------------------------------------------- |
| `size`    | `string` | `'md'`      | `xs` \| `sm` \| `md` \| `lg` \| `xl`                                            |
| `variant` | `string` | `'primary'` | `primary` \| `secondary` \| `danger` \| `success` \| `white`                    |
| `label`   | `string` | —           | Accessible label (screen-reader only; defaults to a localized "Loading" string) |

## CSS Parts

| Part      | Description         |
| --------- | ------------------- |
| `spinner` | The spinner element |

## Accessibility

The spinner has `role="status"` and an `aria-label`. When no label is provided, a localized default is used. The animation respects `prefers-reduced-motion`.
