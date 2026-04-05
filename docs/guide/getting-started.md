# Getting Started

`@bquery/ui` is a production-grade web component library built on native Custom Elements and Shadow DOM.

## Quick Start

```bash
npm install @bquery/ui
```

If your package manager does not auto-install peer dependencies, add `@bquery/bquery` alongside `@bquery/ui`.

Then import the library once in your app:

```typescript
import '@bquery/ui';
```

Now you can use all `bq-*` elements in any HTML:

```html
<bq-button variant="primary">Click me</bq-button>
<bq-input label="Email" type="email" placeholder="you@example.com" />
<bq-badge variant="success">Active</bq-badge>
```

## Tree-shakeable Imports

For optimal bundle sizes, import only the component entry points you need:

```typescript
import '@bquery/ui/components/button';
import '@bquery/ui/components/input';
```

## With bQuery

If you use the `@bquery/bquery` library, components integrate naturally since they are standard Custom Elements:

```typescript
import { $ } from '@bquery/bquery';
import '@bquery/ui';

$('bq-button').on('bq-click', (e) => {
  console.log('clicked!', e.detail);
});
```
