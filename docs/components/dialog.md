# Dialog

The `bq-dialog` component is a modal dialog overlay used for confirmations, forms, and focused interactions. It traps focus and supports keyboard dismissal.

## Basic Usage

```html
<bq-button onclick="document.querySelector('#my-dialog').open = true">
  Open Dialog
</bq-button>

<bq-dialog id="my-dialog" title="Confirm Action">
  <p>Are you sure you want to continue?</p>
</bq-dialog>
```

## Sizes

```html
<bq-dialog title="Small Dialog" size="sm">
  <p>Compact dialog for simple messages.</p>
</bq-dialog>

<bq-dialog title="Medium Dialog" size="md">
  <p>Default size, suitable for most use cases.</p>
</bq-dialog>

<bq-dialog title="Large Dialog" size="lg">
  <p>Large dialog for complex content.</p>
</bq-dialog>

<bq-dialog title="Extra Large Dialog" size="xl">
  <p>Extra-large dialog for data-heavy views.</p>
</bq-dialog>

<bq-dialog title="Full Screen" size="full">
  <p>Full-screen dialog for immersive experiences.</p>
</bq-dialog>
```

## Non-Dismissible

```html
<bq-dialog title="Required Action" dismissible="false">
  <p>You must complete this action before continuing.</p>
  <div slot="footer">
    <bq-button>Acknowledge</bq-button>
  </div>
</bq-dialog>
```

## With Footer

```html
<bq-dialog title="Save Changes?">
  <p>You have unsaved changes. Do you want to save before leaving?</p>
  <div slot="footer">
    <bq-button variant="ghost">Discard</bq-button>
    <bq-button variant="primary">Save</bq-button>
  </div>
</bq-dialog>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `open` | `boolean` | `false` | Controls visibility of the dialog |
| `title` | `string` | — | Dialog heading text |
| `size` | `sm \| md \| lg \| xl \| full` | `md` | Width preset for the dialog |
| `dismissible` | `boolean` | `true` | Allows closing via overlay click, Escape key, and close button |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `bq-close` | — | Fired when the dialog is dismissed |

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | Dialog body content |
| `footer` | Footer area, typically used for action buttons |

## CSS Parts

| Part | Description |
|------|-------------|
| `overlay` | Background overlay behind the dialog |
| `dialog` | The dialog container |
| `header` | Header section containing the title and close button |
| `title` | Title text element |
| `close` | Close / dismiss button |
| `body` | Body content area |
| `footer` | Footer section |
