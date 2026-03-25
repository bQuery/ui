# Segmented Control

The `bq-segmented-control` component provides a compact, touch-friendly single-choice control for toggling between views, density modes, filters, or app states.

It fills the gap between a full tab set and a radio group by keeping the interaction inline while still exposing form participation and radio-group accessibility semantics.

## Import

```ts
import '@bquery/ui/components/segmented-control';
```

## Basic Usage

```html
<bq-segmented-control
  label="View mode"
  name="view"
  value="overview"
>
  <button value="overview">Overview</button>
  <button value="board">Board</button>
  <button value="activity">Activity</button>
</bq-segmented-control>
```

## Sizes

```html
<bq-segmented-control label="Density" size="sm" value="compact">
  <button value="compact">Compact</button>
  <button value="comfortable">Comfortable</button>
</bq-segmented-control>

<bq-segmented-control label="Density" size="md" value="comfortable">
  <button value="compact">Compact</button>
  <button value="comfortable">Comfortable</button>
</bq-segmented-control>

<bq-segmented-control label="Density" size="lg" value="spacious">
  <button value="comfortable">Comfortable</button>
  <button value="spacious">Spacious</button>
</bq-segmented-control>
```

## Full-Width Layout

Use `full-width` when each option should share the available width, which is especially useful on mobile layouts and settings screens.

```html
<bq-segmented-control
  label="Results layout"
  full-width
  value="cards"
>
  <button value="cards">Cards</button>
  <button value="table">Table</button>
  <button value="split">Split</button>
</bq-segmented-control>
```

## Disabled States

The host can disable the entire control, and individual segment buttons can also be disabled.

```html
<bq-segmented-control label="Publishing state" value="draft">
  <button value="draft">Draft</button>
  <button value="scheduled" disabled>Scheduled</button>
  <button value="published">Published</button>
</bq-segmented-control>
```

## Properties

| Property     | Type             | Default | Description                                                                    |
| ------------ | ---------------- | ------- | ------------------------------------------------------------------------------ |
| `label`      | `string`         | `''`    | Visible group label. Also used to label the radiogroup.                        |
| `hint`       | `string`         | `''`    | Supporting copy rendered below the control and linked with `aria-describedby`. |
| `name`       | `string`         | `''`    | Form field name used for the hidden proxy input.                               |
| `value`      | `string`         | `''`    | Selected segment value. Falls back to the first enabled segment when omitted.  |
| `size`       | `sm \| md \| lg` | `md`    | Controls the segment button sizing.                                            |
| `full-width` | `boolean`        | `false` | Expands the control and evenly distributes each segment.                       |
| `disabled`   | `boolean`        | `false` | Disables the entire control.                                                   |
| `aria-label` | `string`         | `''`    | Accessible label when you do not render a visible `label`.                     |

## Events

| Event       | Detail              | Description                              |
| ----------- | ------------------- | ---------------------------------------- |
| `bq-change` | `{ value: string }` | Fired when the selected segment changes. |

## Slots

| Slot        | Description                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| *(default)* | Segment buttons. Use native `<button value="...">...</button>` elements for the best accessibility and keyboard behavior. |

## CSS Parts

| Part      | Description                             |
| --------- | --------------------------------------- |
| `field`   | Wrapper around label, control, and hint |
| `label`   | Visible group label                     |
| `control` | Segmented control track                 |
| `hint`    | Supporting text                         |

## Keyboard Interactions

| Key                        | Action                                               |
| -------------------------- | ---------------------------------------------------- |
| `ArrowRight` / `ArrowDown` | Moves to the next enabled segment and selects it     |
| `ArrowLeft` / `ArrowUp`    | Moves to the previous enabled segment and selects it |
| `Home`                     | Selects the first enabled segment                    |
| `End`                      | Selects the last enabled segment                     |
| `Enter` / `Space`          | Selects the focused segment                          |

## Accessibility Notes

- The control uses `role="radiogroup"` and each slotted button receives `role="radio"` with `aria-checked`.
- A visible `label` is preferred. If the UI should stay label-free, pass a localizable `aria-label`.
- When neither `label` nor `aria-label` is provided, the radiogroup falls back to a localized generic label so it never becomes unnamed.
- The selected segment keeps `tabindex="0"` while inactive or disabled items move to `tabindex="-1"` to support roving focus.
- Arrow-key behavior follows the WAI-ARIA radio-group pattern and respects RTL layouts for horizontal navigation.

## Localization Notes

- Keep the `label`, `hint`, and each button’s text content fully localizable in the host application.
- Segment `value` attributes should stay stable across locales so application state and forms do not depend on translated text.

## Theming Notes

- The track and selected state use the shared token system (`--bq-bg-*`, `--bq-border-*`, `--bq-color-primary-*`, and focus-ring tokens).
- Use `::part(control)` for layout adjustments and host-level token overrides for bespoke themes without forking the component.
