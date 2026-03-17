# Avatar

The `bq-avatar` component displays a user image or auto-generated initials with an optional status indicator.

## Basic Usage

```html
<bq-avatar alt="Jane Doe"></bq-avatar>
```

## With Image

```html
<bq-avatar src="/images/user.jpg" alt="Jane Doe"></bq-avatar>
```

## Sizes

```html
<bq-avatar alt="XS" size="xs"></bq-avatar>
<bq-avatar alt="SM" size="sm"></bq-avatar>
<bq-avatar alt="MD" size="md"></bq-avatar>
<bq-avatar alt="LG" size="lg"></bq-avatar>
<bq-avatar alt="XL" size="xl"></bq-avatar>
```

## Shapes

```html
<bq-avatar alt="Circle" shape="circle"></bq-avatar>
<bq-avatar alt="Square" shape="square"></bq-avatar>
```

## Status Indicator

```html
<bq-avatar alt="Jane Doe" status="online"></bq-avatar>
<bq-avatar alt="Jane Doe" status="away"></bq-avatar>
<bq-avatar alt="Jane Doe" status="busy"></bq-avatar>
<bq-avatar alt="Jane Doe" status="offline"></bq-avatar>
```

## Properties

| Property | Type     | Default    | Description                                    |
| -------- | -------- | ---------- | ---------------------------------------------- |
| `src`    | `string` | —          | Image URL                                      |
| `alt`    | `string` | —          | Alt text; initials are derived from this value |
| `size`   | `string` | `'md'`     | `xs` \| `sm` \| `md` \| `lg` \| `xl`           |
| `shape`  | `string` | `'circle'` | `circle` \| `square`                           |
| `status` | `string` | —          | `online` \| `away` \| `busy` \| `offline`      |

## Slots

| Slot        | Description                                            |
| ----------- | ------------------------------------------------------ |
| *(default)* | Custom content replacing initials when no `src` is set |

## CSS Parts

| Part     | Description              |
| -------- | ------------------------ |
| `avatar` | The avatar container     |
| `status` | The status indicator dot |

## Accessibility

The avatar container has `role="img"` and receives an `aria-label` derived from the `alt` property.
