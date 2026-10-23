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

**`connected()` runs twice.** The runtime mounts an element from
`attributeChangedCallback` during upgrade, and the `connectedCallback` that
follows sees it already mounted and takes its reconnect path — so any element
carrying an observed attribute in the initial HTML runs `connected()` a second
time. `bind()` absorbs that: calling it again unwinds the previous scope, so
exactly one set of listeners stays live. Consequences to respect:

- Call `bind()` **once**, at the top of `connected()`. Use `scopeOf(owner)` to
  add teardown from another hook.
- `connected()` must be safe to run twice for everything it does *besides*
  registering on the scope. Anything not on the scope — a `queueMicrotask` that
  mutates light DOM, an event dispatched on connect — will happen twice.

This is what made `bq-dropdown-menu` toggle twice per click and never open.

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

Since bQuery 1.18 a re-render morphs the existing shadow tree in place
(`renderStrategy: 'morph'`), so the focused node usually survives. The peer
range still includes 1.15–1.17, which render by assigning
`shadowRoot.innerHTML` and destroy the node the user is in, so any component
with a focusable element inside its shadow root still wants the packaged
treatment:

```ts
connected()    { trackFocus(host(this), bind(this)); },
beforeUpdate() { markFocus(this); },
updated()      { restorePreservedFocus(this); },
```

`trackFocus` records the focus position from a handful of events in the
**capture** phase, so the snapshot is taken before the component's own handler
runs. `beforeUpdate` covers attribute-driven renders, which no event precedes.
`setState` renders skip `beforeUpdate` entirely, which is why the event-driven
half is needed at all. `restorePreservedFocus` does nothing while something in
the tree still has focus, so it is harmless under morph. A roving tab stop
(tree nodes, calendar days) must therefore move focus itself in `updated()`
when focus sits on an item other than the active one: under morph the old item
keeps focus.

### Tinted surfaces

Never paint a background from a 50/100/200 palette step. Those are *light*
colours in both schemes, so a badge or an alert built on them stays near-white
on a dark page — which is how alerts, badges, chips, avatars and tags all
shipped broken in dark mode. Use `--bq-intent-{primary|success|danger|warning|
info|neutral}-{bg|fg|border}`, which flip with the scheme.
`tests/component-css.test.ts` fails the build on a violation.

### Theming across the shadow boundary

Semantic tokens resolve through a scheme channel — `--bq-bg-base:
var(--bq-scheme-bg-base, #fff)` — so a document-level `data-theme` can reach
into shadow roots. Do not "simplify" that away: a plain `:host` definition
cannot be overridden by an ancestor, and `:host-context()` only exists in
Chromium. See `src/theme/scheme.ts`.

### Shadow-DOM state and re-renders

Write components so they behave the same under both render strategies:

- **Morph (bQuery ≥ 1.18, the default).** Nodes are reused. Attributes are
  diffed against the *previous render*, so an attribute set or removed at
  runtime survives until the template changes that attribute, and a form
  control's `value`/`checked` property is only written when the rendered
  attribute changes. A render with identical markup skips the DOM write
  entirely. Children the template does not contain are removed.
- **Replace (bQuery 1.15–1.17, still in the peer range).** Every render
  replaces the shadow root's contents.

Consequences:

- Anything written into the shadow root imperatively (for example the
  file-upload file list, or the avatar-group overflow counter, which depend on
  light-DOM children that `render` cannot see) must be repainted from
  `updated()`.
- Never rely on a re-render to throw away what the user typed. When a control
  normalizes or rejects input and the committed value may equal the previous
  one (a pin-input cell rejecting a letter, a number-input clamped back to its
  max), write the normalized value into the control's property yourself.
- Listeners on shadow-root children must be bound once (or delegated to the
  shadow root, as most components do); never re-bind them in `updated()`.

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
