# Dark Mode

`@bquery/ui` switches colour scheme with the `data-theme` attribute. Put it on
`<html>` for the whole page, or on any element to theme just that subtree.

```html
<html data-theme="dark">
  <!-- every bq-* element below uses dark tokens -->
</html>
```

`data-theme` takes three values:

| Value    | Meaning                                        |
| -------- | ---------------------------------------------- |
| `dark`   | Dark, regardless of the operating system        |
| `light`  | Light, regardless of the operating system       |
| `auto`   | Follows `prefers-color-scheme`, live            |

## From JavaScript

```typescript
import { setColorScheme, getResolvedColorScheme } from '@bquery/ui/theme';

setColorScheme('auto');   // follow the OS
setColorScheme('dark');   // pin dark
setColorScheme('light');  // pin light

getResolvedColorScheme(); // 'light' | 'dark' — what is actually showing
```

`auto` is resolved in CSS with a `prefers-color-scheme` media query, so a
system-level switch repaints the page immediately with no JavaScript listening
for the change — and there is no `matchMedia` subscription to leak.

## Theming part of a page

Because the scheme is inherited, a themed island needs no API at all:

```html
<body data-theme="light">
  <aside data-theme="dark">
    <bq-button>Dark sidebar</bq-button>
  </aside>
</body>
```

## Native controls follow too

Each scheme also sets the CSS `color-scheme` property, so scrollbars, the
native date and colour pickers, and form-control defaults inside your page
match the theme instead of staying stubbornly light.

## How it works

A component defines its tokens on its own `:host`, and a value set on an
element always beats one inherited from an ancestor — which is why setting
`--bq-bg-base` on `<html>` cannot re-theme a component on its own.

So components resolve every semantic token through a *scheme channel*:

```css
:host {
  --bq-bg-base: var(--bq-scheme-bg-base, #ffffff);
}
```

`--bq-scheme-bg-base` is never defined on the host, so it resolves the ordinary
way — by inheritance from the document. A small stylesheet, installed
automatically the first time any component module is imported, defines the
channel for each `data-theme` value.

That stylesheet is plain CSS with no exotic selectors, and it is the only way
an ancestor's `data-theme` reaches a component. Earlier releases also used
`:host-context()`, which exists only in Chromium and set the dark tokens as
literals there — so a custom `--bq-scheme-*` palette worked in Firefox and
Safari but was replaced by the stock one in Chrome and Edge. Since 1.17.0 the
channel is the single path, and it behaves the same in every browser. The
brighter dark accents (`--bq-color-*-600`) and dark shadows (`--bq-shadow-*`)
go through it too.

A component that carries `data-theme="dark"` itself is dark even without the
stylesheet; with it, a page's own dark palette (below) applies to that
component too.

Document styles do not reach into a shadow root. If your application renders
inside its own shadow DOM and sets `data-theme` there, install the stylesheet
into that root as well:

```typescript
import { installThemeStyles } from '@bquery/ui/theme';

installThemeStyles(appHost.shadowRoot!);
```

Chromium used to cover that case through `:host-context()`; other browsers
never did.

If you need to install the stylesheet into another document — an iframe or a
popup window — call it yourself:

```typescript
import { installThemeStyles } from '@bquery/ui/theme';

installThemeStyles(iframe.contentDocument);
```

## Custom dark tokens

Re-theme a scheme by setting its channel values against the attribute. The
library's own rules use `:where()`, so any rule of yours wins regardless of
stylesheet order:

```css
[data-theme='dark'] {
  --bq-scheme-bg-base: #0b1020;
  --bq-scheme-surface-overlay: #111827;
  --bq-scheme-color-primary-600: #818cf8;
}
```

Semantic tokens (`bg-*`, `surface-*`, `text-*`, `border-*`, `focus-ring*`,
`intent-*`) and the dark-adjusted accents and shadows (`color-primary-600`,
`color-primary-700`, `color-danger-600`, `color-success-600`,
`color-warning-600`, `shadow-*`) all have a `--bq-scheme-*` channel.

To override a token in *both* schemes, set it on `:root` instead — see
[Theming](/guide/theming).
