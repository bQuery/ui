# Tree

`bq-tree` renders hierarchical data — a file browser, a category picker, an
org chart — with the full ARIA tree keyboard pattern.

That pattern is the reason the component exists. A tree is not a nested list of
buttons: the whole widget is a single tab stop, and the arrow keys move a
*roving* focus through the nodes that are currently visible.

## Basic Usage

```html
<bq-tree
  label="Project files"
  expanded="src"
  items='[
    {"id":"src","label":"src","icon":"folder","children":[
      {"id":"index","label":"index.ts","icon":"file"}
    ]},
    {"id":"readme","label":"README.md","icon":"file"}
  ]'
></bq-tree>
```

Nodes are supplied as JSON, matching `bq-table`. Each node takes:

| Field      | Type         | Description                                     |
| ---------- | ------------ | ----------------------------------------------- |
| `id`       | `string`     | Unique identifier; used by `expanded`/`selected` |
| `label`    | `string`     | Visible text                                    |
| `children` | `TreeNode[]` | Child nodes; presence makes the node a branch    |
| `disabled` | `boolean`    | Not selectable, skipped by the arrow keys        |
| `icon`     | `string`     | Icon name drawn before the label                |

## Keyboard

| Key                 | Action                                              |
| ------------------- | --------------------------------------------------- |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Move to the next / previous visible node    |
| <kbd>→</kbd>        | Open a closed branch, or move into an open one      |
| <kbd>←</kbd>        | Close an open branch, or move to the parent         |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to the first / last visible node   |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Select the focused node              |
| <kbd>*</kbd>        | Open every branch at the current level              |
| any letter          | Jump to the next node starting with it              |

## Controlled state

`expanded` and `selected` are comma-separated id lists, and both are reflected
back onto the element — so a tree can be driven entirely from attributes:

```js
const tree = document.querySelector('bq-tree');

tree.addEventListener('bq-select', (e) => {
  console.log(e.detail.id, e.detail.node);
});

tree.addEventListener('bq-expand', (e) => {
  console.log(e.detail.id, e.detail.expanded);
});

tree.setAttribute('expanded', 'src,components');
```

## Multiple selection

```html
<bq-tree multiple selected="a,b" items="…"></bq-tree>
```

## Properties

| Property   | Type      | Default | Description                          |
| ---------- | --------- | ------- | ------------------------------------ |
| `items`    | `string`  | `'[]'`  | JSON array of nodes                  |
| `expanded` | `string`  | `''`    | Comma-separated ids of open branches |
| `selected` | `string`  | `''`    | Comma-separated ids of selected nodes |
| `label`    | `string`  | `''`    | Accessible name for the tree         |
| `multiple` | `boolean` | `false` | Allow more than one selected node    |
| `disabled` | `boolean` | `false` |                                      |

## Events

| Event       | Detail                                          |
| ----------- | ----------------------------------------------- |
| `bq-select` | `{ id: string, ids: string[], node: TreeNode }` |
| `bq-expand` | `{ id: string, expanded: boolean }`             |

## CSS Parts

| Part     | Description                    |
| -------- | ------------------------------ |
| `tree`   | The root list                  |
| `node`   | A single node row              |
| `twisty` | The expand/collapse arrow      |
| `label`  | A node's text                  |

## Accessibility

- The root is `role="tree"`; nodes are `role="treeitem"` with `aria-level`,
  `aria-selected` and — on branches only — `aria-expanded`.
- Exactly one node is in the tab order at a time, and the arrow keys move it.
- Clicking the arrow opens a branch without selecting it; clicking the row
  does both.
