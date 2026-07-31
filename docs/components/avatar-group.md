# Avatar Group

The `bq-avatar-group` component stacks `bq-avatar` elements and collapses the remainder into a `+N` counter.

## Basic Usage

```html
<bq-avatar-group>
  <bq-avatar initials="AB"></bq-avatar>
  <bq-avatar initials="CD"></bq-avatar>
  <bq-avatar initials="EF"></bq-avatar>
</bq-avatar-group>
```

## Overflow

Set `max` to cap how many avatars are shown. The rest are hidden in place and summarized by the counter:

```html
<bq-avatar-group max="3">
  <bq-avatar initials="AB"></bq-avatar>
  <bq-avatar initials="CD"></bq-avatar>
  <bq-avatar initials="EF"></bq-avatar>
  <bq-avatar initials="GH"></bq-avatar>
  <bq-avatar initials="IJ"></bq-avatar>
</bq-avatar-group>
```

Renders three avatars followed by `+2`.

Clicking the counter emits `bq-overflow-click`, which is a good hook for opening a full member list:

```js
group.addEventListener('bq-overflow-click', (event) => {
  console.log(`${event.detail.hidden} more people`);
});
```

## Size

`size` is forwarded to every slotted avatar, so the group stays visually consistent:

```html
<bq-avatar-group size="sm" max="3">…</bq-avatar-group>
```

## Spacing

```html
<bq-avatar-group spacing="tight">…</bq-avatar-group>
<bq-avatar-group spacing="normal">…</bq-avatar-group>
<bq-avatar-group spacing="loose">…</bq-avatar-group>
```

## Properties

| Property  | Type     | Default    | Description                                                     |
| --------- | -------- | ---------- | --------------------------------------------------------------- |
| `max`     | `number` | `0`        | Maximum avatars to show before collapsing (`0` shows all)        |
| `size`    | `string` | `''`       | `xs` \| `sm` \| `md` \| `lg` \| `xl` — forwarded to the avatars  |
| `spacing` | `string` | `'normal'` | `tight` \| `normal` \| `loose`                                   |
| `label`   | `string` | `''`       | Accessible label for the group                                   |

## Slots

| Slot        | Description        |
| ----------- | ------------------ |
| *(default)* | `bq-avatar` elements |

## Events

| Event                 | Detail               | Description                       |
| --------------------- | -------------------- | --------------------------------- |
| `bq-overflow-click`   | `{ hidden: number }` | The overflow counter was clicked  |

## CSS Parts

| Part       | Description            |
| ---------- | ---------------------- |
| `group`    | The group container    |
| `overflow` | The `+N` counter       |

## Accessibility

- The group exposes `role="group"` with an accessible name (`label`, or a localized default).
- Overflow avatars are hidden with `display: none` rather than removed, so the host page keeps ownership of its own elements.
- The counter carries an `aria-label` describing how many people are hidden.
