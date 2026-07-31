# Banner

The `bq-banner` component is a full-width, page-level announcement — maintenance notices, trial expiry, cookie policies.

Use `bq-alert` for messages scoped to a section of the page, and `bq-toast` for transient notifications.

## Basic Usage

```html
<bq-banner variant="info">Scheduled maintenance on Sunday, 02:00–04:00 UTC.</bq-banner>
```

## Variants

```html
<bq-banner variant="info">New workspace settings are available.</bq-banner>
<bq-banner variant="success">Your plan was upgraded.</bq-banner>
<bq-banner variant="warning">Your trial ends in 3 days.</bq-banner>
<bq-banner variant="danger">We could not process your last payment.</bq-banner>
<bq-banner variant="neutral">This workspace is read-only.</bq-banner>
```

## Dismissible

```html
<bq-banner variant="warning" dismissible>
  Your trial ends in 3 days.
</bq-banner>
```

`bq-dismiss` is cancelable. Call `preventDefault()` to keep the banner mounted — for example to persist the dismissal first, or to run your own exit animation:

```js
banner.addEventListener('bq-dismiss', (event) => {
  event.preventDefault();
  savePreference('trial-banner-dismissed').then(() => banner.remove());
});
```

## Icon and Actions

```html
<bq-banner variant="warning" dismissible>
  <span slot="icon">⚠️</span>
  Your trial ends in 3 days.
  <bq-button slot="actions" size="sm">Upgrade</bq-button>
</bq-banner>
```

## Sticky

```html
<bq-banner variant="info" sticky>This banner stays at the top while scrolling.</bq-banner>
```

## Properties

| Property      | Type      | Default  | Description                                                    |
| ------------- | --------- | -------- | -------------------------------------------------------------- |
| `variant`     | `string`  | `'info'` | `info` \| `success` \| `warning` \| `danger` \| `neutral`      |
| `dismissible` | `boolean` | `false`  | Show a dismiss button                                          |
| `sticky`      | `boolean` | `false`  | Stick to the top of the viewport                               |
| `label`       | `string`  | `''`     | Accessible label for the banner region                         |

## Slots

| Slot        | Description       |
| ----------- | ----------------- |
| *(default)* | Banner message    |
| `icon`      | Leading icon      |
| `actions`   | Trailing actions  |

## Events

| Event         | Detail | Cancelable | Description                        |
| ------------- | ------ | ---------- | ---------------------------------- |
| `bq-dismiss`  | —      | Yes        | The dismiss button was activated   |

## CSS Parts

| Part      | Description             |
| --------- | ----------------------- |
| `banner`  | The banner container    |
| `icon`    | Icon wrapper            |
| `content` | Message wrapper         |
| `actions` | Actions wrapper         |
| `dismiss` | The dismiss button      |

## Accessibility

- The `danger` variant renders `role="alert"` with `aria-live="assertive"` so failures interrupt; every other variant uses `role="status"` with `aria-live="polite"`.
- Set `label` when the banner needs a name distinct from its text content.
- Keep the dismiss button reachable: it is a real `<button>` with an `aria-label` and a visible focus ring.
