# Dark Mode

`@bquery/ui` supports dark mode via the `data-theme="dark"` attribute on the `<html>` element (or any ancestor).

## Automatic (OS preference)

```typescript
import { setColorScheme } from '@bquery/ui/theme';

setColorScheme('auto'); // follows prefers-color-scheme
```

## Manual Toggle

```typescript
import { setColorScheme } from '@bquery/ui/theme';

// Force dark
setColorScheme('dark');

// Force light
setColorScheme('light');
```

## HTML Attribute

You can also set it directly without JavaScript:

```html
<html data-theme="dark">
  <!-- All bq-* components will use dark tokens -->
</html>
```

## Custom Dark Tokens

Override dark mode tokens with CSS:

```css
[data-theme="dark"] {
  --bq-color-primary-600: #3b82f6;  /* slightly lighter in dark */
  --bq-bg-base: #0f172a;
}
```
