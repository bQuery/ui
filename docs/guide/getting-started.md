# Getting Started

`@bquery/ui` is a production-grade web component library built on native Custom Elements and Shadow DOM.

## Quick Start

```bash
npm install @bquery/ui
```

Then in your app:

```typescript
import { registerAll } from '@bquery/ui/register';
registerAll();
```

Now you can use all `bq-*` elements in any HTML:

```html
<bq-button variant="primary">Click me</bq-button>
<bq-input label="Email" type="email" placeholder="you@example.com" />
<bq-badge variant="success">Active</bq-badge>
```

## Tree-shakeable Imports

For optimal bundle sizes, import and register only the components you need:

```typescript
import { BqButton, registerBqButton } from '@bquery/ui/components/button';
import { BqInput, registerBqInput } from '@bquery/ui/components/input';

registerBqButton();
registerBqInput();
```

## With bQuery

If you use the `@bquery/bquery` library, components integrate naturally since they are standard Custom Elements:

```typescript
import { $ } from '@bquery/bquery';
import { registerAll } from '@bquery/ui/register';

registerAll();

$('bq-button').on('bq-click', (e) => {
  console.log('clicked!', e.detail);
});
```
