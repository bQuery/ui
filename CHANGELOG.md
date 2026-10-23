# Changelog

All notable changes to `@bquery/ui` are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- **Dependencies**: the `@bquery/bquery` dev dependency is now `^1.18.0`, so tests, Storybook, the docs and the bundled CDN builds (`index.umd.js` / `index.iife.js`) use bQuery 1.18.0. In 1.18 component re-renders morph the existing shadow tree instead of replacing `innerHTML`: input values, focus, caret and nested elements survive an update. The peer dependency stays `^1.15.1`. The library uses no 1.18-only API, and the fixes below work with both rendering strategies. The full test suite passes against 1.15.1 and 1.18.0.

### Fixed

- **`bq-pin-input`**: a rejected character stays out of the cell even when the code does not change. Typing a letter into a numeric cell that already held a digit used to leave the letter on screen under bQuery 1.18, because a render with unchanged markup no longer rewrites the cells.
- **`bq-number-input`**: a typed value that is clamped back to the current value is shown normalized. Typing `999` into a field already at its `max` of `10` used to keep showing `999` under bQuery 1.18.
- **`bq-tree`**: arrow keys, Home/End and type-ahead move keyboard focus to the newly active node. Before, only the roving `tabindex` moved and focus stayed on the previous node (with every bQuery version).
- **`bq-date-picker`**: arrow-key navigation in the calendar moves focus to the new cursor day. Before, focus stayed on the previous day under bQuery 1.18, and on 1.15–1.17 it jumped to the first day of the grid.

### Documentation

- `AGENT.md` describes how components must behave under both render strategies (morph in 1.18, replace in 1.15–1.17).
