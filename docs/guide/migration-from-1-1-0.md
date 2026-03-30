# Migration from 1.1.0

`@bquery/ui` `1.2.0` keeps the same component catalog, but it changes the recommended integration model and tightens several accessibility and localization details.

## Summary

- Importing `@bquery/ui` now registers all components as a side effect.
- Importing `@bquery/ui/components/<name>` registers only that component wrapper.
- Root-level registration helpers such as `registerBqButton` are no longer part of the public root API.
- `registerAll()` remains available only as a deprecated compatibility shim.
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

If you still need the deprecated helper during a transition, import it explicitly:

```typescript
import { registerAll } from '@bquery/ui/register';

registerAll();
```

New code should avoid this pattern.

## Newer Package Entry Points

`1.2.0` makes the package surface clearer by exposing dedicated entry points for shared APIs:

```typescript
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
- improved chip keyboard behaviour and ARIA state output,
- and stronger accordion semantics plus reduced-motion-aware panel transitions.

These changes are backward compatible for most consumers, but they may affect snapshots, accessibility assertions, or test fixtures that inspect ARIA attributes and default text content.

## CDN Integrations

If you pin the package from a CDN, update any `1.1.0` URLs to `1.2.0`:

```html
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/@bquery/ui@1.2.0/dist/index.js';
</script>
```

## Recommended Upgrade Checklist

1. Replace explicit root registration helpers with import side effects.
2. Remove any custom-prefix expectations around `registerAll()`.
3. Update tests that assert hard-coded built-in strings or older ARIA output.
4. Refresh Storybook/docs examples so they use the current import model and version-pinned CDN snippets.
5. Re-run type-checks, tests, library build, and docs build.
