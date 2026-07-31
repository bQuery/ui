/**
 * Meter — a scalar measurement inside a known range.
 *
 * Not a progress bar, and the distinction is not pedantic: progress runs from
 * nothing to done and only ever goes up, while a meter shows a *level* — disk
 * usage, password strength, a budget — which can sit anywhere and where the
 * interesting question is whether the value is in a good part of the range.
 *
 * That is what `low`, `high` and `optimum` encode, following the semantics of
 * the native `<meter>` element: the bar colours itself green, amber or red
 * depending on which band the value falls in and which end is preferable.
 *
 * @element bq-meter
 * @prop {number}  value
 * @prop {number}  min
 * @prop {number}  max
 * @prop {number}  low      - Upper bound of the "low" band
 * @prop {number}  high     - Lower bound of the "high" band
 * @prop {number}  optimum  - Where in the range is best
 * @prop {string}  label
 * @prop {string}  value-text - Overrides the rendered value, e.g. "72 GB of 100 GB"
 * @prop {boolean} show-value
 * @prop {string}  size     - sm | md | lg
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { baseStyles, fieldStyles, reset } from '../../utils/styles.js';

type BqMeterProps = {
  value: number;
  min: number;
  max: number;
  low: number;
  high: number;
  optimum: number;
  label: string;
  'value-text': string;
  'show-value': boolean;
  size: string;
};

/** Which band a meter reading falls into, relative to the preferred end. */
export type MeterLevel = 'optimum' | 'suboptimum' | 'poor';

/**
 * Classifies a value the way the HTML `<meter>` element does.
 *
 * The bands themselves say nothing about good or bad — `optimum` does. A disk
 * gauge wants a low reading, a battery wants a high one, and the same `low`
 * and `high` bounds serve both depending on where the optimum sits.
 */
export function meterLevel(
  value: number,
  min: number,
  max: number,
  low: number,
  high: number,
  optimum: number
): MeterLevel {
  const inLow = value < low;
  const inHigh = value > high;

  if (optimum < low) {
    // Lower is better.
    if (inLow) return 'optimum';
    return inHigh ? 'poor' : 'suboptimum';
  }
  if (optimum > high) {
    // Higher is better.
    if (inHigh) return 'optimum';
    return inLow ? 'poor' : 'suboptimum';
  }
  // The middle band is preferred; both extremes are equally wrong.
  if (!inLow && !inHigh) return 'optimum';
  return 'suboptimum';
}

/** Clamps a value into `[min, max]`, tolerating a reversed or degenerate range. */
function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (max <= min) return min;
  return Math.min(max, Math.max(min, value));
}

const definition: ComponentDefinition<BqMeterProps> = {
  props: {
    value: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    low: { type: Number, default: Number.NaN },
    high: { type: Number, default: Number.NaN },
    optimum: { type: Number, default: Number.NaN },
    label: { type: String, default: '' },
    'value-text': { type: String, default: '' },
    'show-value': { type: Boolean, default: false },
    size: { type: String, default: 'md' },
  },
  sanitize: { allowAttributes: ['style'] },
  styles: css`
    ${baseStyles}
    ${reset}
    ${fieldStyles}
    :host { display: block; }
    .field { gap: 0.375rem; }
    .head {
      display: flex; align-items: baseline; justify-content: space-between;
      gap: 0.75rem;
    }
    .value {
      font-size: var(--bq-font-size-sm, 0.875rem);
      font-weight: var(--bq-font-weight-medium, 500);
      color: var(--bq-text-muted, #475569);
      font-variant-numeric: tabular-nums;
    }
    .track {
      position: relative;
      block-size: var(--bq-meter-height, 0.5rem);
      inline-size: 100%;
      background: var(--bq-bg-muted, #f1f5f9);
      border-radius: var(--bq-radius-full, 9999px);
      overflow: hidden;
    }
    :host([size='sm']) .track { --bq-meter-height: 0.25rem; }
    :host([size='lg']) .track { --bq-meter-height: 0.75rem; }
    .bar {
      block-size: 100%;
      border-radius: inherit;
      background: var(--bq-color-primary-600, #2563eb);
      transition: inline-size var(--bq-duration-slow) var(--bq-easing-decelerate),
                  background-color var(--bq-duration-normal) var(--bq-easing-standard);
    }
    .bar[data-level='optimum'] { background: var(--bq-color-success-600, #16a34a); }
    .bar[data-level='suboptimum'] { background: var(--bq-color-warning-500, #f59e0b); }
    .bar[data-level='poor'] { background: var(--bq-color-danger-600, #dc2626); }

    @media (forced-colors: active) {
      .track { border: 1px solid CanvasText; }
      .bar { background: Highlight !important; }
    }
  `,
  render({ props }) {
    const min = Number.isFinite(props.min) ? props.min : 0;
    const max = Number.isFinite(props.max) ? props.max : 100;
    const value = clamp(props.value, min, max);
    const span = max - min;
    const ratio = span > 0 ? (value - min) / span : 0;
    const percent = Math.round(ratio * 1000) / 10;

    // Bands are optional; a meter with none is a plain gauge in the accent
    // colour, which is the right default for "just show me the level".
    const graded =
      Number.isFinite(props.low) ||
      Number.isFinite(props.high) ||
      Number.isFinite(props.optimum);
    const low = Number.isFinite(props.low) ? props.low : min;
    const high = Number.isFinite(props.high) ? props.high : max;
    const optimum = Number.isFinite(props.optimum) ? props.optimum : max;
    const level = graded
      ? meterLevel(value, min, max, low, high, optimum)
      : '';

    const valueText =
      props['value-text'].trim() || `${value}${span > 0 ? ` / ${max}` : ''}`;

    return html`
      <div class="field" part="field">
        ${
          props.label || props['show-value']
            ? `<div class="head">
                ${props.label ? `<span class="label" part="label">${escapeHtml(props.label)}</span>` : '<span></span>'}
                ${props['show-value'] ? `<span class="value" part="value">${escapeHtml(valueText)}</span>` : ''}
              </div>`
            : ''
        }
        <div
          class="track"
          part="track"
          role="meter"
          aria-valuenow="${escapeHtml(String(value))}"
          aria-valuemin="${escapeHtml(String(min))}"
          aria-valuemax="${escapeHtml(String(max))}"
          aria-valuetext="${escapeHtml(valueText)}"
          ${props.label ? `aria-label="${escapeHtml(props.label)}"` : ''}
        >
          <div
            class="bar"
            part="bar"
            ${level ? `data-level="${level}"` : ''}
            style="inline-size: ${percent}%"
          ></div>
        </div>
      </div>
    `;
  },
};

component<BqMeterProps>('bq-meter', definition);
