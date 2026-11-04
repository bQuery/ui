# Button

The `bq-button` component is a versatile, accessible button element supporting multiple variants, sizes, loading states, accessible naming overrides, and icon slots.

## Basic Usage

```html
<bq-button>Click me</bq-button>
<bq-button variant="secondary">Secondary</bq-button>
<bq-button variant="outline">Outline</bq-button>
<bq-button variant="ghost">Ghost</bq-button>
<bq-button variant="danger">Delete</bq-button>
```

## Sizes

```html
<bq-button size="sm">Small</bq-button>
<bq-button size="md">Medium</bq-button>
<bq-button size="lg">Large</bq-button>
<bq-button size="xl">Extra Large</bq-button>
```

## Loading State

```html
<bq-button loading>Loading…</bq-button>
```

When `loading` is enabled, the inner control exposes `aria-busy="true"` and adds a localized screen-reader-only loading announcement.

## Disabled State

```html
<bq-button disabled>Disabled</bq-button>
```

## As a Link

```html
<bq-button href="https://example.com" target="_blank">
  Open link
</bq-button>
```

Links opened in a new tab automatically receive `rel="noopener noreferrer"`.

## With Icons (Slots)

```html
<bq-button>
  <span slot="prefix-icon">⬆</span>
  Upload
</bq-button>

<bq-button variant="outline">
  Download
  <span slot="suffix-icon">⬇</span>
</bq-button>
```

If you need an icon-only action, prefer [`bq-icon-button`](/components/icon-button). If you intentionally render `bq-button` without visible text, provide a `label` so assistive technologies still announce a meaningful name.

```html
<bq-button label="Refresh results">
  <span slot="prefix-icon" aria-hidden="true">↻</span>
</bq-button>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `primary \| secondary \| outline \| ghost \| danger` | `primary` | Visual style |
| `size` | `sm \| md \| lg \| xl` | `md` | Button size |
| `disabled` | `boolean` | `false` | Disables interaction |
| `loading` | `boolean` | `false` | Shows spinner, disables interaction |
| `type` | `button \| submit \| reset` | `button` | `submit` / `reset` submit or reset the surrounding `<form>`, like a native button |
| `form` | `string` | — | `id` of the `<form>` to submit or reset when the button is not inside it |
| `href` | `string` | — | Renders as `<a>` when set |
| `target` | `string` | — | Link target (used with `href`) |
| `label` | `string` | — | Optional accessible label override, especially useful for icon-only usage |
| `full-width` | `boolean` | `false` | Stretch to the width of the container |
| `pill` | `boolean` | `false` | Fully rounded ends |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `bq-click` | `{ originalEvent: MouseEvent }` | Fired on click (not fired when disabled/loading). Cancelable: `preventDefault()` stops a `submit` / `reset` button from acting on its form |

## Forms

The native `<button>` lives in the shadow root, where it has no form owner, so
`bq-button` forwards `type="submit"` and `type="reset"` to the host's form
itself. The form's `submit` event fires as usual (with validation, through
`requestSubmit()`):

```html
<form id="search">
  <bq-input name="q" label="Search"></bq-input>
  <bq-button type="submit">Search</bq-button>
</form>
```

Pressing Enter in `bq-input` or `bq-number-input` submits the form too, as in a
native text field: the form's first submit button is used, nothing happens if
that button is disabled, and a form without one is submitted directly.

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | Button label / content |
| `prefix-icon` | Icon before the label |
| `suffix-icon` | Icon after the label |

## CSS Parts

| Part | Description |
|------|-------------|
| `button` | The inner `<button>` or `<a>` element |

## Accessibility Notes

- Use the default slot for the visible button text whenever possible.
- Provide `label` when the control has no visible text content.
- Loading buttons keep their current content visible, set `aria-busy`, and expose a localized loading announcement for assistive technologies.
