# Icon

`bq-icon` renders one glyph from the built-in icon set.

Icons are drawn as CSS masks filled with `currentColor`, so they inherit the
surrounding text colour and scale with `font-size` — and they stay a single
crisp path at any zoom level or pixel density.

> Inline `<svg>` cannot be used inside a component's rendered markup: the
> framework sanitizer removes `svg` and no `allowTags` entry can re-open it.
> That is why the set is delivered as masks rather than as markup.

## Basic Usage

```html
<bq-icon name="check"></bq-icon>
<bq-icon name="trash" size="1.5rem"></bq-icon>
```

## Colour and size

An icon takes its colour from the text around it and its size from the font
size, so it drops into a sentence, a button or a heading without configuration.

```html
<span style="color: #dc2626; font-size: 1.25rem">
  <bq-icon name="alert-triangle"></bq-icon> Deletion is permanent
</span>
```

Override the size explicitly with the `size` prop or the `--bq-icon-size`
custom property:

```html
<bq-icon name="star" size="2rem"></bq-icon>
<bq-icon name="star" style="--bq-icon-size: 2rem"></bq-icon>
```

## Accessibility

An icon is decorative by default and carries `aria-hidden`. Pass `label` only
when the icon *is* the content — an icon-only control with no other text:

```html
<!-- Decorative: the button already says what it does -->
<bq-button><bq-icon slot="prefix-icon" name="download"></bq-icon> Download</bq-button>

<!-- Meaningful: nothing else names the control -->
<bq-icon name="trash" label="Delete"></bq-icon>
```

## Using icons inside your own components

`iconCss()` returns a stylesheet fragment containing only the icons you name,
so an unused icon costs nothing:

```ts
import { css } from '@bquery/bquery/component';
import { iconCss } from '@bquery/ui/utils';
import { baseStyles } from '@bquery/ui/utils';

styles: css`
  ${baseStyles}
  ${iconCss('chevron-down', 'x')}
`,
// …then render <span class="icon" data-icon="x" aria-hidden="true"></span>
```

To decorate an element you already render, `iconMask()` returns the mask
declarations on their own, for use in any rule including `::before`/`::after`.

## Properties

| Property | Type     | Default | Description                                      |
| -------- | -------- | ------- | ------------------------------------------------ |
| `name`   | `string` | `''`    | Icon name; an unknown name renders nothing       |
| `size`   | `string` | `''`    | Any CSS length; defaults to `1em`                |
| `label`  | `string` | `''`    | Accessible name. Omit for decorative icons.      |

## CSS Custom Properties

| Property          | Description                     |
| ----------------- | ------------------------------- |
| `--bq-icon-size`  | Alternative to the `size` prop  |

## CSS Parts

| Part   | Description        |
| ------ | ------------------ |
| `icon` | The glyph element  |

## Available icons

Status: `check` `check-circle` `x` `x-circle` `info` `alert-circle`
`alert-triangle` `help-circle` `circle` `dot`

Direction: `chevron-up` `chevron-down` `chevron-left` `chevron-right`
`chevrons-left` `chevrons-right` `chevrons-up-down` `arrow-up` `arrow-down`
`arrow-left` `arrow-right` `external-link`

Actions: `plus` `minus` `search` `menu` `more-horizontal` `more-vertical`
`trash` `copy` `edit` `download` `upload` `refresh` `filter` `settings`

Objects: `eye` `eye-off` `lock` `calendar` `clock` `star` `star-filled`
`heart` `user` `users` `mail` `link` `image` `file` `folder` `home` `sun`
`moon` `loader`

The full list is also available programmatically as `iconNames` from
`@bquery/ui/utils`.
