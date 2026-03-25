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

## CDN / ESM / UMD / IIFE

::: code-group

```html [ESM]
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/@bquery/ui@1.1.0/dist/index.js';
</script>
```

```html [UMD]
<script src="https://cdn.jsdelivr.net/npm/@bquery/ui@1.1.0"></script>
```

```html [IIFE]
<script src="https://cdn.jsdelivr.net/npm/@bquery/ui@1.1.0/dist/index.iife.js"></script>
```

:::

The UMD and IIFE bundles register all `bq-*` elements on load and expose the library on `window.BQueryUI`.
Pinning the version in CDN URLs keeps production integrations reproducible across future releases.

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
