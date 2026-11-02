# Carousel

The `bq-carousel` component shows a series of slides one (or a few) at a time, with previous/next buttons, a slide picker, swipe support and optional automatic rotation.

## Import

```ts
import '@bquery/ui/components/carousel';
```

## Basic Usage

Every element child is a slide.

```html
<bq-carousel label="Product photos">
  <img src="/front.jpg" alt="Front view" />
  <img src="/side.jpg" alt="Side view" />
  <img src="/back.jpg" alt="Back view" />
</bq-carousel>
```

## Several Slides per View

```html
<bq-carousel label="Related articles" per-view="3" style="--bq-carousel-gap: 1.5rem">
  <bq-card>…</bq-card>
  <bq-card>…</bq-card>
  <bq-card>…</bq-card>
  <bq-card>…</bq-card>
</bq-carousel>
```

The indicators then represent each reachable start position.

## Looping and Autoplay

```html
<bq-carousel label="Highlights" loop autoplay="6000">
  …
</bq-carousel>
```

Automatic rotation:

- always shows a pause/play button (required by WCAG 2.2.2),
- pauses while the pointer is over the carousel or keyboard focus is inside it,
- never starts for users who prefer reduced motion,
- always wraps around, even without `loop`.

## Properties

| Property          | Type      | Default   | Description                                              |
| ----------------- | --------- | --------- | -------------------------------------------------------- |
| `index`           | `number`  | `0`       | Zero-based index of the first visible slide.             |
| `per-view`        | `number`  | `1`       | Number of slides visible at once.                        |
| `loop`            | `boolean` | `false`   | Wrap around at either end.                               |
| `autoplay`        | `number`  | `0`       | Rotation interval in ms (minimum 1000). `0` disables it. |
| `label`           | `string`  | localized | Accessible name of the carousel.                         |
| `hide-controls`   | `boolean` | `false`   | Hide the previous/next buttons.                          |
| `hide-indicators` | `boolean` | `false`   | Hide the slide picker.                                   |

## Events

| Event       | Detail              | Description                    |
| ----------- | ------------------- | ------------------------------ |
| `bq-change` | `{ index: number }` | The visible slide changed.     |

## CSS Parts and Custom Properties

Parts: `base`, `viewport`, `track`, `prev`, `next`, `indicators`, `indicator`, `play-toggle`.

| Custom property      | Default | Description           |
| -------------------- | ------- | --------------------- |
| `--bq-carousel-gap`  | `1rem`  | Space between slides  |

## Keyboard and Pointer Interactions

| Input                                     | Action                                       |
| ----------------------------------------- | -------------------------------------------- |
| `ArrowLeft` / `ArrowRight` on a control   | Previous / next slide (mirrored in RTL).     |
| Click an indicator                        | Jump to that slide.                          |
| Swipe left / right (touch, pen)           | Next / previous slide.                       |

## Accessibility Notes

- The carousel follows the WAI-ARIA carousel pattern: the region has `aria-roledescription="carousel"`, each slide becomes `role="group"` with `aria-roledescription="slide"` and a “2 of 5” label (unless it already has `aria-labelledby`).
- Slides outside the view are `inert` and `aria-hidden`, so neither Tab nor a screen reader reaches hidden content.
- The slide container is a polite live region, switched off while autoplay rotates so announcements do not pile up.
- Attributes written onto slides are removed again when the carousel is disconnected.

## Localization

Strings live under `carousel.*`: `label`, `prev`, `next`, `slide`, `goTo`, `pause`, `play`, `picker`.
