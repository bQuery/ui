# Framework Integration

`@bquery/ui` is built with native Custom Elements, which makes it usable across Angular, React, Svelte, Vue, and plain HTML without rewriting the component layer for each framework.

## General Integration Pattern

1. Install `@bquery/ui`
2. Register the custom elements once on the client
3. Use `bq-*` elements in templates or JSX
4. Subscribe to `bq-*` custom events where needed

## React

In React, register the elements once and listen to custom events through a ref.

```tsx
import { useEffect, useRef } from 'react';
import '@bquery/ui';

export function SaveButton() {
  const buttonRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const current = buttonRef.current;
    const handleClick = (event: Event) => {
      const customEvent = event as CustomEvent<{ originalEvent: MouseEvent }>;
      console.log('clicked', customEvent.detail.originalEvent.type);
    };

    current?.addEventListener('bq-click', handleClick as EventListener);

    return () => {
      current?.removeEventListener('bq-click', handleClick as EventListener);
    };
  }, []);

  return <bq-button ref={buttonRef}>Save</bq-button>;
}
```

## Vue

Vue can use Custom Elements directly in templates and bind to custom events declaratively.

```vue
<script setup lang="ts">
import '@bquery/ui';

function handleChange(event: CustomEvent<{ value: string }>) {
  console.log(event.detail.value);
}
</script>

<template>
  <bq-input
    label="Email"
    type="email"
    placeholder="you@example.com"
    @bq-change="handleChange"
  />
</template>
```

## Angular

Angular applications can use the components after enabling `CUSTOM_ELEMENTS_SCHEMA`.

```ts
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import '@bquery/ui';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <bq-switch
      label="Enable notifications"
      (bq-change)="onToggle($event)"
    ></bq-switch>
  `,
})
export class ProfileFormComponent {
  onToggle(event: CustomEvent<{ checked: boolean }>) {
    console.log(event.detail.checked);
  }
}
```

## Svelte

Svelte works especially well with Custom Elements because you can bind to native and custom events directly.

```svelte
<script lang="ts">
  import '@bquery/ui';

  function handlePageChange(event: CustomEvent<{ page: number }>) {
    console.log(event.detail.page);
  }
</script>

<bq-pagination
  total="120"
  page="3"
  page-size="10"
  on:bq-page-change={handlePageChange}
/>
```

## Two-way binding (`bq-model`, `v-model`, …)

Form components behave like native controls for bindings:

- `value` is a property on the element (`checked` too on `bq-checkbox`,
  `bq-switch` and `bq-radio`, whose `type` is `checkbox` / `radio`). Setting it
  updates the component and fires no event, as on a native input.
- Every user change fires a bubbling, composed `input` event on the element,
  and every committed change a `change` event — after the component's own
  `bq-input` / `bq-change`, which keep their detail payloads.

This covers `bq-input`, `bq-textarea`, `bq-number-input`, `bq-select`,
`bq-combobox`, `bq-date-picker`, `bq-pin-input`, `bq-rating`,
`bq-segmented-control`, `bq-slider`, `bq-tag-input`, `bq-checkbox`,
`bq-switch` and `bq-radio`. `value` is always a string, as on native controls.

With bQuery's view module:

```html
<div id="profile">
  <bq-input label="Name" bq-model="name"></bq-input>
  <bq-switch label="Newsletter" bq-model="subscribed"></bq-switch>
  <bq-radio name="plan" value="free" bq-model="plan">Free</bq-radio>
  <bq-radio name="plan" value="pro" bq-model="plan">Pro</bq-radio>
</div>

<script type="module">
  import '@bquery/ui';
  import { mount, signal } from '@bquery/bquery/view';

  mount('#profile', {
    name: signal(''),
    subscribed: signal(false),
    plan: signal('free'),
  });
</script>
```

In Vue, `v-model` on a custom element binds `value` and listens for `input`;
use `v-model` for text-like controls and `:checked` + `@change` for the
checkable ones.

## Plain HTML or bQuery

If you are not using a frontend framework, the setup is even simpler:

```html
<script type="module">
  import '@bquery/ui';

  document.querySelector('bq-button')?.addEventListener('bq-click', (event) => {
    console.log(event.detail);
  });
</script>

<bq-button variant="primary">Launch</bq-button>
```

## Best Practices

- Register components once during application startup
- Prefer per-component imports in performance-sensitive applications
- Subscribe to `bq-*` custom events instead of relying on framework-specific synthetic event layers
- Keep styling at the token, CSS variable, or `::part()` level instead of reaching into shadow DOM internals
- For SSR applications, register elements only on the client
