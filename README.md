# @bquery/ui

[![Repo](https://img.shields.io/badge/github-bquery%2Fui-24292f?logo=github)](https://github.com/bQuery/ui)
[![Stars](https://img.shields.io/github/stars/bquery/ui?style=flat&logo=github)](https://github.com/bQuery/ui/stargazers)
[![Issues](https://img.shields.io/github/issues/bquery/ui?style=flat&logo=github)](https://github.com/bQuery/ui/issues)
[![License](https://img.shields.io/github/license/bquery/ui?style=flat)](https://github.com/bQuery/ui/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/@bquery/ui)](https://www.npmjs.com/package/@bquery/ui)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@bquery/ui)](https://bundlephobia.com/package/@bquery/ui)
[![unpkg](https://img.shields.io/badge/unpkg-browse-blue?logo=unpkg)](https://unpkg.com/@bquery/ui)
[![CodeFactor](https://www.codefactor.io/repository/github/bquery/ui/badge)](https://www.codefactor.io/repository/github/bquery/ui)
[![JsDelivr](https://data.jsdelivr.com/v1/package/npm/@bquery/ui/badge)](https://www.jsdelivr.com/package/npm/@bquery/ui)

`@bquery/ui` is a production-grade component library built with native Web Components, Shadow DOM, and TypeScript on top of `@bquery/bquery` for the bQuery ecosystem.

It is designed to give teams the kind of component coverage, polish, accessibility, and framework interoperability that developers expect from established libraries such as Material UI, Vuetify, Angular Material, and modern Vue/Svelte UI kits—while staying framework-agnostic and standards-based.

## Highlights

- **Reusable UI components** spanning actions, forms, navigation, data display, overlays, and feedback
- **Framework-agnostic** usage in plain HTML, React, Vue, Angular, Svelte, and other Custom Element-capable runtimes
- **Accessible by default** with keyboard support, ARIA roles, focus management, and screen reader announcements
- **Themeable via design tokens** and CSS custom properties
- **Tree-shakeable ESM exports** with per-component imports
- **Browser-ready UMD and IIFE bundles** for direct CDN delivery
- **Built-in dark mode, i18n, and event-driven APIs**

## Component Coverage

The current library covers the core component categories developers expect from modern UI libraries:

| Category         | Components                                                     |
| ---------------- | -------------------------------------------------------------- |
| **Actions**      | Button, Icon Button                                            |
| **Forms**        | Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Chip |
| **Navigation**   | Tabs, Accordion, Breadcrumbs, Pagination                       |
| **Data Display** | Card, Badge, Avatar, Table, Divider, Empty State, Stat Card    |
| **Feedback**     | Alert, Progress, Spinner, Skeleton, Tooltip, Toast             |
| **Overlays**     | Dialog, Drawer, Dropdown Menu                                  |

For the full catalog and feature coverage, see [`docs/components/index.md`](./docs/components/index.md).

## Quick Start

### Install

```bash
npm install @bquery/ui
```

If your package manager does not automatically resolve peer dependencies, install `@bquery/bquery` alongside `@bquery/ui`.

### Import once

```ts
import '@bquery/ui';
```

### Use in HTML

```html
<bq-button variant="primary">Save changes</bq-button>
<bq-input label="Email" type="email" placeholder="you@example.com"></bq-input>
<bq-alert variant="success" title="Profile updated">
  Your changes have been saved successfully.
</bq-alert>
```

### Use in the browser without a bundler

```html
<!-- UMD -->
<script src="https://cdn.jsdelivr.net/npm/@bquery/ui@1.9.0/dist/index.umd.js"></script>

<!-- IIFE -->
<script src="https://cdn.jsdelivr.net/npm/@bquery/ui@1.9.0/dist/index.iife.js"></script>
```

The UMD and IIFE bundles register all components on load and expose the library on `window.BQueryUI`.
For ESM-based app builds, prefer importing `@bquery/ui` from your bundler or other module-aware build tool.

## Current release snapshot

The current release (`1.9.0`) emphasizes:

- **Import-based registration as the canonical integration path.** Import `@bquery/ui` once to register all components, or import `@bquery/ui/components/<name>` to register only the wrappers you need.
- **A clearer shared package surface.** `@bquery/ui/tokens`, `@bquery/ui/theme`, `@bquery/ui/i18n`, `@bquery/ui/utils`, and `@bquery/ui/register` are all explicit entry points.
- **Broader accessibility and localization coverage.** Recent releases improved accordion semantics, live form-field counters, localized table states, chip keyboard behavior, and reduced-motion-aware overlay transitions.
- **A larger production-ready catalog.** The package now spans 31 web components across actions, forms, navigation, data display, feedback, and overlays, including `bq-dropdown-menu`, `bq-stat-card`, and the imperative toast API.
- **Aligned docs and browser bundles.** Version-pinned CDN snippets, migration guidance, and Storybook/VitePress references now target `1.9.0`.

## Tree-Shakeable Usage

Import only the component entry points you need for the smallest bundle:

```ts
import '@bquery/ui/components/button';
import '@bquery/ui/components/input';
import '@bquery/ui/components/dialog';
```

## Migration Notes

This import-based registration update changes how consumers integrate `@bquery/ui`.

- Importing `@bquery/ui` now registers all custom elements as a side effect.
- Importing `@bquery/ui/components/<name>` registers only that component through its wrapper entrypoint.
- Legacy root-level component registration helpers such as `registerBqButton` are no longer re-exported from `@bquery/ui`.
- The deprecated `registerAll()` named export still exists for backwards compatibility and can be imported from `@bquery/ui` or explicitly from `@bquery/ui/register`.
- New code should avoid `registerAll()` and rely on import side effects instead.
- Calling `registerAll()` without arguments is still accepted for temporary backward compatibility, but it does not perform any additional registration work.
- Passing any legacy options object to `registerAll()` continues to emit a warning.

For example, older calls such as `registerAll({ prefix: 'ACME' })` now warn because components self-register on import as `bq-*`.
The supported replacement is importing `@bquery/ui` once, or only the specific `@bquery/ui/components/<name>` entrypoints you need.

If you previously imported component registration helpers from the package root, migrate those imports to either:

```ts
import '@bquery/ui';
```

or the specific component entrypoints you need:

```ts
import '@bquery/ui/components/button';
import '@bquery/ui/components/input';
```

## Cross-Framework Support

Because the library is built on Web standards, the same components can be used across major frontend frameworks.

| Framework               | Integration note                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| **React**               | Import the library once and subscribe to custom events through refs or wrapper components |
| **Vue**                 | Use components directly in templates and listen to `bq-*` custom events                   |
| **Angular**             | Enable `CUSTOM_ELEMENTS_SCHEMA` and use `bq-*` elements like native controls              |
| **Svelte**              | Register once during `onMount` and bind to custom events with `on:bq-*`                   |
| **Plain HTML / bQuery** | Works out of the box after a single import                                                |

See [`docs/guide/framework-integration.md`](./docs/guide/framework-integration.md) for examples.
For migration guidance from older registration patterns, see [`docs/guide/migration-from-1-1-0.md`](./docs/guide/migration-from-1-1-0.md).

## Core Capabilities

### Accessibility

- Semantic roles and ARIA attributes
- Keyboard interactions for tabs, dialogs, accordions, sliders, and other interactive controls
- Focus trapping and focus restoration for overlays
- `aria-live` support for alerts and toasts

### Theming

- CSS custom properties for colors, spacing, typography, radius, shadows, motion, and z-index
- Light and dark themes
- `::part()` support for targeted customization

### Internationalization

- User-facing strings run through the library i18n system
- Locale overrides supported through exported utilities

### Developer Experience

- TypeScript typings included
- Structured `bq-*` custom events
- Consistent slot and part APIs
- Storybook stories and VitePress docs

## Documentation

- [Getting started](./docs/guide/getting-started.md)
- [Installation](./docs/guide/installation.md)
- [Migration from 1.1.0](./docs/guide/migration-from-1-1-0.md)
- [Framework integration](./docs/guide/framework-integration.md)
- [Theming](./docs/guide/theming.md)
- [Dark mode](./docs/guide/dark-mode.md)
- [Accessibility](./docs/guide/accessibility.md)
- [Internationalization](./docs/guide/i18n.md)
- [Component catalog](./docs/components/index.md)
- [Button reference](./docs/components/button.md)
- [Input reference](./docs/components/input.md)
- [Card reference](./docs/components/card.md)

## Local Development

```bash
bun install --frozen-lockfile
npm run dev
```

If Bun is not installed globally in your environment, use `npx bun install --frozen-lockfile` for setup and `npx bun test` for tests. See [`AGENT.md`](./AGENT.md) for the full non-global Bun workflow.

### Available scripts

```bash
npm run build          # build library + type declarations
npm run build:docs     # build VitePress documentation
npm run storybook      # run Storybook locally
npm run build:storybook
npm run lint:types     # TypeScript type-check
npm run test           # Bun test suite
```

## Project Structure

```text
src/
  components/          # Web components
  tokens/              # design tokens
  theme/               # theme helpers and CSS variables
  i18n/                # localization utilities
  utils/               # shared helpers
docs/                  # VitePress documentation
stories/               # Storybook stories
tests/                 # component and utility tests
```

## Contributing

Contributions that improve component quality, accessibility, theming, documentation, and cross-framework ergonomics are welcome.

When contributing:

1. Keep changes focused and consistent with the existing component patterns.
2. Validate type safety, documentation, and affected component behavior.
3. Prefer additions that improve accessibility, composability, or API consistency.
4. If you are working as an automated coding agent, follow the repository-specific guidance in [`AGENT.md`](./AGENT.md), including the canonical Bun workflow.

## License

[MIT](./LICENSE)
