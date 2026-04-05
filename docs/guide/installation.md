# Installation

## Package Manager

::: code-group

```bash [npm]
npm install @bquery/ui
```

```bash [pnpm]
pnpm add @bquery/ui
```

```bash [yarn]
yarn add @bquery/ui
```

```bash [bun]
bun add @bquery/ui
```

:::

`@bquery/ui` declares `@bquery/bquery` as a peer dependency. npm will usually resolve that automatically; if your package manager or workspace policy requires explicit peer installs, add both packages to your app.

## Browser Bundles (CDN)

::: code-group

```html [UMD]
<script src="https://cdn.jsdelivr.net/npm/@bquery/ui@1.9.0/dist/index.umd.js"></script>
```

```html [IIFE]
<script src="https://cdn.jsdelivr.net/npm/@bquery/ui@1.9.0/dist/index.iife.js"></script>
```

:::

The UMD and IIFE bundles register all `bq-*` elements on load and expose the library on `window.BQueryUI`.
Pinning the version in CDN URLs keeps production integrations reproducible across future releases.
For ESM workflows, prefer a local or bundler-based import such as `import '@bquery/ui';`. The published library ESM keeps `@bquery/bquery` as a peer dependency, so browser-direct CDN usage should use `index.umd.js` or `index.iife.js`.

## Registration Model in Current Releases

`@bquery/ui` now treats import side effects as the primary registration mechanism:

```typescript
import '@bquery/ui';
```

For smaller bundles, import only the wrappers you need:

```typescript
import '@bquery/ui/components/button';
import '@bquery/ui/components/input';
```

The legacy `registerAll()` helper remains available as a deprecated compatibility shim. It is still re-exported from the package root for backwards compatibility, and you can also import it explicitly from `@bquery/ui/register` during migrations. It no longer supports custom prefixes and should not be used in new integrations.

## Additional Package Entry Points

The package also publishes dedicated entry points for shared APIs:

```typescript
import { getTokensCSS } from '@bquery/ui/tokens';
import { setColorScheme } from '@bquery/ui/theme';
import { setLocale } from '@bquery/ui/i18n';
import { announce } from '@bquery/ui/utils';
```

If you need the deprecated compatibility helper during a staged migration, import `registerAll` from `@bquery/ui/register` so the transition path stays explicit.

See the migration guide for upgrade notes from `1.1.0`: [Migration from 1.1.0](./migration-from-1-1-0.md).

## TypeScript

The package ships with full TypeScript declarations. No `@types` package needed.

```typescript
import type { ToastOptions } from '@bquery/ui/components/toast';

const options: ToastOptions = {
  message: 'Saved successfully',
  variant: 'success',
};
```

## Browser Support

`@bquery/ui` requires browsers that support:

- Custom Elements v1
- Shadow DOM v1
- ES2020+

This covers all modern browsers (Chrome 67+, Firefox 63+, Safari 12.1+, Edge 79+).
