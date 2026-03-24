# Progress

The `bq-progress` component is a determinate or indeterminate progress bar.

## Basic Usage

```html
<bq-progress value="60" label="Upload progress"></bq-progress>
```

## Indeterminate

```html
<bq-progress indeterminate label="Loading"></bq-progress>
```

## Variants

```html
<bq-progress value="75" variant="primary"></bq-progress>
<bq-progress value="75" variant="success"></bq-progress>
<bq-progress value="75" variant="danger"></bq-progress>
<bq-progress value="75" variant="warning"></bq-progress>
```

## Sizes

```html
<bq-progress value="50" size="sm"></bq-progress>
<bq-progress value="50" size="md"></bq-progress>
<bq-progress value="50" size="lg"></bq-progress>
```

## Custom Max

```html
<bq-progress value="3" max="5" label="Step 3 of 5"></bq-progress>
```

## Properties

| Property        | Type      | Default     | Description                                     |
| --------------- | --------- | ----------- | ----------------------------------------------- |
| `value`         | `number`  | `0`         | Current value (0 to `max`)                      |
| `max`           | `number`  | `100`       | Maximum value                                   |
| `size`          | `string`  | `'md'`      | `sm` \| `md` \| `lg`                            |
| `variant`       | `string`  | `'primary'` | `primary` \| `success` \| `danger` \| `warning` |
| `indeterminate` | `boolean` | `false`     | Indeterminate loading animation                 |
| `label`         | `string`  | —           | Accessible label for screen readers             |

## CSS Parts

| Part    | Description             |
| ------- | ----------------------- |
| `track` | The background track    |
| `bar`   | The filled progress bar |
| `label` | The label element       |

## Accessibility

The component exposes `role="progressbar"` on the visual track element.

- Determinate progress sets `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and a localized `aria-valuetext`.
- Indeterminate progress omits the numeric value and instead uses `aria-busy="true"` with localized loading text.
- The `label` prop provides the accessible name. When omitted, a localized fallback label is used.
