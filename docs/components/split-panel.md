# Split Panel

The `bq-split-panel` component places two panes side by side (or stacked) with a divider the user can drag or move with the keyboard. Use it for master–detail layouts, editors with a preview, or resizable sidebars.

## Import

```ts
import '@bquery/ui/components/split-panel';
```

## Basic Usage

```html
<bq-split-panel position="30" style="height: 24rem">
  <nav slot="start">Sidebar</nav>
  <main slot="end">Content</main>
</bq-split-panel>
```

`position` is the size of the start pane in percent. The panel fills its container's height, so give the container (or the panel) a height.

## Vertical Orientation

```html
<bq-split-panel orientation="vertical" position="60" style="height: 30rem">
  <section slot="start">Editor</section>
  <section slot="end">Terminal</section>
</bq-split-panel>
```

## Limits and Snap Points

```html
<bq-split-panel min="15" max="60" snap="25 33.33 50" position="25">
  <div slot="start">…</div>
  <div slot="end">…</div>
</bq-split-panel>
```

A drag that ends within 2 % of a snap point lands on it. Keyboard steps are exact and do not snap.

## Persisting the Layout

```js
const panel = document.querySelector('bq-split-panel');
panel.setAttribute('position', localStorage.getItem('split') ?? '30');
panel.addEventListener('bq-resize', (event) => {
  localStorage.setItem('split', String(event.detail.position));
});
```

## Custom Handle

```html
<bq-split-panel>
  <div slot="start">…</div>
  <span slot="divider" class="my-handle"></span>
  <div slot="end">…</div>
</bq-split-panel>
```

## Properties

| Property      | Type                         | Default      | Description                                          |
| ------------- | ---------------------------- | ------------ | ---------------------------------------------------- |
| `position`    | `number`                     | `50`         | Size of the start pane in percent.                   |
| `min`         | `number`                     | `0`          | Smallest allowed position.                           |
| `max`         | `number`                     | `100`        | Largest allowed position.                            |
| `step`        | `number`                     | `5`          | Arrow-key step in percent.                           |
| `snap`        | `string`                     | `''`         | Space- or comma-separated snap points in percent.    |
| `orientation` | `horizontal \| vertical`     | `horizontal` | Side by side, or stacked.                            |
| `disabled`    | `boolean`                    | `false`      | Locks the divider.                                   |
| `label`       | `string`                     | localized    | Accessible name of the divider.                      |

## Events

| Event       | Detail                 | Description                                  |
| ----------- | ---------------------- | -------------------------------------------- |
| `bq-resize` | `{ position: number }` | The position changed (drag, keys or Enter).  |

## Slots

| Slot      | Description                       |
| --------- | --------------------------------- |
| `start`   | First pane (left / top).          |
| `end`     | Second pane (right / bottom).     |
| `divider` | Replaces the default grip icon.   |

## CSS Parts and Custom Properties

Parts: `base`, `start`, `end`, `divider`, `handle`.

| Custom property            | Default  | Description              |
| -------------------------- | -------- | ------------------------ |
| `--bq-split-divider-size`  | `0.5rem` | Thickness of the divider |

## Keyboard Interactions

| Key                                  | Action                                                 |
| ------------------------------------ | ------------------------------------------------------ |
| `ArrowLeft` / `ArrowRight`           | Resize a horizontal split (mirrored in RTL).           |
| `ArrowUp` / `ArrowDown`              | Resize a vertical split.                               |
| `Home` / `End`                       | Jump to `min` / `max`.                                 |
| `Enter`                              | Collapse the start pane to `min`; press again to restore. |

## Accessibility Notes

- The divider implements the WAI-ARIA *window splitter* pattern: `role="separator"`, focusable, with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-controls` pointing at the start pane.
- The divider has a larger invisible hit area than its visible line, so it is easy to grab with a pointer or on touch.
- During a drag, text selection and pointer events inside the panes are suspended so the gesture is not interrupted.

## Localization

Strings live under `splitPanel.*`: `label`.
