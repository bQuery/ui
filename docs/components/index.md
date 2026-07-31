# Component Catalog

`@bquery/ui` already covers the primary component categories that teams expect from modern component libraries for Angular, React, Svelte, Vue, and plain Web Components.

This catalog gives you a complete overview of the currently available building blocks and the cross-cutting features that make them production-ready.

## Coverage at a Glance

| Category | Components |
| --- | --- |
| **Actions** | `bq-button`, `bq-icon-button`, `bq-button-group` |
| **Forms** | `bq-input`, `bq-number-input`, `bq-textarea`, `bq-select`, `bq-segmented-control`, `bq-checkbox`, `bq-radio`, `bq-switch`, `bq-slider`, `bq-chip`, `bq-rating`, `bq-file-upload` |
| **Navigation & Disclosure** | `bq-tabs`, `bq-accordion`, `bq-breadcrumbs`, `bq-pagination`, `bq-stepper` |
| **Data Display** | `bq-card`, `bq-badge`, `bq-avatar`, `bq-avatar-group`, `bq-table`, `bq-divider`, `bq-empty-state`, `bq-stat-card`, `bq-timeline`, `bq-kbd` |
| **Feedback & Loading** | `bq-alert`, `bq-banner`, `bq-progress`, `bq-spinner`, `bq-skeleton`, `bq-tooltip`, `bq-toast` |
| **Overlays** | `bq-dialog`, `bq-drawer`, `bq-dropdown-menu`, `bq-popover` |

## Cross-Cutting Features

Across the component library you will find the same professional capabilities that developers expect from mature UI systems:

- **Accessibility-first APIs** with semantic roles, ARIA attributes, keyboard support, and focus management
- **Framework interoperability** through native Custom Elements and DOM events
- **Themeability** through design tokens, CSS custom properties, and `::part()` hooks
- **Dark mode support** without changing component APIs
- **Internationalization support** for user-facing component strings
- **Tree-shakeable imports** so applications can register only the components they use

## Actions

| Component | Use it for | Highlights |
| --- | --- | --- |
| `bq-button` | Primary and secondary actions | Variants, sizes, loading state, link rendering, icon slots, accessible label override |
| `bq-icon-button` | Compact icon-only actions | Accessible label or title fallback, multiple variants, loading state, link rendering |
| `bq-button-group` | Joining related actions into one control | Attached mode with shared borders, orientation, shared size forwarding, group semantics |

## Forms

| Component | Use it for | Highlights |
| --- | --- | --- |
| `bq-input` | Single-line text input | Labels, hints, validation, prefix/suffix slots, size variants |
| `bq-number-input` | Numeric entry with bounds | Stepper buttons, range clamping, step snapping, precision control, prefix/suffix slots |
| `bq-textarea` | Multi-line text input | Rows, max length, validation, hints |
| `bq-select` | Native dropdown selection | Placeholder, form-friendly behavior, error state |
| `bq-segmented-control` | Compact single-choice view and filter toggles | Radio-group semantics, form participation, keyboard navigation, mobile-friendly full-width mode |
| `bq-checkbox` | Boolean or multi-select forms | Checked and indeterminate states, hint text |
| `bq-radio` | Exclusive option groups | Shared name support, hint text |
| `bq-switch` | Toggle settings and preferences | Size variants, switch semantics, animated thumb |
| `bq-slider` | Numeric range selection | Min/max/step, inline value display, input/change events |
| `bq-chip` | Compact selectable tags | Selection state, removable chips, contextual variants |
| `bq-rating` | Star ratings and scores | Radio-group semantics, keyboard support, read-only and clearable modes, form participation |
| `bq-file-upload` | File selection and drag-and-drop | Type and size filtering, selected-file list, rejection events, keyboard-reachable drop zone |

## Navigation & Disclosure

| Component | Use it for | Highlights |
| --- | --- | --- |
| `bq-tabs` | Switching between related views | Keyboard navigation, tab/panel sync, multiple visual variants |
| `bq-accordion` | Expand/collapse detail sections | Smooth toggle animation, bordered/flush variants, keyboard support |
| `bq-breadcrumbs` | Hierarchical navigation | Automatic separators, semantic navigation markup |
| `bq-pagination` | Paging through result sets | Previous/next controls, ellipsis logic, sibling page calculation |
| `bq-stepper` | Multi-step flows and wizards | Horizontal/vertical layouts, clickable steps, per-step status announcements |

## Data Display

| Component | Use it for | Highlights |
| --- | --- | --- |
| `bq-card` | Structured surfaces and grouped content | Header/footer slots, padding control, elevation toggle |
| `bq-badge` | Inline statuses and labels | Variants, sizes, pill mode |
| `bq-avatar` | User and entity identity | Image/initial fallback, shapes, sizes, status indicators |
| `bq-avatar-group` | Stacked collections of people | Overflow counter, shared sizing, configurable spacing |
| `bq-table` | Tabular datasets | Sortable columns, bordered/striped/hoverable variants, empty/loading states |
| `bq-divider` | Visual separation of content | Horizontal/vertical orientation, label support, multiple line styles |
| `bq-empty-state` | No-data or no-results messaging | Title, description, icon slot, action slot |
| `bq-stat-card` | Dashboard metrics and KPI summaries | Compact metric layout, trend pill, loading skeleton, icon slot |
| `bq-timeline` | Activity feeds and audit trails | Ordered-list semantics, event variants, machine-readable timestamps, custom markers |
| `bq-kbd` | Keyboard shortcuts | Combination parsing, symbol substitution, sizes and variants |

## Feedback & Loading

| Component | Use it for | Highlights |
| --- | --- | --- |
| `bq-alert` | In-page status messaging | Semantic variants, dismissible mode, optional title |
| `bq-banner` | Page-level announcements | Sticky mode, cancelable dismissal, severity-aware live regions, action slot |
| `bq-progress` | Determinate or indeterminate progress | Value/max support, size variants, status variants |
| `bq-spinner` | Compact loading indicator | Multiple sizes and color variants |
| `bq-skeleton` | Loading placeholders | Text, circle, rect, and card variants with shimmer animation |
| `bq-tooltip` | Contextual helper text | Placement options, delay, keyboard dismissal |
| `bq-toast` | Ephemeral notifications | Auto-dismiss, dismissible actions, imperative show API |

## Overlays

| Component | Use it for | Highlights |
| --- | --- | --- |
| `bq-dialog` | Blocking confirmation and form flows | Focus trap, escape handling, click-outside close, multiple sizes |
| `bq-drawer` | Supplemental side panels and mobile flows | Multiple placements, responsive sizes, overlay/backdrop handling |
| `bq-dropdown-menu` | Contextual actions and navigation menus | Full keyboard navigation, placement options, click-outside close, focus management |
| `bq-popover` | Rich anchored overlays | Dialog semantics, placement options, focus management, escape and click-outside close |

## Feature Coverage Compared to Typical UI Libraries

Common libraries such as Material UI, Vuetify, and Angular Material typically organize their APIs around actions, forms, navigation, data display, overlays, and feedback. `@bquery/ui` already provides components in each of these core areas, while also shipping shared capabilities that matter in production:

- accessible interaction patterns,
- consistent event contracts,
- framework-agnostic usage,
- theme tokens and dark mode,
- and Storybook/VitePress-based documentation.

## Next Steps

If you are evaluating the library for a product team, start with:

1. [Getting Started](/guide/getting-started)
2. [Framework Integration](/guide/framework-integration)
3. [Theming](/guide/theming)
4. [Accessibility](/guide/accessibility)

For component-level API examples, see the dedicated references for [Button](/components/button), [Icon Button](/components/icon-button), [Input](/components/input), and [Card](/components/card).
