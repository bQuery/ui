# Card

The `bq-card` component is a flexible container with optional header, body, and footer sections.

## Basic Usage

```html
<bq-card>
  <p>This is the card body content.</p>
</bq-card>
```

## With Header and Footer

```html
<bq-card>
  <span slot="header">Card Title</span>
  <p>Card body content goes here.</p>
  <div slot="footer">
    <bq-button size="sm">Cancel</bq-button>
    <bq-button size="sm" variant="primary">Save</bq-button>
  </div>
</bq-card>
```

## Shadow Variants

```html
<bq-card shadow="none">No shadow</bq-card>
<bq-card shadow="sm">Small shadow</bq-card>
<bq-card shadow="md">Medium shadow (default)</bq-card>
<bq-card shadow="lg">Large shadow</bq-card>
```

## Bordered

```html
<bq-card bordered shadow="none">
  Bordered card without shadow
</bq-card>
```

## Interactive (hover effect)

```html
<bq-card interactive>
  <p>Hover over me!</p>
</bq-card>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `shadow` | `none \| sm \| md \| lg` | `md` | Box shadow depth |
| `radius` | `none \| sm \| md \| lg \| xl` | `xl` | Border radius |
| `bordered` | `boolean` | `false` | Shows a border |
| `interactive` | `boolean` | `false` | Adds hover lift effect |

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | Card body content |
| `header` | Content in the card header |
| `footer` | Content in the card footer |

## CSS Parts

| Part | Description |
|------|-------------|
| `card` | Outer card container |
| `header` | Header section |
| `body` | Body section |
| `footer` | Footer section |
