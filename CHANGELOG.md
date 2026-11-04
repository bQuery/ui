# Changelog

All notable changes to `@bquery/ui` are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.17.0] - 2026-11-04

### Added

- **Two-way binding** ([#26](https://github.com/bQuery/ui/issues/26)): form components have a `value` property, and `bq-checkbox`, `bq-switch` and `bq-radio` also `checked` and a `type` of `checkbox` / `radio`. Every user change fires a bubbling, composed `input` event on the element, and every committed change a `change` event, after the component's own `bq-input` / `bq-change`. bQuery's `bq-model` (and `v-model`-style bindings) now work on `bq-input`, `bq-textarea`, `bq-number-input`, `bq-select`, `bq-combobox`, `bq-date-picker`, `bq-pin-input`, `bq-rating`, `bq-segmented-control`, `bq-slider`, `bq-tag-input`, `bq-checkbox`, `bq-switch` and `bq-radio`. Setting a property fires no event, as on a native control, and a property set before the element upgrades is applied when it connects. A checkbox, switch or radio click fires exactly one `input`, with the new state, and an emptied number field reads as `''`.
- **Form reset**: form components restore the value (or checked state) they had when first connected when their form is reset — by `form.reset()`, a native reset button or `bq-button type="reset"`. A cancelled `reset` event leaves them alone.
- **`bq-button`**: `form` attribute, naming the `<form>` to submit or reset when the button is outside it. `bq-click` is now cancelable: `preventDefault()` stops a `submit` / `reset` button from acting on its form.
- **`installThemeStyles(shadowRoot)`**: installs the scheme channel into a shadow root, for apps that render inside their own shadow DOM and set `data-theme` there.
- **Utilities** in `@bquery/ui/utils`: `registerFormControl`, `formControl`, `defineFormControl`, `liveField`, `formOf`, `submitForm`, `resetForm`, `implicitSubmit` and `isSubmitKey`.
- **CI**: `bun run test:bundle` bundles every per-component entry on its own and fails if one does not register its element.

### Fixed

- **Per-component imports** ([#23](https://github.com/bQuery/ui/issues/23)): `import '@bquery/ui/components/<name>'` registered nothing in bundlers that honour `sideEffects` (esbuild, Rollup, webpack). The chunks that call `customElements.define` (`dist/Bq*.js`, `dist/toast-*.js`, and the shared `dist/styles-*.js`) were missing from `sideEffects` and were dropped as side-effect free.
- **Forms** ([#25](https://github.com/bQuery/ui/issues/25)): `bq-button type="submit"` / `type="reset"` submits / resets the surrounding form (through `requestSubmit()`, so validation and the `submit` event run as usual), unless disabled or loading. Enter in `bq-input` and `bq-number-input` submits the form like a native field: the form's first submit button — including one outside the form that names it with `form` — is clicked, so a `bq-button`'s cancelable `bq-click` runs first. Nothing happens if that button is disabled; link-mode buttons (`href`) do not count. A form without a submit button is submitted only when it has a single text-like field. `bq-number-input` commits the typed value first, as a change would (an emptied field becomes `0`). Enter during IME composition or with a modifier does not submit.
- **i18n types** ([#24](https://github.com/bQuery/ui/issues/24)): `setLocale()` rejected every translation because `BqLocale` kept the literal types of the `as const` English strings. String leaves are now `string`; unknown keys and non-string values are still errors.
- **Theming** ([#27](https://github.com/bQuery/ui/issues/27)): the Chromium-only `:host-context([data-theme="dark"])` rule is gone. It set the dark tokens as literals, so in Chrome and Edge it replaced a page's own `--bq-scheme-*` palette with the stock one. An ancestor's `data-theme` now reaches components only through the scheme channel, the same way in every browser. The dark-adjusted accents (`--bq-color-{primary-600,primary-700,danger-600,success-600,warning-600}`) and shadows (`--bq-shadow-*`) go through the channel too — before, Firefox and Safari never got them — and a light region nested in a dark one resets them. The document-level rules use `:where()`, so a page's own `[data-theme='dark'] { --bq-scheme-… }` wins even though the adopted sheet comes after it. A component carrying `data-theme="dark"` itself resolves through the channel too, with the dark values as fallbacks, so a custom dark palette reaches it. Apps that set `data-theme` inside their own shadow root now install the channel there with `installThemeStyles(shadowRoot)`; Chromium used to cover that through `:host-context()`.
- **`bq-date-picker`** ([#20](https://github.com/bQuery/ui/issues/20)): an unrelated update while the calendar is open (a `locale` or `value` change) no longer moves focus onto the cursor day. Only opening the calendar and keyboard navigation do. Keyboard navigation that stops at `min` / `max` keeps focus on the cursor without leaving a pending focus move behind, and does not pull focus out of the text field.

### Documentation

- Framework guide: two-way binding with `bq-model` and `v-model`.
- Button reference: form submission, `form`, cancelable `bq-click`.
- Dark mode guide: re-theming through the `--bq-scheme-*` channel, including accents and shadows.
- i18n guide: typing of `setLocale()`.
- `AGENT.md`: form-control conventions and the bundle check.

Tested against bQuery `1.15.1` (replacement rendering) and `1.18.0` (morph rendering).

## [1.16.0] - 2026-11-02

### Added

- **`bq-command-palette`**: a ⌘K / Ctrl+K command palette. Commands are `<option>` elements (grouped with `<optgroup>`) with optional `data-keywords`, `data-description` and `data-shortcut`. Results are ranked (prefix, word prefix, substring, keyword, then in-order letters), diacritic-insensitive. Configurable `hotkey`, cancelable `bq-select`, `keep-open`, `empty` and `footer` slots. ARIA 1.2 combobox inside a modal dialog with focus trap and restore. A modifier-free hotkey such as `/` is ignored while the user types in a text field, and keys that confirm an IME composition never run a command.
- **`bq-split-panel`**: resizable two-pane layout (horizontal or vertical) implementing the WAI-ARIA window splitter. Drag or use the arrow keys, Home/End, and Enter to collapse and restore. Supports `min`, `max`, `step`, `snap` points, RTL and a custom handle slot. Fires `bq-resize`.
- **`bq-carousel`**: WAI-ARIA carousel with previous/next buttons, slide picker, swipe, `loop`, `per-view` and `autoplay`. Off-screen slides are `inert`. Slide semantics the author already set (`role`, `aria-roledescription`, `aria-label`) are kept, and every managed attribute is restored on disconnect. Autoplay always shows a pause button, pauses on hover and focus, and does not run for users who prefer reduced motion.
- **`bq-format-number`**, **`bq-format-date`**, **`bq-relative-time`**: locale-aware formatting built on `Intl`, defaulting to the document language. `bq-format-number` supports currency, percent, units, compact notation and automatic byte units; `bq-relative-time` can keep itself up to date with `sync`. Without a `time-zone`, a date-only value such as `2024-03-01` is shown on that calendar day for every viewer (an explicit `time-zone` is honoured and may show a different day). An invalid locale tag falls back to the browser locale, and an invalid time zone is dropped while the requested locale is kept, instead of losing currency, unit or date formatting.
- **Formatting helpers** `formatNumber`, `formatDate`, `formatRelativeTime`, `parseDate`, `selectUnit`, `refreshDelay` and `resolveLocale` in `@bquery/ui/utils`.
- **Icons**: `play`, `pause`, `grip-vertical`, `grip-horizontal`.
- **i18n**: `commandPalette.*`, `splitPanel.*` and `carousel.*` strings.
- **Docs and Storybook**: reference pages and stories for `bq-combobox` and `bq-tag-input`, which had neither, and for every new component.

### Changed

- **Dependencies**: all dev dependencies updated to their latest releases — Storybook 10.6, Vite 8.3, vite-plugin-dts 5.1, ESLint 10.14, typescript-eslint 8.72, happy-dom 21, PostCSS 8.5.32, Autoprefixer 10.6, `@types/node` 26.6, `bun-types` 1.4 and `globals` 17.14. TypeScript stays on 6.0.3: typescript-eslint does not support TypeScript 7 yet.
- **`bq-tag-input`**: when `max` is reached the field becomes read-only instead of disabled and shows the localized `tagInput.limitReached` text (previously defined but never shown). Focus stays in the field, so Backspace can still remove the last tag to free a slot.

- **Dependencies**: the `@bquery/bquery` dev dependency is now `^1.18.0`, so tests, Storybook, the docs and the bundled CDN builds (`index.umd.js` / `index.iife.js`) use bQuery 1.18.0. In 1.18 component re-renders morph the existing shadow tree instead of replacing `innerHTML`: input values, focus, caret and nested elements survive an update. The peer dependency stays `^1.15.1`. The library uses no 1.18-only API, and the fixes below work with both rendering strategies. The full test suite passes against 1.15.1 and 1.18.0.

### Fixed

- **Publishing**: `package.json` now declares `repository`, `homepage`, `bugs` and `license`. npm rejected the provenance-signed publish of 1.16.0 (E422) because `repository.url` was empty and could not be matched against the GitHub repository in the provenance statement.
- **Storybook**: components render again in the built Storybook. `sideEffects` in `package.json` only listed `dist/` files, so the production build dropped `.storybook/preview.ts`'s `import '../src/index.js'` as side-effect free and no element was ever registered. Source files are now listed too; the published package (which ships only `dist/`) is unaffected.

- **`bq-pin-input`**: a rejected character stays out of the cell even when the code does not change. Typing a letter into a numeric cell that already held a digit used to leave the letter on screen under bQuery 1.18, because a render with unchanged markup no longer rewrites the cells.
- **`bq-number-input`**: a typed value that is clamped back to the current value is shown normalized. Typing `999` into a field already at its `max` of `10` used to keep showing `999` under bQuery 1.18.
- **`bq-tree`**: arrow keys, Home/End and type-ahead move keyboard focus to the newly active node. Before, only the roving `tabindex` moved and focus stayed on the previous node (with every bQuery version).
- **`bq-date-picker`**: arrow-key navigation in the calendar moves focus to the new cursor day. Before, focus stayed on the previous day under bQuery 1.18, and on 1.15–1.17 it jumped to the first day of the grid.

### Documentation

- `AGENT.md` describes how components must behave under both render strategies (morph in 1.18, replace in 1.15–1.17).
