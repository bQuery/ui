# Migration from 1.1.0

Moving from `1.1.0` to the current `@bquery/ui` line (`1.9.0`) is mostly about aligning with the modern import model, the explicit package entry points, and the expanded accessibility/i18n defaults.

## Summary

- Importing `@bquery/ui` now registers all components as a side effect.
- Importing `@bquery/ui/components/<name>` registers only that component wrapper.
- Root-level registration helpers such as `registerBqButton` are no longer part of the public root API.
- `registerAll()` remains available only as a deprecated compatibility shim.
- Direct browser/CDN usage should prefer the bundled UMD or IIFE files.
- Shared APIs now have dedicated entry points for tokens, theming, i18n, utilities, and legacy registration.
- More built-in component strings now come from the shared i18n layer.
- More animated components now explicitly honor `prefers-reduced-motion`.

## Before

Older integrations often relied on explicit registration helpers:

```typescript
import { registerAll } from '@bquery/ui';

registerAll({ prefix: 'ACME' });
```

## After

Prefer one import for all components:

```typescript
import '@bquery/ui';
```

Or import only the component wrappers you need:

```typescript
import '@bquery/ui/components/button';
import '@bquery/ui/components/input';
import '@bquery/ui/components/dialog';
```

## About `registerAll()`

`registerAll()` still exists so older code does not fail immediately, but its role is intentionally limited:

- it does **not** change the component prefix,
- it does **not** perform additional work beyond the import side effects already in place,
- and passing legacy options now emits a warning.

It is still re-exported from `@bquery/ui` for backwards compatibility, but importing it from `@bquery/ui/register` makes transition-only code easier to find and remove later.

If you still need the deprecated helper during a transition, import it explicitly:

```typescript
import { registerAll } from '@bquery/ui/register';

registerAll();
```

New code should avoid this pattern.

## Newer Package Entry Points

The current release line makes the package surface clearer by exposing dedicated entry points for shared APIs:

```typescript
import { getTokensCSS } from '@bquery/ui/tokens';
import { setColorScheme } from '@bquery/ui/theme';
import { setLocale } from '@bquery/ui/i18n';
import { announce } from '@bquery/ui/utils';
```

## Accessibility and i18n Changes to Expect

Recent updates since `1.1.0` include:

- improved password-toggle semantics in `bq-input`,
- live character counters for `bq-input` and `bq-textarea`,
- localized loading and empty-state text in `bq-table`,
- localized fallback copy in `bq-spinner` and `bq-empty-state`,
- clearer pagination labels, breadcrumb navigation copy, and dropdown-menu labels,
- improved chip keyboard behaviour and ARIA state output,
- and stronger accordion, dialog, drawer, and dropdown interaction patterns with reduced-motion-aware transitions.

These changes are backward compatible for most consumers, but they may affect snapshots, accessibility assertions, or test fixtures that inspect ARIA attributes and default text content.

## CDN Integrations

For direct browser delivery, pin the bundled browser files to the current version:

```html
<script src="https://cdn.jsdelivr.net/npm/@bquery/ui@1.9.0/dist/index.umd.js"></script>
```

The library ESM entry is still the right choice for bundlers, but the published `dist/index.js` keeps `@bquery/bquery` as a peer dependency, so browser-direct CDN usage should prefer `index.umd.js` or `index.iife.js`.

## Recommended Upgrade Checklist

1. Replace explicit root registration helpers with import side effects.
2. Remove any custom-prefix expectations around `registerAll()`.
3. Update tests that assert hard-coded built-in strings or older ARIA output.
4. Refresh Storybook/docs examples so they use the current import model and version-pinned browser bundle snippets.
5. Re-run type-checks, tests, library build, and docs build.
