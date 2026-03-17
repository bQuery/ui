# Accordion

The `bq-accordion` component is a collapsible disclosure panel with a trigger button for showing and hiding content.

## Basic Usage

```html
<bq-accordion label="More information">
  <p>Hidden content that can be toggled open or closed.</p>
</bq-accordion>
```

## Open by Default

```html
<bq-accordion label="Details" open>
  <p>This section starts expanded.</p>
</bq-accordion>
```

## Variants

```html
<bq-accordion label="Default" variant="default">…</bq-accordion>
<bq-accordion label="Bordered" variant="bordered">…</bq-accordion>
<bq-accordion label="Flush" variant="flush">…</bq-accordion>
```

## Disabled

```html
<bq-accordion label="Unavailable" disabled>…</bq-accordion>
```

## Properties

| Property   | Type      | Default     | Description                        |
| ---------- | --------- | ----------- | ---------------------------------- |
| `label`    | `string`  | —           | Trigger button text                |
| `open`     | `boolean` | `false`     | Whether the panel is expanded      |
| `disabled` | `boolean` | `false`     | Disables interaction               |
| `variant`  | `string`  | `'default'` | `default` \| `bordered` \| `flush` |

## Events

| Event       | Detail              | Description                         |
| ----------- | ------------------- | ----------------------------------- |
| `bq-toggle` | `{ open: boolean }` | Fired when the accordion is toggled |

## Slots

| Slot        | Description                       |
| ----------- | --------------------------------- |
| *(default)* | Panel content displayed when open |

## CSS Parts

| Part        | Description                  |
| ----------- | ---------------------------- |
| `accordion` | The outer container          |
| `trigger`   | The toggle button            |
| `label`     | The label text element       |
| `panel`     | The collapsible content area |
