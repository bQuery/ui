# Component Catalog

`@bquery/ui` already covers the primary component categories that teams expect from modern component libraries for Angular, React, Svelte, Vue, and plain Web Components.

This catalog gives you a complete overview of the currently available building blocks and the cross-cutting features that make them production-ready.

## Coverage at a Glance

| Category | Components |
| --- | --- |
| **Actions** | `bq-button`, `bq-icon-button` |
| **Forms** | `bq-input`, `bq-textarea`, `bq-select`, `bq-checkbox`, `bq-radio`, `bq-switch`, `bq-slider`, `bq-chip` |
| **Navigation & Disclosure** | `bq-tabs`, `bq-accordion`, `bq-breadcrumbs`, `bq-pagination` |
| **Data Display** | `bq-card`, `bq-badge`, `bq-avatar`, `bq-table`, `bq-divider`, `bq-empty-state` |
| **Feedback & Loading** | `bq-alert`, `bq-progress`, `bq-spinner`, `bq-skeleton`, `bq-tooltip`, `bq-toast` |
| **Overlays** | `bq-dialog`, `bq-drawer` |

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

## Forms

| Component | Use it for | Highlights |
| --- | --- | --- |
| `bq-input` | Single-line text input | Labels, hints, validation, prefix/suffix slots, size variants |
| `bq-textarea` | Multi-line text input | Rows, max length, validation, hints |
| `bq-select` | Native dropdown selection | Placeholder, form-friendly behavior, error state |
| `bq-checkbox` | Boolean or multi-select forms | Checked and indeterminate states, hint text |
| `bq-radio` | Exclusive option groups | Shared name support, hint text |
| `bq-switch` | Toggle settings and preferences | Size variants, switch semantics, animated thumb |
| `bq-slider` | Numeric range selection | Min/max/step, inline value display, input/change events |
| `bq-chip` | Compact selectable tags | Selection state, removable chips, contextual variants |

## Navigation & Disclosure

| Component | Use it for | Highlights |
| --- | --- | --- |
| `bq-tabs` | Switching between related views | Keyboard navigation, tab/panel sync, multiple visual variants |
| `bq-accordion` | Expand/collapse detail sections | Smooth toggle animation, bordered/flush variants, keyboard support |
| `bq-breadcrumbs` | Hierarchical navigation | Automatic separators, semantic navigation markup |
| `bq-pagination` | Paging through result sets | Previous/next controls, ellipsis logic, sibling page calculation |

## Data Display

| Component | Use it for | Highlights |
| --- | --- | --- |
| `bq-card` | Structured surfaces and grouped content | Header/footer slots, padding control, elevation toggle |
| `bq-badge` | Inline statuses and labels | Variants, sizes, pill mode |
| `bq-avatar` | User and entity identity | Image/initial fallback, shapes, sizes, status indicators |
| `bq-table` | Tabular datasets | Sortable columns, bordered/striped/hoverable variants, empty/loading states |
| `bq-divider` | Visual separation of content | Horizontal/vertical orientation, label support, multiple line styles |
| `bq-empty-state` | No-data or no-results messaging | Title, description, icon slot, action slot |

## Feedback & Loading

| Component | Use it for | Highlights |
| --- | --- | --- |
| `bq-alert` | In-page status messaging | Semantic variants, dismissible mode, optional title |
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
