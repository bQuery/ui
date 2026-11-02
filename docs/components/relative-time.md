# Relative Time

The `bq-relative-time` component shows how long ago (or how far ahead) a moment is — “5 minutes ago”, “yesterday”, “in 3 weeks” — using `Intl.RelativeTimeFormat`.

## Import

```ts
import '@bquery/ui/components/relative-time';
```

## Basic Usage

```html
Last edited <bq-relative-time date="2024-03-01T12:00:00Z"></bq-relative-time>
```

The rendered `<time>` element carries the ISO instant in `datetime` and the full absolute date in its `title`, so the exact moment is available on hover.

## Live Updates

With `sync`, the text keeps itself current: every second while the moment is less than a minute away, every 30 seconds below an hour, every 15 minutes below a day, then hourly. The timer stops when the element leaves the page.

```html
<bq-relative-time date="2024-03-01T12:00:00Z" sync></bq-relative-time>
```

## Formatting Options

```html
<bq-relative-time date="…" format="short"></bq-relative-time>     <!-- 3 hr. ago -->
<bq-relative-time date="…" numeric="always"></bq-relative-time>   <!-- 1 day ago (not "yesterday") -->
<bq-relative-time date="…" unit="day"></bq-relative-time>         <!-- 45 days ago -->
<bq-relative-time date="…" locale="de"></bq-relative-time>        <!-- vor 3 Stunden -->
```

## Properties

| Property  | Type                                                              | Default  | Description                                  |
| --------- | ----------------------------------------------------------------- | -------- | -------------------------------------------- |
| `date`    | `string`                                                          | now      | Anything `new Date()` parses, or a ms timestamp. |
| `locale`  | `string`                                                          | document | BCP-47 language tag.                         |
| `format`  | `long \| short \| narrow`                                         | `long`   | Length of the unit name.                     |
| `numeric` | `auto \| always`                                                  | `auto`   | `auto` allows “yesterday”, “now”.            |
| `unit`    | `second \| minute \| hour \| day \| week \| month \| year`        | auto     | Force a unit instead of picking the best fit. |
| `sync`    | `boolean`                                                         | `false`  | Keep the text up to date.                    |

Part: `base` (the `<time>` element).

## Using the Formatter Directly

```ts
import { formatRelativeTime } from '@bquery/ui/utils';

formatRelativeTime(new Date(Date.now() - 120_000)); // "2 minutes ago"
```
