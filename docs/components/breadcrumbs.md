# Breadcrumbs

The `bq-breadcrumbs` component renders a navigation trail with auto-inserted separators and marks the last item as the current page.

## Basic Usage

```html
<bq-breadcrumbs>
  <a href="/">Home</a>
  <a href="/products">Products</a>
  <a href="/products/widgets">Widgets</a>
</bq-breadcrumbs>
```

## Custom Separator

```html
<bq-breadcrumbs separator="›">
  <a href="/">Home</a>
  <a href="/docs">Docs</a>
  <a href="/docs/api">API</a>
</bq-breadcrumbs>
```

## Properties

| Property    | Type     | Default | Description                 |
| ----------- | -------- | ------- | --------------------------- |
| `separator` | `string` | `'/'`   | Separator character or text |

## Slots

| Slot        | Description                       |
| ----------- | --------------------------------- |
| *(default)* | Navigation links (`<a>` elements) |

## CSS Parts

| Part   | Description                   |
| ------ | ----------------------------- |
| `nav`  | The `<nav>` wrapper           |
| `list` | The breadcrumb list container |

## CSS Custom Properties

| Property                    | Default | Description                                                                                           |
| --------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `--bq-breadcrumb-separator` | `"/"`   | CSS `content` value used between items. Override directly when not setting the `separator` attribute. |

```css
bq-breadcrumbs {
  --bq-breadcrumb-separator: "›";
}
```

## Accessibility

The last breadcrumb item is automatically marked with `aria-current="page"`. The component renders inside a `<nav>` with an appropriate `aria-label`. Separators are produced via a CSS `::before` pseudo-element so they are visible but **not part of the DOM** — keeping them out of copy/paste output and assistive-technology readings.
