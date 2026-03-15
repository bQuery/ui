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

## CDN / ESM

```html
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/@bquery/ui/dist/index.js';
</script>
```

## TypeScript

The package ships with full TypeScript declarations. No `@types` package needed.

```typescript
import '@bquery/ui';
```

## Browser Support

`@bquery/ui` requires browsers that support:

- Custom Elements v1
- Shadow DOM v1
- ES2020+

This covers all modern browsers (Chrome 67+, Firefox 63+, Safari 12.1+, Edge 79+).
