/**
 * Progress bar component.
 * @element bq-progress
 * @prop {number}  value         - Current value (0-max)
 * @prop {number}  max           - Maximum value
 * @prop {string}  size          - sm | md | lg
 * @prop {string}  variant       - primary | success | danger | warning
 * @prop {boolean} indeterminate - Indeterminate/loading state
 * @prop {string}  label         - Accessible label
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';

type BqProgressProps = { value: number; max: number; size: string; variant: string; indeterminate: boolean; label: string };

const definition: ComponentDefinition<BqProgressProps> = {
  props: {
    value:         { type: Number, default: 0 },
    max:           { type: Number, default: 100 },
    size:          { type: String, default: 'md' },
    variant:       { type: String, default: 'primary' },
    indeterminate: { type: Boolean, default: false },
    label:         { type: String, default: '' },
  },
  styles: `
    ${getBaseStyles()}
    :host { display: block; }
    .track {
      background: var(--bq-bg-emphasis,#e2e8f0); border-radius: var(--bq-radius-full,9999px);
      overflow: hidden; width: 100%;
    }
    .track[data-size="sm"] { height: 0.375rem; }
    .track[data-size="md"] { height: 0.625rem; }
    .track[data-size="lg"] { height: 1rem; }
    .bar {
      height: 100%; border-radius: inherit;
      transition: width var(--bq-duration-normal) var(--bq-easing-standard);
    }
    .bar[data-variant="primary"] { background: var(--bq-color-primary-600,#2563eb); }
    .bar[data-variant="success"] { background: var(--bq-color-success-600,#16a34a); }
    .bar[data-variant="danger"]  { background: var(--bq-color-danger-600,#dc2626); }
    .bar[data-variant="warning"] { background: var(--bq-color-warning-600,#d97706); }
    :host([indeterminate]) .bar {
      width: 40% !important;
      animation: indeterminate 1.4s linear infinite;
    }
    @keyframes indeterminate { 0% { transform: translateX(-150%); } 100% { transform: translateX(350%); } }
    .label { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); margin-bottom: 0.375rem; font-family: var(--bq-font-family-sans); }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
    @media (prefers-reduced-motion: reduce) {
      .bar { transition: none; }
      :host([indeterminate]) .bar { animation: none; width: 40% !important; opacity: 0.7; }
    }
  `,
  render({ props }) {
    const pct = props.indeterminate ? 0 : Math.min(100, Math.max(0, (props.value / props.max) * 100));
    return html`
      ${props.label ? `<div class="label" part="label">${escapeHtml(props.label)}</div>` : ''}
      <div part="track" class="track" data-size="${escapeHtml(props.size)}"
        role="progressbar" aria-valuenow="${props.indeterminate ? '' : String(props.value)}"
        aria-valuemin="0" aria-valuemax="${String(props.max)}"
        aria-label="${escapeHtml(props.label || 'Progress')}">
        <div part="bar" class="bar" data-variant="${escapeHtml(props.variant)}" data-value="${String(Math.round(pct))}"
          style="width:${String(Math.round(pct))}%"></div>
      </div>
      <span class="sr-only">${escapeHtml(props.label ? `${props.label}: ${Math.round(pct)}%` : `${Math.round(pct)}%`)}</span>
    `;
  },
};

component<BqProgressProps>('bq-progress', definition);
