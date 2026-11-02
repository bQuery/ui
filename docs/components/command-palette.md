# Command Palette

The `bq-command-palette` component is a modal search box for jumping to pages and running actions — the ⌘K / Ctrl+K pattern known from editors and productivity apps.

## Import

```ts
import '@bquery/ui/components/command-palette';
```

## Basic Usage

Commands are declared as `<option>` elements, optionally grouped with `<optgroup>`. Press <kbd>⌘K</kbd> (Apple) or <kbd>Ctrl+K</kbd> (everywhere else) to open the palette.

```html
<bq-command-palette id="palette">
  <optgroup label="Navigation">
    <option value="home" data-shortcut="G H">Go to dashboard</option>
    <option value="projects" data-keywords="repos work">Go to projects</option>
  </optgroup>
  <optgroup label="Actions">
    <option value="new" data-keywords="create add" data-description="Start from a template">New project</option>
    <option value="theme" data-shortcut="⇧ T">Toggle theme</option>
    <option value="delete" disabled>Delete project</option>
  </optgroup>
</bq-command-palette>

<script type="module">
  document.querySelector('#palette').addEventListener('bq-select', (event) => {
    router.navigate(event.detail.value);
  });
</script>
```

## Option Attributes

| Attribute          | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `value`            | Identifier reported in `bq-select`. Defaults to the text.               |
| `data-keywords`    | Extra search terms that are not shown (synonyms, old names).            |
| `data-description` | Secondary line shown under the label; also searched.                    |
| `data-shortcut`    | Space-separated keys rendered as key caps, e.g. `G H` or `⌘ ⇧ P`.       |
| `disabled`         | Shown but cannot be chosen; skipped by the arrow keys.                  |

## Search and Ranking

Matching is case- and diacritic-insensitive. Results are ranked so the most likely command comes first:

1. the label starts with the query,
2. a word in the label starts with the query,
3. the label contains the query,
4. a keyword, description or group word starts with or contains the query,
5. the letters of the query appear in order in the label (`sgnt` finds “Sign out”).

With an empty query the declared order and group headings are kept. While searching, each result shows its group as a small hint instead.

## Opening and Closing

```html
<!-- Custom hotkey, or hotkey="" to disable it -->
<bq-command-palette hotkey="mod+shift+p"></bq-command-palette>

<!-- Open from a button -->
<bq-button onclick="document.querySelector('bq-command-palette').setAttribute('open', '')">
  Search…
</bq-button>
```

`mod` resolves to <kbd>⌘</kbd> on Apple platforms and <kbd>Ctrl</kbd> elsewhere. The palette also closes on a backdrop click and on <kbd>Escape</kbd> — the first <kbd>Escape</kbd> clears a typed query, the second closes.

## Keeping the Palette Open

`bq-select` is cancelable. Call `preventDefault()` to keep the palette open for that one choice (for a sub-menu, say), or set `keep-open` to keep it open after every choice.

## Custom Empty State and Footer

```html
<bq-command-palette>
  <option>…</option>
  <div slot="empty">Nothing found. <a href="/help">Search the docs</a></div>
  <div slot="footer" style="padding: 0.5rem 1rem">
    <bq-kbd keys="up"></bq-kbd> <bq-kbd keys="down"></bq-kbd> to navigate ·
    <bq-kbd keys="enter"></bq-kbd> to select
  </div>
</bq-command-palette>
```

## Properties

| Property      | Type      | Default   | Description                                                         |
| ------------- | --------- | --------- | ------------------------------------------------------------------- |
| `open`        | `boolean` | `false`   | Whether the palette is shown.                                       |
| `hotkey`      | `string`  | `mod+k`   | Global shortcut that toggles the palette. Empty disables it. A hotkey without Ctrl/⌘/Alt (for example `/`) is ignored while typing in an input, textarea, select or editable element, including the palette's own search field. |
| `placeholder` | `string`  | localized | Search field placeholder.                                           |
| `label`       | `string`  | localized | Accessible name of the dialog and the search field.                 |
| `keep-open`   | `boolean` | `false`   | Stay open after a command is chosen.                                |

## Events

| Event       | Detail                             | Description                                                        |
| ----------- | ---------------------------------- | ------------------------------------------------------------------ |
| `bq-select` | `{ value: string, label: string }` | A command was chosen. Cancelable — cancel to keep the palette open. |
| `bq-input`  | `{ query: string }`                | The query changed. Use it to load remote commands.                 |
| `bq-open`   | —                                  | The palette opened.                                                |
| `bq-close`  | —                                  | The palette closed.                                                |

## Slots

| Slot        | Description                                     |
| ----------- | ----------------------------------------------- |
| *(default)* | `<option>` / `<optgroup>` elements (data only). |
| `empty`     | Content shown when nothing matches.             |
| `footer`    | Content below the result list.                  |

## CSS Parts

`overlay`, `panel`, `search`, `input`, `listbox`, `group-label`, `option`, `empty`, `footer`.

## Keyboard Interactions

| Key                     | Action                                                  |
| ----------------------- | ------------------------------------------------------- |
| `mod+k` (configurable)  | Opens or closes the palette from anywhere on the page.  |
| `ArrowDown` / `ArrowUp` | Moves the active command, wrapping, skipping disabled.  |
| `Home` / `End`          | First / last command.                                   |
| `Enter`                 | Runs the active command.                                |
| `Escape`                | Clears the query, then closes.                          |

## Accessibility Notes

- The panel is a modal `role="dialog"`; focus moves into the search field on open, is trapped inside, and returns to the previously focused element on close.
- The search field is an ARIA 1.2 combobox. DOM focus never leaves it; `aria-activedescendant` points at the active option.
- Shortcuts are exposed through `aria-keyshortcuts`, and the number of results is announced through a polite live region while searching.

## Localization

Strings live under `commandPalette.*`: `label`, `placeholder`, `noResults`, `resultCount`, `close`.
