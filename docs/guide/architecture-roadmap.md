# Architecture, Gap Analysis, and Roadmap

This page summarizes the current state of `@bquery/ui`, the research-informed gap analysis for the library’s next phase, and the first implementation batch landed in this update.

## Current State Analysis

`@bquery/ui` already ships a strong cross-framework base:

- a broad core set of actions, forms, overlays, navigation, and feedback components,
- a reusable token and theme system with dark mode support,
- localized defaults through `src/i18n`,
- and focused accessibility utilities for focus management, live regions, and overlay behavior.

### Current strengths

- **Accessible foundation**: overlays, tabs, tables, and form controls already expose meaningful keyboard and ARIA behavior.
- **Consistent design primitives**: tokens and theme helpers provide a shared visual language instead of one-off component colors.
- **Framework portability**: the custom-element architecture keeps the library usable in Angular, React, Vue, Svelte, and plain HTML.
- **Good documentation/testing baseline**: VitePress, Storybook, and Bun-based component tests are already in place.

### Current constraints

- Components are mostly **single-file implementations**, so new patterns should stay simple and composable instead of adding deep abstraction layers prematurely.
- The library is strong in core controls but still lighter in **composite app patterns** such as segmented controls, advanced selects, command bars, and richer data views.
- The current docs explain individual APIs well, but the library benefits from more pages that explain **architecture and product direction**.

## Research-Informed Gap Analysis

Reviewing mature systems such as Radix UI, shadcn/ui, Chakra UI, Mantine, Material UI, Ant Design, Headless UI, and React Aria highlights a few recurring expectations:

### Essential next additions

- **Compact single-choice controls** like segmented controls and toggle groups
- **Richer menu behaviors** such as typeahead and tighter keyboard ergonomics
- **More composable app-shell and settings primitives**
- **Higher-level data controls** like richer tables, column controls, and filtering patterns

### High-value improvements

- Better **keyboard parity** across all navigation and overlay components
- More **documentation pages for architecture, roadmap, theming, and usage patterns**
- Continued refinement of **mobile-friendly sizing, focus behavior, and RTL-aware navigation**
- More **dashboard and summary primitives** that help product teams build real application surfaces instead of only low-level controls

### Advanced future opportunities

- Date and time primitives
- Command palette and workspace navigation patterns
- Multi-select and richer combobox behavior
- Split layouts, resizable panels, and app-shell primitives

## Prioritized Roadmap

### 1. Strengthen navigation and selection primitives

Add compact view/filter controls and improve keyboard ergonomics for menu-like components.

### 2. Expand composable form building blocks

Prioritize segmented control, richer select patterns, and advanced field composition before heavier enterprise widgets.

### 3. Grow app-scale patterns

Add settings-page primitives, command surfaces, responsive navigation helpers, and more structured documentation recipes.

### 4. Deepen data-heavy capabilities

Iterate on the table with more controls and patterns instead of jumping straight to a full enterprise grid.

## First High-Value Batch Implemented Here

This update focuses on a coherent, maintainable first batch:

1. **New `bq-segmented-control` component**
   - compact single-selection control,
   - radio-group accessibility semantics,
   - keyboard support,
   - form participation,
   - sizing and full-width options for mobile-friendly layouts.

2. **Improved `bq-dropdown-menu` keyboard UX**
   - adds **typeahead navigation** for faster action discovery in larger menus.

3. **Documentation improvements**
   - new segmented-control reference page,
   - this architecture and roadmap guide,
   - updated catalog/sidebar coverage,
   - updated dropdown-menu keyboard guidance.

## Why this batch matters

This batch improves the library in a way that mirrors mature UI ecosystems without overextending the architecture:

- it adds a missing **foundational choice primitive**,
- strengthens an existing **overlay/navigation component**,
- and improves documentation so the library feels more like an intentional platform than a loose collection of widgets.

## Latest High-Value Batch

This follow-up batch focuses on a missing dashboard primitive that appears consistently across mature design systems and admin-oriented UI libraries:

1. **New `bq-stat-card` component**
   - purpose-built for KPI summaries, health metrics, and compact dashboard cards,
   - supports loading state, trend styling, icon composition, and mobile-friendly compact sizing,
   - stays aligned with the existing token system and localization strategy.

2. **Documentation updates**
   - new `bq-stat-card` reference page,
   - updated component catalog and sidebar coverage,
   - refreshed roadmap language to call out dashboard/data-summary primitives as a current priority.

## Recommended Next Steps

- Add a composable **combobox / rich select** next.
- Expand **table recipes** and column-control patterns.
- Add more **layout and workspace primitives** for responsive app shells and settings pages.
- Continue auditing older components for shared size/variant/state consistency.
- Build on `bq-stat-card` with companion dashboard patterns such as activity feeds, metric groups, and master-detail analytics layouts.
