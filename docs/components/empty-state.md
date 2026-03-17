# Empty State

The `bq-empty-state` component is a placeholder for empty content areas with icon, title, description, and an action slot.

## Basic Usage

```html
<bq-empty-state
  icon="📭"
  title="No messages"
  description="You haven't received any messages yet."
></bq-empty-state>
```

## With Action Button

```html
<bq-empty-state
  icon="🔍"
  title="No results"
  description="Try adjusting your search or filters."
>
  <bq-button variant="primary">Clear filters</bq-button>
</bq-empty-state>
```

## Properties

| Property      | Type     | Default | Description                                      |
| ------------- | -------- | ------- | ------------------------------------------------ |
| `title`       | `string` | —       | Main heading (falls back to an i18n default)     |
| `description` | `string` | —       | Descriptive text (falls back to an i18n default) |
| `icon`        | `string` | —       | Icon character or emoji                          |

## Slots

| Slot        | Description                               |
| ----------- | ----------------------------------------- |
| *(default)* | Additional content such as action buttons |

## CSS Parts

| Part          | Description               |
| ------------- | ------------------------- |
| `empty-state` | The outer container       |
| `icon`        | The icon area             |
| `title`       | The heading element       |
| `description` | The description paragraph |
| `actions`     | The actions/slot area     |

## Accessibility

The component uses `role="status"` so assistive technology can announce the empty state.
