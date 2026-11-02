# Changelog

All notable changes to `@bquery/ui` are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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

- **Storybook**: components render again in the built Storybook. `sideEffects` in `package.json` only listed `dist/` files, so the production build dropped `.storybook/preview.ts`'s `import '../src/index.js'` as side-effect free and no element was ever registered. Source files are now listed too; the published package (which ships only `dist/`) is unaffected.

- **`bq-pin-input`**: a rejected character stays out of the cell even when the code does not change. Typing a letter into a numeric cell that already held a digit used to leave the letter on screen under bQuery 1.18, because a render with unchanged markup no longer rewrites the cells.
- **`bq-number-input`**: a typed value that is clamped back to the current value is shown normalized. Typing `999` into a field already at its `max` of `10` used to keep showing `999` under bQuery 1.18.
- **`bq-tree`**: arrow keys, Home/End and type-ahead move keyboard focus to the newly active node. Before, only the roving `tabindex` moved and focus stayed on the previous node (with every bQuery version).
- **`bq-date-picker`**: arrow-key navigation in the calendar moves focus to the new cursor day. Before, focus stayed on the previous day under bQuery 1.18, and on 1.15–1.17 it jumped to the first day of the grid.

### Documentation

- `AGENT.md` describes how components must behave under both render strategies (morph in 1.18, replace in 1.15–1.17).
