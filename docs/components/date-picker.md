# Date Picker

`bq-date-picker` is a text field with a calendar popup.

## Basic Usage

```html
<bq-date-picker label="Due date" value="2026-03-15"></bq-date-picker>
```

`value` is always ISO `YYYY-MM-DD`, in and out, so the attribute means the same
thing in every locale. What the user sees is formatted with
`Intl.DateTimeFormat`.

## Localisation

The `locale` prop drives the displayed date, the month name and the weekday
headers. `first-day-of-week` decides which column the week starts in — `1` for
Monday (the default), `0` for Sunday.

```html
<bq-date-picker locale="de-DE" label="Fälligkeitsdatum"></bq-date-picker>
<bq-date-picker locale="en-US" first-day-of-week="0"></bq-date-picker>
```

## Range

```html
<bq-date-picker min="2026-03-10" max="2026-03-24"></bq-date-picker>
```

Days outside the range are disabled, the month arrows stop at the boundary, and
a date typed into the field outside the range is rejected.

## Keyboard

| Key                              | Action                          |
| -------------------------------- | ------------------------------- |
| <kbd>Alt</kbd> + <kbd>↓</kbd>    | Open the calendar               |
| <kbd>←</kbd> / <kbd>→</kbd>      | Previous / next day             |
| <kbd>↑</kbd> / <kbd>↓</kbd>      | Previous / next week            |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Previous / next month    |
| <kbd>Shift</kbd> + <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Previous / next year |
| <kbd>Home</kbd> / <kbd>End</kbd> | Start / end of the week         |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Select the focused day       |
| <kbd>Escape</kbd>                | Close and return to the field   |

## Typing a date

The field accepts an ISO date typed directly. Anything it cannot parse — or a
date outside `min`/`max` — is rejected by repainting the last good value, so
the component never stores something other than what is shown.

## Forms

The ISO value is mirrored into a hidden input, so the picker submits with a
plain `<form>` and participates in constraint validation:

```html
<form>
  <bq-date-picker name="due" label="Due date" required></bq-date-picker>
  <bq-button type="submit">Save</bq-button>
</form>
```

## Time zones

All date arithmetic runs in UTC. A calendar built from local-time `Date`
objects lands on the wrong day twice a year — on a spring-forward morning the
missing hour makes "add one day" produce the same date again — and a calendar
date has no time zone to begin with.

## Properties

| Property            | Type      | Default | Description                                |
| ------------------- | --------- | ------- | ------------------------------------------ |
| `label`             | `string`  | `''`    | Field label                                |
| `value`             | `string`  | `''`    | Selected date as `YYYY-MM-DD`              |
| `name`              | `string`  | `''`    | Form field name                            |
| `min`               | `string`  | `''`    | Earliest selectable date                   |
| `max`               | `string`  | `''`    | Latest selectable date                     |
| `locale`            | `string`  | `''`    | BCP-47 tag; defaults to the environment    |
| `first-day-of-week` | `number`  | `1`     | `0` (Sunday) … `6`                         |
| `placeholder`       | `string`  | `''`    |                                            |
| `clearable`         | `boolean` | `false` | Show a button that clears the date         |
| `disabled`          | `boolean` | `false` |                                            |
| `readonly`          | `boolean` | `false` |                                            |
| `required`          | `boolean` | `false` |                                            |
| `error`             | `string`  | `''`    | Error message; non-empty = error state     |
| `hint`              | `string`  | `''`    | Helper text                                |
| `size`              | `string`  | `'md'`  | `sm` \| `md` \| `lg`                       |

## Events

| Event       | Detail              | Description             |
| ----------- | ------------------- | ----------------------- |
| `bq-change` | `{ value: string }` | A date was selected     |
| `bq-open`   | —                   | The calendar opened     |
| `bq-close`  | —                   | The calendar closed     |

## CSS Parts

| Part      | Description               |
| --------- | ------------------------- |
| `field`   | The outer wrapper         |
| `label`   | The label element         |
| `control` | The input shell           |
| `input`   | The text field            |
| `trigger` | The calendar button       |
| `clear`   | The clear button          |
| `panel`   | The popup                 |
| `grid`    | The month grid            |
| `day`     | A single day button       |

## Accessibility

- The field is `aria-haspopup="dialog"` with `aria-expanded`; the popup is a
  labelled dialog containing a `role="grid"` calendar.
- Each day button is named with its full localised date, so a screen reader
  reads "Sunday, March 15, 2026" rather than "15".
- One day is in the tab order at a time and the arrow keys move it, matching
  the ARIA date-picker pattern.
