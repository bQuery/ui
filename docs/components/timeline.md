# Timeline

The `bq-timeline` component lists events in order along a connecting line — activity feeds, audit logs, release histories.

## Basic Usage

```html
<bq-timeline>
  <bq-timeline-item headline="Order placed" timestamp="Mar 1" datetime="2026-03-01">
    Payment authorized.
  </bq-timeline-item>
  <bq-timeline-item headline="Shipped" timestamp="Mar 3" datetime="2026-03-03" variant="info">
    Left the warehouse.
  </bq-timeline-item>
  <bq-timeline-item headline="Delivered" timestamp="Mar 5" datetime="2026-03-05" variant="success" last>
    Signed for by A. Berger.
  </bq-timeline-item>
</bq-timeline>
```

Mark the final entry with `last` to drop its trailing connector.

## Variants

The marker colour communicates the kind of event:

```html
<bq-timeline-item variant="primary" headline="Created"></bq-timeline-item>
<bq-timeline-item variant="success" headline="Approved"></bq-timeline-item>
<bq-timeline-item variant="warning" headline="Needs review"></bq-timeline-item>
<bq-timeline-item variant="danger"  headline="Rejected"></bq-timeline-item>
<bq-timeline-item variant="info"    headline="Commented"></bq-timeline-item>
<bq-timeline-item variant="neutral" headline="Archived"></bq-timeline-item>
```

## Compact Spacing

```html
<bq-timeline variant="compact">…</bq-timeline>
```

## Custom Markers

```html
<bq-timeline-item headline="Deployed">
  <span slot="marker">🚀</span>
  Release 1.15.0 is live.
</bq-timeline-item>
```

## Properties

### `bq-timeline`

| Property  | Type     | Default     | Description                    |
| --------- | -------- | ----------- | ------------------------------ |
| `variant` | `string` | `'default'` | `default` \| `compact`         |
| `align`   | `string` | `'start'`   | `start` \| `alternate`         |
| `label`   | `string` | `''`        | Accessible label for the list  |

### `bq-timeline-item`

| Property    | Type      | Default     | Description                                                             |
| ----------- | --------- | ----------- | ----------------------------------------------------------------------- |
| `variant`   | `string`  | `'primary'` | `primary` \| `success` \| `danger` \| `warning` \| `info` \| `neutral`  |
| `headline`  | `string`  | `''`        | Item title                                                              |
| `timestamp` | `string`  | `''`        | Human-readable timestamp                                                |
| `datetime`  | `string`  | `''`        | Machine-readable value for the `<time>` element                         |
| `last`      | `boolean` | `false`     | Hide the trailing connector                                             |

## Slots

| Slot        | Element            | Description             |
| ----------- | ------------------ | ----------------------- |
| *(default)* | `bq-timeline`      | `bq-timeline-item` elements |
| *(default)* | `bq-timeline-item` | Item body               |
| `marker`    | `bq-timeline-item` | Custom marker content   |

## CSS Parts

| Part        | Description                |
| ----------- | -------------------------- |
| `timeline`  | The `<ol>` container       |
| `item`      | An individual `<li>`       |
| `marker`    | The event marker           |
| `connector` | The line below the marker  |
| `content`   | Item content wrapper       |
| `headline`  | Item title                 |
| `timestamp` | The `<time>` element       |
| `body`      | Item body wrapper          |

## Accessibility

- The timeline renders a real `<ol>` and each item an `<li>`, so order and item count are announced.
- Set `datetime` alongside `timestamp` to expose a machine-readable date on the `<time>` element.
- Marker colour is decorative: keep the meaning of an event in its headline or body text.
