# Format Date

The `bq-format-date` component renders a locale-aware date and/or time with `Intl.DateTimeFormat`, wrapped in a semantic `<time datetime="…">` element.

## Import

```ts
import '@bquery/ui/components/format-date';
```

## Presets

```html
<bq-format-date date="2024-03-01T15:30:00Z"></bq-format-date>
<!-- Mar 1, 2024 -->

<bq-format-date date="2024-03-01T15:30:00Z" date-style="full" time-style="short" time-zone="UTC"></bq-format-date>
<!-- Friday, March 1, 2024 at 3:30 PM -->

<bq-format-date date="2024-03-01T15:30:00Z" date-style="long" locale="de-DE" time-zone="Europe/Berlin"></bq-format-date>
<!-- 1. März 2024 -->
```

## Individual Fields

Set any of `weekday`, `year`, `month`, `day`, `hour`, `minute` and `second` for full control. When any of them is set, the presets are ignored (`Intl` does not allow mixing them).

```html
<bq-format-date date="2024-03-01" month="long" year="numeric"></bq-format-date>
<!-- March 2024 -->

<bq-format-date date="2024-03-01T15:05:00Z" hour="2-digit" minute="2-digit" hour-format="24" time-zone="UTC"></bq-format-date>
<!-- 15:05 -->
```

`date` accepts anything `new Date()` parses, or a millisecond timestamp. Empty means “now”. An unparseable date renders the default slot as a fallback.

## Properties

| Property      | Type                                       | Default  | Description                           |
| ------------- | ------------------------------------------ | -------- | ------------------------------------- |
| `date`        | `string`                                   | now      | Date to format.                       |
| `locale`      | `string`                                   | document | BCP-47 language tag.                  |
| `date-style`  | `full \| long \| medium \| short`          | `medium` | Date preset.                          |
| `time-style`  | `full \| long \| medium \| short`          | —        | Time preset.                          |
| `time-zone`   | `string`                                   | local    | IANA zone, e.g. `America/New_York`.   |
| `hour-format` | `auto \| 12 \| 24`                         | `auto`   | Force a 12- or 24-hour clock.         |
| `weekday`     | `narrow \| short \| long`                  | —        |                                       |
| `year`        | `numeric \| 2-digit`                       | —        |                                       |
| `month`       | `numeric \| 2-digit \| narrow \| short \| long` | —   |                                       |
| `day`, `hour`, `minute`, `second` | `numeric \| 2-digit`   | —        |                                       |

Part: `base` (the `<time>` element).

## Using the Formatter Directly

```ts
import { formatDate } from '@bquery/ui/utils';

formatDate(new Date(), { dateStyle: 'long', locale: 'fr' });
```
