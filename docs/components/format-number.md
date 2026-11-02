# Format Number

The `bq-format-number` component renders a locale-aware number with `Intl.NumberFormat` — decimals, currencies, percentages, units, compact notation and file sizes.

## Import

```ts
import '@bquery/ui/components/format-number';
```

## Examples

```html
<bq-format-number value="1234567.89"></bq-format-number>
<!-- 1,234,567.89 -->

<bq-format-number value="49.9" type="currency" currency="EUR" locale="de-DE"></bq-format-number>
<!-- 49,90 € -->

<bq-format-number value="0.256" type="percent" maximum-fraction-digits="1"></bq-format-number>
<!-- 25.6% -->

<bq-format-number value="12300" notation="compact"></bq-format-number>
<!-- 12K -->

<bq-format-number value="3200000" type="bytes"></bq-format-number>
<!-- 3.2 MB -->

<bq-format-number value="80" type="unit" unit="kilometer-per-hour"></bq-format-number>
<!-- 80 km/h -->

<bq-format-number value="4.2" sign-display="always"></bq-format-number>
<!-- +4.2 -->
```

When `locale` is not set, the `lang` attribute of the document is used, then the browser default. A value that is not a number renders the default slot as a fallback:

```html
<bq-format-number value="">—</bq-format-number>
```

An unknown currency or unit falls back to a plain number instead of breaking the page.

## Properties

| Property                  | Type                                                     | Default   | Description                                         |
| ------------------------- | -------------------------------------------------------- | --------- | --------------------------------------------------- |
| `value`                   | `string`                                                 | `''`      | Number to format.                                   |
| `type`                    | `decimal \| currency \| percent \| unit \| bytes`        | `decimal` | Formatting style.                                   |
| `locale`                  | `string`                                                 | document  | BCP-47 language tag.                                |
| `currency`                | `string`                                                 | `USD`     | ISO 4217 code for `currency`.                       |
| `currency-display`        | `symbol \| narrowSymbol \| code \| name`                 | `symbol`  |                                                     |
| `unit`                    | `string`                                                 | `''`      | Unit identifier for `unit`, e.g. `liter`.           |
| `unit-display`            | `short \| long \| narrow`                                | `short`   |                                                     |
| `notation`                | `standard \| compact \| scientific \| engineering`       | `standard`|                                                     |
| `compact-display`         | `short \| long`                                          | `short`   |                                                     |
| `sign-display`            | `auto \| always \| exceptZero \| never`                  | `auto`    |                                                     |
| `minimum-fraction-digits` | `number`                                                 | —         |                                                     |
| `maximum-fraction-digits` | `number`                                                 | —         |                                                     |
| `no-grouping`             | `boolean`                                                | `false`   | Drop thousands separators.                          |
| `binary`                  | `boolean`                                                | `false`   | For `bytes`: step by 1024 instead of 1000.          |

## CSS

The text uses tabular figures so columns of numbers line up. Override with `--bq-format-number-variant: normal`. Part: `base`.

## Using the Formatter Directly

```ts
import { formatNumber } from '@bquery/ui/utils';

formatNumber(1500, { type: 'bytes' }); // "1.5 kB"
```
