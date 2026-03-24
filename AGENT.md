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
