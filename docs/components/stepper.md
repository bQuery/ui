# Stepper

The `bq-stepper` component shows progress through a multi-step flow such as a checkout or onboarding wizard.

## Basic Usage

Steps are declared as light-DOM children carrying `data-step`:

```html
<bq-stepper current="1">
  <div data-step label="Account"></div>
  <div data-step label="Shipping"></div>
  <div data-step label="Payment"></div>
</bq-stepper>
```

`current` is a zero-based index: everything before it is complete, the step at that index is current, the rest are upcoming.

## Descriptions

```html
<bq-stepper current="0">
  <div data-step label="Account" description="Your details"></div>
  <div data-step label="Shipping" description="Where it goes"></div>
  <div data-step label="Payment" description="How you pay"></div>
</bq-stepper>
```

## Orientation

```html
<bq-stepper current="1" orientation="vertical">
  <div data-step label="Account"></div>
  <div data-step label="Shipping"></div>
  <div data-step label="Payment"></div>
</bq-stepper>
```

## Clickable Steps

With `clickable`, each step renders as a button and emits `bq-step-change` when activated:

```html
<bq-stepper current="2" clickable>
  <div data-step label="Account"></div>
  <div data-step label="Shipping"></div>
  <div data-step label="Payment"></div>
</bq-stepper>
```

```js
stepper.addEventListener('bq-step-change', (event) => {
  console.log(event.detail); // { index: 0, label: 'Account' }
});
```

Add `disabled` to a step to keep it unreachable:

```html
<div data-step label="Payment" disabled></div>
```

## Properties

| Property      | Type      | Default        | Description                              |
| ------------- | --------- | -------------- | ---------------------------------------- |
| `current`     | `number`  | `0`            | Zero-based index of the active step      |
| `orientation` | `string`  | `'horizontal'` | `horizontal` \| `vertical`               |
| `clickable`   | `boolean` | `false`        | Render steps as buttons                  |
| `label`       | `string`  | `''`           | Accessible label for the step list       |

## Step Attributes

| Attribute     | Description                                    |
| ------------- | ---------------------------------------------- |
| `data-step`   | Marks the element as a step (required)         |
| `label`       | Step title                                     |
| `description` | Secondary text under the title                 |
| `disabled`    | Prevents activation when `clickable` is set    |

## Events

| Event             | Detail                             | Description                    |
| ----------------- | ---------------------------------- | ------------------------------ |
| `bq-step-change`  | `{ index: number, label: string }` | A clickable step was activated |

## CSS Parts

| Part          | Description                |
| ------------- | -------------------------- |
| `stepper`     | The stepper container      |
| `step`        | An individual step         |
| `marker`      | The numbered/checked circle |
| `label`       | Step title                 |
| `description` | Step description           |

## Accessibility

- The active step carries `aria-current="step"`.
- Each step includes visually hidden status text (`Completed`, `Current step`, `Upcoming step`) so its state is not conveyed by colour alone.
- A polite live region announces `Step N of M` as `current` changes.
- Step markers are `aria-hidden`; the label carries the accessible name.
- Steps are read from the light DOM and kept in sync with a `MutationObserver`, so steps can be added or relabelled at runtime.
