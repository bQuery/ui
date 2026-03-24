# Table

The `bq-table` component renders data tables with sortable columns, striped rows, bordered cells, hover highlighting, and a loading state.

## Basic Usage

```html
<bq-table
  columns='[{"key":"name","label":"Name"},{"key":"email","label":"Email"}]'
  rows='[{"name":"Alice","email":"alice@example.com"},{"name":"Bob","email":"bob@example.com"}]'
></bq-table>
```

## Sortable Columns

```html
<bq-table
  columns='[{"key":"name","label":"Name","sortable":true},{"key":"age","label":"Age","sortable":true}]'
  rows='[{"name":"Alice","age":30},{"name":"Bob","age":25},{"name":"Carol","age":35}]'
  sort-key="name"
  sort-dir="asc"
></bq-table>
```

## Striped & Bordered

```html
<bq-table
  striped
  bordered
  columns='[{"key":"id","label":"ID"},{"key":"product","label":"Product"},{"key":"price","label":"Price"}]'
  rows='[{"id":1,"product":"Widget","price":"$9.99"},{"id":2,"product":"Gadget","price":"$19.99"},{"id":3,"product":"Doohickey","price":"$4.99"}]'
></bq-table>
```

## Hover Highlight

```html
<bq-table
  hover
  columns='[{"key":"name","label":"Name"},{"key":"role","label":"Role"}]'
  rows='[{"name":"Alice","role":"Admin"},{"name":"Bob","role":"Editor"}]'
></bq-table>
```

## Loading State

```html
<bq-table
  loading
  columns='[{"key":"name","label":"Name"},{"key":"status","label":"Status"}]'
  rows="[]"
></bq-table>
```

## Properties

| Property   | Type            | Default | Description                                                    |
| ---------- | --------------- | ------- | -------------------------------------------------------------- |
| `columns`  | `string` (JSON) | —       | JSON array of column definitions (`{ key, label, sortable? }`) |
| `rows`     | `string` (JSON) | —       | JSON array of row data objects                                 |
| `caption`  | `string`        | —       | Accessible table caption                                       |
| `sort-key` | `string`        | —       | Key of the currently sorted column                             |
| `sort-dir` | `asc \| desc`   | —       | Current sort direction                                         |
| `striped`  | `boolean`       | `false` | Alternates row background colors                               |
| `bordered` | `boolean`       | `false` | Adds borders to cells                                          |
| `hover`    | `boolean`       | `false` | Highlights rows on hover                                       |
| `loading`  | `boolean`       | `false` | Shows a loading indicator                                      |

## Events

| Event     | Detail                         | Description                                                                         |
| --------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| `bq-sort` | `{ key: string, dir: string }` | Fired when a sortable column header is activated by click or keyboard (Enter/Space) |

## CSS Parts

| Part         | Description          |
| ------------ | -------------------- |
| `table`      | The table element    |
| `caption`    | Table caption        |
| `thead`      | Table header section |
| `header-row` | Header row           |
| `th`         | Header cell          |
| `tbody`      | Table body section   |
| `row`        | Body row             |
| `td`         | Body cell            |

## Accessibility

- The component preserves native `<table>` semantics for rows, headers, and cells.
- Sortable headers are keyboard-activatable with `Enter` and `Space`.
- Loading and empty states use localized copy from the i18n layer.
