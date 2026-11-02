# Combobox

The `bq-combobox` component is a text field that filters a list of options as the user types. Use it instead of `bq-select` when the list is long enough that scrolling is slower than typing, or when several values can be picked at once.

It implements the [ARIA 1.2 combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/): DOM focus stays in the input while the arrow keys move a virtual cursor through the list, so the user never loses their place in the text.

## Import

```ts
import '@bquery/ui/components/combobox';
```

## Basic Usage

Options are declared as light-DOM `<option>` elements, the same markup `bq-select` uses.

```html
<bq-combobox label="Country" name="country" placeholder="Search countries…">
  <option value="de">Germany</option>
  <option value="fr">France</option>
  <option value="es">Spain</option>
  <option value="pt">Portugal</option>
</bq-combobox>
```

Matching is case- and diacritic-insensitive, so typing `sao` finds `São Paulo`.

## Pre-selected Value

A `value` that matches an option is shown as that option's label, not as the raw key.

```html
<bq-combobox label="Country" value="fr">
  <option value="de">Germany</option>
  <option value="fr">France</option>
</bq-combobox>
```

## Groups

Wrap options in `<optgroup label="…">` to render group headings in the list.

```html
<bq-combobox label="Framework">
  <optgroup label="Frontend">
    <option value="vue">Vue</option>
    <option value="svelte">Svelte</option>
  </optgroup>
  <optgroup label="Backend">
    <option value="hono">Hono</option>
    <option value="fastify">Fastify</option>
  </optgroup>
</bq-combobox>
```

## Multiple Selection

With `multiple`, each pick becomes a removable token and the list stays open, so several values cost one trip. `value` is comma-separated.

```html
<bq-combobox label="Skills" multiple clearable value="ts,css">
  <option value="ts">TypeScript</option>
  <option value="css">CSS</option>
  <option value="a11y">Accessibility</option>
  <option value="perf">Performance</option>
</bq-combobox>
```

## Filter Modes and Server-side Search

`filter-mode="starts-with"` only matches option labels that begin with the query. For remote search, set `no-filter`, listen for `bq-input` and replace the `<option>` children yourself — the component re-reads them automatically.

```html
<bq-combobox id="users" label="Assignee" no-filter></bq-combobox>

<script type="module">
  const field = document.querySelector('#users');
  let latest = 0;
  field.addEventListener('bq-input', async (event) => {
    const request = ++latest;
    const users = await searchUsers(event.detail.query);
    // Ignore a response that arrives after a newer query was sent.
    if (request !== latest) return;
    field.replaceChildren(
      ...users.map((user) => new Option(user.name, user.id))
    );
  });
</script>
```

## Validation

```html
<bq-combobox label="Region" required error="Please pick a region.">
  <option value="eu">Europe</option>
  <option value="us">United States</option>
</bq-combobox>
```

## Properties

| Property      | Type                        | Default      | Description                                                                 |
| ------------- | --------------------------- | ------------ | --------------------------------------------------------------------------- |
| `label`       | `string`                    | `''`         | Visible field label.                                                        |
| `value`       | `string`                    | `''`         | Selected value. Comma-separated when `multiple` is set.                     |
| `placeholder` | `string`                    | localized    | Placeholder text for the input.                                             |
| `name`        | `string`                    | `''`         | Form field name used for the hidden proxy input.                            |
| `multiple`    | `boolean`                   | `false`      | Allow more than one selection; picks are rendered as tokens.               |
| `clearable`   | `boolean`                   | `false`      | Shows a button that clears the selection.                                  |
| `no-filter`   | `boolean`                   | `false`      | Show every option and leave filtering to the application.                  |
| `filter-mode` | `contains \| starts-with`   | `contains`   | How the query is matched against option labels.                            |
| `disabled`    | `boolean`                   | `false`      | Disables the field.                                                         |
| `required`    | `boolean`                   | `false`      | Marks the field as required for native form validation.                    |
| `error`       | `string`                    | `''`         | Error message; switches the field into its invalid state.                  |
| `hint`        | `string`                    | `''`         | Supporting text below the field.                                            |
| `size`        | `sm \| md \| lg`            | `md`         | Field size.                                                                 |

## Events

| Event       | Detail                                 | Description                                   |
| ----------- | -------------------------------------- | --------------------------------------------- |
| `bq-change` | `{ value: string, values: string[] }`  | The selection changed.                        |
| `bq-input`  | `{ query: string }`                    | The user typed into the field.                |
| `bq-open`   | —                                      | The option list opened.                       |
| `bq-close`  | —                                      | The option list closed.                       |

## Slots

| Slot        | Description                                         |
| ----------- | --------------------------------------------------- |
| *(default)* | `<option>` and `<optgroup>` elements (data source). |

## CSS Parts

| Part      | Description                            |
| --------- | -------------------------------------- |
| `field`   | Wrapper around label, control and hint |
| `label`   | Field label                            |
| `control` | Bordered field container               |
| `input`   | Text input                             |
| `token`   | A selected value in `multiple` mode    |
| `clear`   | Clear button                           |
| `toggle`  | Open/close button                      |
| `listbox` | Popup option list                      |
| `option`  | A single option                        |
| `hint`    | Hint text                              |
| `error`   | Error message                          |

## Keyboard Interactions

| Key                       | Action                                                           |
| ------------------------- | ---------------------------------------------------------------- |
| `ArrowDown` / `ArrowUp`   | Opens the list, then moves the active option (skips disabled).  |
| `Home` / `End`            | Jumps to the first / last option while the list is open.        |
| `Enter`                   | Selects the active option.                                       |
| `Escape`                  | Closes the list.                                                 |
| `Tab`                     | Closes the list and moves focus on.                             |
| `Backspace`               | In `multiple` mode with an empty query, removes the last token. |

## Accessibility Notes

- The input carries `role="combobox"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`.
- The popup is a `role="listbox"`; `aria-multiselectable` is set in `multiple` mode.
- The number of matching options is announced through a polite live region while the list is open.
- Each token's remove button is labelled with the option it removes.

## Localization

Strings live under `combobox.*` in the locale: `placeholder`, `noResults`, `clear`, `toggle`, `removeOption`, `resultCount`, `selected`.
