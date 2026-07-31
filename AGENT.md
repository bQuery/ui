# Agent Guide

This repository is `@bquery/ui`, a framework-agnostic Web Components library built with TypeScript, Vite, Bun, Storybook, and VitePress.

## What lives where

- `src/components/` – component implementations
- `src/tokens/` – design tokens
- `src/theme/` – theme helpers and CSS variables
- `src/i18n/` – localization utilities
- `src/utils/` – shared helpers
- `docs/` – VitePress documentation
- `stories/` – Storybook stories
- `tests/` – Bun-based test suite

## Preferred workflow

1. Keep changes focused and consistent with existing component patterns.
2. Update documentation when behavior or public APIs change.
3. Avoid unrelated refactors while addressing a targeted issue.
4. Prefer accessibility, composability, and API consistency improvements.
5. Treat import side effects (`import '@bquery/ui'`) and per-component entrypoints (`@bquery/ui/components/<name>`) as the canonical registration model; `registerAll()` is deprecated compatibility-only.
6. When touching versioned install snippets or release-facing docs, keep pinned CDN examples aligned with the current package version in `package.json`.

## Component conventions

### Styles

Declare styles with the `css` tagged template from `@bquery/bquery/component` and
interpolate the shared fragments from `src/utils/styles.ts`:

```ts
import { component, css, html } from '@bquery/bquery/component';
import { baseStyles, fieldStyles, focusRing, reset, srOnly } from '../../utils/styles.js';

styles: css`
  ${baseStyles}
  ${reset}
  ${focusRing}
  :host { display: block; }
`
```

The fragments, and when to reach for each:

| Fragment       | Provides                                                            |
| -------------- | ------------------------------------------------------------------- |
| `baseStyles`   | Tokens + both colour schemes. Every component.                       |
| `reset`        | `box-sizing`, `[hidden]`, and the reduced-motion opt-out.            |
| `focusRing`    | The standard ring on the usual focusable elements, at zero specificity. |
| `fieldStyles`  | `.field` / `.label` / `.hint` / `.error-msg` / `.required-mark` for form controls. |
| `srOnly`       | `.sr-only`.                                                          |

**A backtick inside a CSS comment terminates the template literal.** Two
components have been broken this way; write ``accent-color`` without the
backticks inside `css` blocks.

This matters for more than tidiness. A `css` payload is handed to
`adoptedStyleSheets`, so the stylesheet is constructed **once per component and
shared by every instance**, and re-renders no longer rewrite it. A plain string
falls back to a per-instance `<style>` element whose ~5.6 KB of token/theme CSS
is duplicated per element and rewritten on every render.

Only `ComponentStyles` values survive interpolation intact — `css` escapes
interpolated *strings*, which would corrupt raw CSS. Use `rawCss()` from
`src/utils/styles.ts` to wrap CSS text generated at runtime.

### Lifecycle and teardown

Use the helpers in `src/utils/component.ts` rather than stashing handlers on the
host element:

```ts
connected() {
  const el = host<MyState>(this);      // typed setState/getState/setProp
  const scope = bind(el);
  scope.on(document, 'keydown', onKeyDown);   // removal registered for you
  scope.timeout(fn, 200);                      // cleared on disconnect
},
disconnected() {
  release(this);                               // unwinds everything
},
```

Anything reaching outside the component — `document`/`window` listeners, timers,
`MutationObserver`s, form proxies, `aria-*` written onto slotted light-DOM
elements — must be registered on the scope. `tests/component-utils.test.ts`
asserts that the overlay components leave no document listeners behind.

Use `store(owner, init)` when a value created in `connected()` has to stay
reachable from `updated()`.

### Icons

`svg` is on the sanitizer's *forbidden* list, which `sanitize.allowTags` cannot
re-open — a component can never emit inline SVG. Icons therefore live in the
stylesheet, as `mask-image` data URIs painted with `currentColor`:

```ts
import { iconCss } from '../../utils/icons.js';

styles: css`
  ${baseStyles}
  ${iconCss('chevron-down', 'x')}
`,
// render: <span class="icon" data-icon="x" aria-hidden="true"></span>
```

Name only the icons the component draws; `iconCss` emits one rule each, and the
full set is far too heavy to embed everywhere (`bq-icon` is the exception).
`iconMask(name)` returns just the mask declarations, for a `::before`/`::after`
on an element the component already renders.

`iconCss` defines a global `.icon` box inside the shadow root. A component that
already uses `.icon` for something else — a slot wrapper, say — must rename it,
or the wrapper inherits the mask box. `bq-banner` and `bq-file-upload` hit this.

### Sanitizer allowlist

Rendered markup is sanitized. The framework's base allowlist covers `part`,
`aria-*`, `data-*` and the usual form attributes, but not everything — `accept`,
`datetime`, `inputmode`, `scope`, `colspan`, `spellcheck` and `style` each
needed an explicit `sanitize.allowAttributes` entry. If an attribute silently
disappears from rendered output, this is why.

`tests/sanitizer-allowlist.test.ts` parses every render template and fails on an
attribute the sanitizer would drop, so this can no longer ship unnoticed.

### Focus across re-renders

Rendering assigns `shadowRoot.innerHTML`, so every render destroys the node the
user is in. Any component with a focusable element inside its shadow root wants
the packaged treatment:

```ts
connected()    { trackFocus(host(this), bind(this)); },
beforeUpdate() { markFocus(this); },
updated()      { restorePreservedFocus(this); },
```

`trackFocus` records the focus position from a handful of events in the
**capture** phase, so the snapshot is taken before the component's own handler
runs. `beforeUpdate` covers attribute-driven renders, which no event precedes.
`setState` renders skip `beforeUpdate` entirely, which is why the event-driven
half is needed at all.

### Theming across the shadow boundary

Semantic tokens resolve through a scheme channel — `--bq-bg-base:
var(--bq-scheme-bg-base, #fff)` — so a document-level `data-theme` can reach
into shadow roots. Do not "simplify" that away: a plain `:host` definition
cannot be overridden by an ancestor, and `:host-context()` only exists in
Chromium. See `src/theme/scheme.ts`.

### Shadow-DOM state and re-renders

Every render replaces the shadow root's contents. Anything written into the
shadow root imperatively (for example the file-upload file list, or the
avatar-group overflow counter, which depend on light-DOM children that `render`
cannot see) must be repainted from `updated()`.

## Setup and validation

Install dependencies with Bun:

```bash
bun install --frozen-lockfile
```

If Bun is not installed globally in your environment, use:

```bash
npx bun install --frozen-lockfile
```

Use these commands to validate work:

```bash
npm run lint:types
bun test                 # use `npx bun test` if Bun is not installed globally
npm run build
npm run build:docs
```

## Project-specific notes

- `bun.lock` is the source of truth for dependencies; `package-lock.json` is ignored.
- Tests preload `tests/setup.ts` through `bunfig.toml`.
- Documentation uses Markdown in `docs/` and the root `README.md`.
- Storybook stories live in `stories/` and should stay aligned with component behavior.
- The package exposes root side-effect registration plus subpath exports such as `@bquery/ui/theme`, `@bquery/ui/i18n`, `@bquery/ui/utils`, and `@bquery/ui/register`.
- VitePress base resolution lives in `docs/.vitepress/config.ts`; keep docs links relative and GitHub Pages-safe when adding new guides.
