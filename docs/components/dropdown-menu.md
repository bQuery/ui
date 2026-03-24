# Dropdown Menu

The `bq-dropdown-menu` component is a trigger-activated overlay for actions or navigation links. It follows the [WAI-ARIA Menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/) with full keyboard navigation.

## Basic Usage

```html
<bq-dropdown-menu label="Actions">
  <button slot="trigger">Options ▾</button>
  <button data-value="edit">Edit</button>
  <button data-value="duplicate">Duplicate</button>
  <hr />
  <button data-value="delete">Delete</button>
</bq-dropdown-menu>
```

## Placement

Control where the menu appears relative to the trigger.

```html
<bq-dropdown-menu placement="bottom-start">
  <button slot="trigger">Bottom Start ▾</button>
  <button>Item 1</button>
</bq-dropdown-menu>

<bq-dropdown-menu placement="bottom-end">
  <button slot="trigger">Bottom End ▾</button>
  <button>Item 1</button>
</bq-dropdown-menu>

<bq-dropdown-menu placement="top-start">
  <button slot="trigger">Top Start ▴</button>
  <button>Item 1</button>
</bq-dropdown-menu>

<bq-dropdown-menu placement="top-end">
  <button slot="trigger">Top End ▴</button>
  <button>Item 1</button>
</bq-dropdown-menu>
```

## With Links

```html
<bq-dropdown-menu label="Navigation">
  <button slot="trigger">Go to ▾</button>
  <a href="/dashboard">Dashboard</a>
  <a href="/settings">Settings</a>
  <a href="/profile">Profile</a>
</bq-dropdown-menu>
```

## Disabled

```html
<bq-dropdown-menu disabled>
  <button slot="trigger" disabled>Unavailable ▾</button>
  <button>Item 1</button>
</bq-dropdown-menu>
```

## With Separators

Use `<hr>` elements to visually separate groups of items.

```html
<bq-dropdown-menu label="File actions">
  <button slot="trigger">File ▾</button>
  <button data-value="new">New</button>
  <button data-value="open">Open</button>
  <button data-value="save">Save</button>
  <hr />
  <button data-value="export">Export</button>
  <button data-value="print">Print</button>
</bq-dropdown-menu>
```

## Properties

| Property    | Type      | Default        | Description                                         |
| ----------- | --------- | -------------- | --------------------------------------------------- |
| `label`     | `string`  | —              | Accessible label for the menu                       |
| `placement` | `string`  | `bottom-start` | `bottom-start` \| `bottom-end` \| `top-start` \| `top-end` |
| `open`      | `boolean` | `false`        | Whether the menu is open                            |
| `disabled`  | `boolean` | `false`        | Disables the dropdown                               |

## Events

| Event       | Detail              | Description                                 |
| ----------- | ------------------- | ------------------------------------------- |
| `bq-open`   | —                   | Fired when the menu opens                   |
| `bq-close`  | —                   | Fired when the menu closes                  |
| `bq-select` | `{ value: string }` | Fired when a menu item is activated          |

The `value` in `bq-select` comes from the item's `data-value` attribute, or falls back to the item's text content.

## Slots

| Slot        | Description                             |
| ----------- | --------------------------------------- |
| `trigger`   | Element that opens the menu             |
| *(default)* | Menu items (`<button>`, `<a>`, `<hr>`)  |

## CSS Parts

| Part      | Description           |
| --------- | --------------------- |
| `trigger` | The trigger wrapper   |
| `menu`    | The dropdown menu     |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` / `Space` / `ArrowDown` on trigger | Opens the menu and focuses the first item |
| `ArrowDown` | Moves focus to the next item |
| `ArrowUp` | Moves focus to the previous item |
| `Home` | Moves focus to the first item |
| `End` | Moves focus to the last item |
| `Escape` | Closes the menu and returns focus to the trigger |
| `Tab` | Closes the menu and moves focus according to the browser's tab order (does not return focus to the trigger) |

## Accessibility

- Menu container has `role="menu"` with optional `aria-label`
- Trigger slot has `aria-haspopup="menu"` and `aria-expanded`
- Trigger has `aria-controls` pointing to the menu's unique `id`
- Focus is managed: opening moves focus to first item; closing via Escape, outside click, or item selection returns focus to the trigger, while `Tab` closes the menu without restoring focus
- Click-outside closes the menu
- Disabled items are skipped during keyboard navigation

## Localization

The following i18n keys are available for use with the dropdown menu:

| Key | Default | Usage |
|-----|---------|-------|
| `dropdownMenu.open` | "Open menu" | Can be used as trigger label |
| `dropdownMenu.close` | "Close menu" | Can be used programmatically |
