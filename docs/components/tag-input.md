# Tag Input

The `bq-tag-input` component turns free-form text into removable tags. Use it for keywords, labels or email recipients — anywhere the user decides the values. When the values must come from a fixed list, use `bq-combobox` with `multiple` instead.

## Import

```ts
import '@bquery/ui/components/tag-input';
```

## Basic Usage

Type a tag and press `Enter` or type a comma to commit it.

```html
<bq-tag-input label="Keywords" name="keywords" value="web,components"></bq-tag-input>
```

Pasting `design, tokens, a11y` creates three tags at once. A half-typed tag is committed when the field loses focus, so nothing is silently lost.

## Custom Delimiters and Separator

`delimiters` lists every character that commits a tag while typing. `separator` is the character used to join the submitted `value`.

```html
<bq-tag-input
  label="Recipients"
  delimiters=",; "
  separator=";"
  placeholder="Add an email address…"
></bq-tag-input>
```

## Limits and Duplicates

```html
<bq-tag-input label="Up to three tags" max="3"></bq-tag-input>
<bq-tag-input label="Duplicates allowed" allow-duplicates></bq-tag-input>
```

With `max`, a `3/3`-style counter is shown. Once the limit is reached the field turns read-only and says so in its placeholder; `Backspace` still removes the last tag to free a slot. Duplicates are ignored unless `allow-duplicates` is set.

## Validation

```html
<bq-tag-input label="Topics" required error="Add at least one topic."></bq-tag-input>
```

## Properties

| Property           | Type             | Default   | Description                                              |
| ------------------ | ---------------- | --------- | -------------------------------------------------------- |
| `label`            | `string`         | `''`      | Visible field label.                                     |
| `value`            | `string`         | `''`      | Current tags, joined by `separator`.                     |
| `placeholder`      | `string`         | localized | Placeholder text.                                        |
| `name`             | `string`         | `''`      | Form field name used for the hidden proxy input.         |
| `separator`        | `string`         | `','`     | Character joining the submitted value.                   |
| `delimiters`       | `string`         | `','`     | Characters that commit a tag while typing.               |
| `max`              | `number`         | `0`       | Maximum number of tags; `0` means unlimited.             |
| `allow-duplicates` | `boolean`        | `false`   | Accept the same tag more than once.                      |
| `disabled`         | `boolean`        | `false`   | Disables the field.                                      |
| `required`         | `boolean`        | `false`   | Requires at least one tag for native form validation.   |
| `error`            | `string`         | `''`      | Error message.                                           |
| `hint`             | `string`         | `''`      | Supporting text.                                         |
| `size`             | `sm \| md \| lg` | `md`      | Field size.                                              |

## Events

| Event       | Detail                              | Description                  |
| ----------- | ----------------------------------- | ---------------------------- |
| `bq-change` | `{ value: string, tags: string[] }` | The tag list changed.        |
| `bq-add`    | `{ tag: string }`                   | A tag was added.             |
| `bq-remove` | `{ tag: string }`                   | A tag was removed.           |

## CSS Parts

| Part         | Description                      |
| ------------ | -------------------------------- |
| `field`      | Outer wrapper                    |
| `label`      | Field label                      |
| `control`    | Bordered container               |
| `tags`       | The list of tags                 |
| `tag`        | A single tag                     |
| `tag-remove` | A tag's remove button            |
| `input`      | Text input                       |
| `count`      | `n/max` counter                  |
| `hint`       | Hint text                        |
| `error`      | Error message                    |

## Keyboard Interactions

| Key              | Action                                              |
| ---------------- | --------------------------------------------------- |
| `Enter`          | Commits the typed text as a tag. Submits the form when the field is empty. |
| Delimiter        | Commits the typed text as a tag.                    |
| `Backspace`      | With an empty field, removes the last tag.          |
| `Escape`         | Clears the typed text.                              |

## Accessibility Notes

- Tags are rendered as a labelled `<ul>`, and the tag count is announced through a polite live region.
- Each remove button names the tag it removes ("Remove design").
- The usage hint (`tagInput.help`) is linked to the input with `aria-describedby`.

## Localization

Strings live under `tagInput.*`: `placeholder`, `remove`, `listLabel`, `help`, `count`, `limitReached`.
