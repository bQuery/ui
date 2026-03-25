# Badge

The `bq-badge` component is a small status or label indicator.

## Basic Usage

```html
<bq-badge>New</bq-badge>
```

## Variants

```html
<bq-badge variant="primary">Primary</bq-badge>
<bq-badge variant="secondary">Secondary</bq-badge>
<bq-badge variant="success">Success</bq-badge>
<bq-badge variant="danger">Danger</bq-badge>
<bq-badge variant="warning">Warning</bq-badge>
<bq-badge variant="info">Info</bq-badge>
<bq-badge variant="outline">Outline</bq-badge>
```

## Sizes

```html
<bq-badge size="sm">Small</bq-badge>
<bq-badge size="md">Medium</bq-badge>
<bq-badge size="lg">Large</bq-badge>
```

## Pill Shape

```html
<bq-badge pill>Pill badge</bq-badge>
```

## Properties

| Property  | Type      | Default     | Description                                                                           |
| --------- | --------- | ----------- | ------------------------------------------------------------------------------------- |
| `variant` | `string`  | `'primary'` | `primary` \| `secondary` \| `success` \| `danger` \| `warning` \| `info` \| `outline` |
| `size`    | `string`  | `'md'`      | `sm` \| `md` \| `lg`                                                                  |
| `pill`    | `boolean` | `false`     | Fully rounded shape                                                                   |

## Slots

| Slot        | Description   |
| ----------- | ------------- |
| *(default)* | Badge content |

## CSS Parts

| Part    | Description       |
| ------- | ----------------- |
| `badge` | The badge element |

## Accessibility

- Badges are purely presentational and should not convey critical information alone.
- When a badge conveys status, pair it with an `aria-label` or visible text for screen readers.
