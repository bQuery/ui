# Toast

The `bq-toast` component displays brief, non-intrusive notifications that automatically dismiss after a set duration. It can be used declaratively or via an imperative API.

## Basic Usage

```html
<bq-toast variant="info" message="File uploaded successfully."></bq-toast>
```

## Variants

```html
<bq-toast variant="success" message="Changes saved."></bq-toast>
<bq-toast variant="error" message="Failed to save changes."></bq-toast>
<bq-toast variant="warning" message="Your session is about to expire."></bq-toast>
<bq-toast variant="info" message="A new version is available."></bq-toast>
```

## Custom Duration

```html
<bq-toast
  variant="info"
  message="This message stays longer."
  duration="8000"
></bq-toast>
```

## Non-Dismissible

```html
<bq-toast
  variant="warning"
  message="Processing your request…"
  dismissible="false"
></bq-toast>
```

## Imperative API

You can trigger toasts programmatically using the `showToast` helper:

```js
import { showToast } from '@bquery/ui';

// Success toast
showToast({ variant: 'success', message: 'Item created!' });

// Error toast with longer duration
showToast({
  variant: 'error',
  message: 'Something went wrong.',
  duration: 6000,
});

// Info toast
showToast({ variant: 'info', message: 'Update available.' });
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `success \| error \| warning \| info` | `info` | Visual style of the toast |
| `message` | `string` | — | Text content of the toast |
| `duration` | `number` | `4000` | Auto-dismiss delay in milliseconds |
| `dismissible` | `boolean` | `true` | Shows a close button for manual dismissal |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `bq-close` | — | Fired when the toast is dismissed (auto or manual) |

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | Optional custom content for the toast body |

## CSS Parts

| Part | Description |
|------|-------------|
| `toast` | The toast container |
| `content` | The toast content container |
