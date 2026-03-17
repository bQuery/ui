# Chip

The `bq-chip` component is an interactive tag with optional remove button and toggleable selected state.

## Basic Usage

```html
<bq-chip>Label</bq-chip>
```

## Variants

```html
<bq-chip variant="primary">Primary</bq-chip>
<bq-chip variant="secondary">Secondary</bq-chip>
<bq-chip variant="success">Success</bq-chip>
<bq-chip variant="danger">Danger</bq-chip>
<bq-chip variant="warning">Warning</bq-chip>
<bq-chip variant="info">Info</bq-chip>
```

## Sizes

```html
<bq-chip size="sm">Small</bq-chip>
<bq-chip size="md">Medium</bq-chip>
<bq-chip size="lg">Large</bq-chip>
```

## Removable

```html
<bq-chip removable>Removable tag</bq-chip>
```

## Selected

```html
<bq-chip selected>Active filter</bq-chip>
```

## Disabled

```html
<bq-chip disabled>Disabled</bq-chip>
```

## Properties

| Property    | Type      | Default     | Description                                                              |
| ----------- | --------- | ----------- | ------------------------------------------------------------------------ |
| `variant`   | `string`  | `'primary'` | `primary` \| `secondary` \| `success` \| `danger` \| `warning` \| `info` |
| `size`      | `string`  | `'md'`      | `sm` \| `md` \| `lg`                                                     |
| `removable` | `boolean` | `false`     | Shows a remove (✕) button                                                |
| `selected`  | `boolean` | `false`     | Toggled/pressed state                                                    |
| `disabled`  | `boolean` | `false`     | Disables the chip                                                        |

## Events

| Event       | Detail | Description                             |
| ----------- | ------ | --------------------------------------- |
| `bq-click`  | —      | Fired when the chip is clicked          |
| `bq-remove` | —      | Fired when the remove button is clicked |

## Slots

| Slot        | Description        |
| ----------- | ------------------ |
| *(default)* | Chip label content |

## CSS Parts

| Part   | Description      |
| ------ | ---------------- |
| `chip` | The chip element |

## Accessibility

- The chip surface has `tabindex="0"` for keyboard focus (`-1` when disabled).
- `aria-pressed` reflects the `selected` state.
- `aria-disabled` is set when disabled.
- Activates on `Enter` key down and `Space` key up (matching native button behaviour).
