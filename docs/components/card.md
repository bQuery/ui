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

## Elevated Cards

```html
<bq-card>Default elevated card</bq-card>
<bq-card elevated="false">Flat card</bq-card>
```

## With Title

```html
<bq-card title="Card title">
  Card body content
</bq-card>
```

## Title with Custom Header Content

The `title` prop and `header` slot can be combined. When both are provided, the title is rendered first followed by the slotted header content.

```html
<bq-card title="Settings">
  <bq-button slot="header" size="sm" variant="ghost">Edit</bq-button>
  <p>Card body content</p>
</bq-card>
```

## Padding Options

```html
<bq-card padding="none">No body padding</bq-card>
<bq-card padding="sm">Small padding</bq-card>
<bq-card padding="md">Medium padding (default)</bq-card>
<bq-card padding="lg">Large padding</bq-card>
```

## Properties

| Property   | Type                     | Default | Description                          |
| ---------- | ------------------------ | ------- | ------------------------------------ |
| `title`    | `string`                 | `''`    | Renders a built-in card header title |
| `elevated` | `boolean`                | `true`  | Enables the default card shadow      |
| `padding`  | `none \| sm \| md \| lg` | `md`    | Sets the body padding                |

## Slots

| Slot        | Description                |
| ----------- | -------------------------- |
| *(default)* | Card body content          |
| `header`    | Content in the card header |
| `footer`    | Content in the card footer |

## CSS Parts

| Part     | Description          |
| -------- | -------------------- |
| `card`   | Outer card container |
| `header` | Header section       |
| `body`   | Body section         |
| `footer` | Footer section       |

## Accessibility

- Cards use semantic HTML with heading hierarchy (`<h3>` for the title).
- Content is accessible via normal document flow.
- Use the `title` prop or the `header` slot to provide a meaningful heading for the card.
