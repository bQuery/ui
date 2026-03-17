# Alert

The `bq-alert` component displays contextual feedback messages for user actions, such as success confirmations, warnings, and error notifications.

## Basic Usage

```html
<bq-alert variant="info" title="Information">
  This is an informational message.
</bq-alert>
```

## Variants

```html
<bq-alert variant="info" title="Info">
  This is an informational alert.
</bq-alert>

<bq-alert variant="success" title="Success">
  Operation completed successfully.
</bq-alert>

<bq-alert variant="warning" title="Warning">
  Please review the following issues.
</bq-alert>

<bq-alert variant="danger" title="Error">
  Something went wrong. Please try again.
</bq-alert>
```

## Dismissible

```html
<bq-alert variant="success" title="Saved" dismissible>
  Your changes have been saved.
</bq-alert>
```

## With Custom Content

```html
<bq-alert variant="warning" title="Storage Almost Full" dismissible>
  <p>You have used <strong>90%</strong> of your storage.</p>
  <bq-button size="sm" variant="outline">Upgrade Plan</bq-button>
</bq-alert>
```

## Without Title

```html
<bq-alert variant="info">
  A simple informational message without a title.
</bq-alert>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `info \| success \| warning \| danger` | `info` | Visual style indicating the alert type |
| `title` | `string` | `''` | Alert heading text |
| `dismissible` | `boolean` | `false` | Shows a close button to dismiss the alert |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `bq-close` | — | Fired when the alert is dismissed via the close button |

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | Alert body content |

## CSS Parts

| Part | Description |
|------|-------------|
| `alert` | The main alert container |
