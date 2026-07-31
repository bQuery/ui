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

That stylesheet is plain CSS with no exotic selectors. The previous approach
relied on `:host-context()`, which exists only in Chromium; worse, it appeared
in a selector list alongside `:host([data-theme="dark"])`, and one unknown
selector invalidates the entire list — so Firefox and Safari dropped the whole
dark theme. The channel works in every browser.

If you need to install the stylesheet into another document — an iframe or a
popup window — call it yourself:

```typescript
import { installThemeStyles } from '@bquery/ui/theme';

installThemeStyles(iframe.contentDocument);
```

## Custom dark tokens

Override any token for one scheme by writing the rule against the attribute:

```css
[data-theme='dark'] {
  --bq-color-primary-600: #818cf8;
  --bq-surface-overlay: #111827;
}
```

To override a token in *both* schemes, set it on `:root` instead — see
[Theming](/guide/theming).
