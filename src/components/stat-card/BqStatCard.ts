/**
 * Stat card component - compact metric surface for dashboards and summaries.
 * @element bq-stat-card
 * @prop {string}  label   - Metric label
 * @prop {string}  value   - Primary metric value
 * @prop {string}  change  - Secondary delta or comparison value
 * @prop {string}  hint    - Supporting description
 * @prop {string}  trend   - up | down | neutral
 * @prop {string}  size    - sm | md
 * @prop {boolean} loading - Displays a loading skeleton while data is pending
 * @slot        - Additional supporting content rendered below the hint
 * @slot icon   - Optional icon or badge for the metric
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { getBaseStyles, srOnlyStyles } from '../../utils/styles.js';

type BqStatCardProps = {
  label: string;
  value: string;
  change: string;
  hint: string;
  trend: string;
  size: string;
  loading: boolean;
};

function getTrend(trend: string): 'up' | 'down' | 'neutral' {
  if (trend === 'up' || trend === 'down') return trend;
  return 'neutral';
}

function getSize(size: string): 'sm' | 'md' {
  return size === 'sm' ? 'sm' : 'md';
}

const definition: ComponentDefinition<BqStatCardProps> = {
  props: {
    label:   { type: String, default: '' },
    value:   { type: String, default: '' },
    change:  { type: String, default: '' },
    hint:    { type: String, default: '' },
    trend:   { type: String, default: 'neutral' },
    size:    { type: String, default: 'md' },
    loading: { type: Boolean, default: false },
  },
  styles: `
    ${getBaseStyles()}
    ${srOnlyStyles}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .card {
      display: grid;
      gap: var(--bq-space-4,1rem);
      min-height: 100%;
      padding: var(--bq-space-6,1.5rem);
      border-radius: var(--bq-radius-xl,0.75rem);
      border: 1px solid var(--bq-border-base,#e2e8f0);
      background: var(--bq-bg-base,#fff);
      box-shadow: var(--bq-shadow-sm);
      color: var(--bq-text-base,#0f172a);
      font-family: var(--bq-font-family-sans);
    }
    .card[data-size="sm"] {
      gap: var(--bq-space-3,0.75rem);
      padding: var(--bq-space-4,1rem);
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--bq-space-3,0.75rem);
    }
    .label {
      margin: 0;
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-medium,500);
      color: var(--bq-text-muted,#475569);
      line-height: 1.4;
    }
    .icon-slot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--bq-color-primary-600,#2563eb);
      min-width: 0;
      flex-shrink: 0;
    }
    .icon-slot slot[name="icon"]::slotted(*) {
      max-width: 100%;
    }
    .value-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--bq-space-3,0.75rem);
      flex-wrap: wrap;
    }
    .value {
      margin: 0;
      font-size: clamp(1.75rem, 4vw, 2.25rem);
      font-weight: var(--bq-font-weight-bold,700);
      line-height: 1.1;
      letter-spacing: -0.02em;
      color: var(--bq-text-base,#0f172a);
    }
    .card[data-size="sm"] .value {
      font-size: clamp(1.375rem, 3.5vw, 1.875rem);
    }
    .change {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      min-height: 2rem;
      padding: 0.25rem 0.625rem;
      border-radius: var(--bq-radius-full,9999px);
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-semibold,600);
      white-space: nowrap;
      background: var(--bq-bg-subtle,#f8fafc);
      color: var(--bq-text-muted,#475569);
    }
    .change[data-trend="up"] {
      background: color-mix(in srgb, var(--bq-color-success-500,#22c55e) 14%, transparent);
      color: var(--bq-color-success-700,#15803d);
    }
    .change[data-trend="down"] {
      background: color-mix(in srgb, var(--bq-color-danger-500,#ef4444) 14%, transparent);
      color: var(--bq-color-danger-700,#b91c1c);
    }
    .hint {
      margin: 0;
      font-size: var(--bq-font-size-sm,0.875rem);
      line-height: 1.5;
      color: var(--bq-text-muted,#475569);
    }
    .loading-layout {
      display: grid;
      gap: var(--bq-space-3,0.75rem);
    }
    .skeleton {
      position: relative;
      overflow: hidden;
      display: block;
      border-radius: var(--bq-radius-md,0.375rem);
      background: var(--bq-bg-subtle,#e2e8f0);
    }
    .skeleton::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
      animation: stat-card-shimmer 1.5s infinite;
    }
    .skeleton-label { width: 40%; height: 0.875rem; }
    .skeleton-value { width: 55%; height: 2.25rem; }
    .skeleton-hint  { width: 75%; height: 0.875rem; }
    @keyframes stat-card-shimmer {
      100% { transform: translateX(100%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .skeleton::after { animation: none; }
    }
  `,
  render({ props }) {
    const label = props.label.trim();
    const value = props.value.trim();
    const change = props.change.trim();
    const hint = props.hint.trim();
    const trend = getTrend(props.trend);
    const size = getSize(props.size);
    const describedBy = hint ? ' aria-describedby="stat-card-hint"' : '';
    const labelledBy = label ? ' aria-labelledby="stat-card-label"' : '';
    const busy = props.loading ? ' aria-busy="true"' : '';

    const body = props.loading
      ? `
        <div class="loading-layout" part="loading">
          <span class="skeleton skeleton-label" aria-hidden="true"></span>
          <span class="skeleton skeleton-value" aria-hidden="true"></span>
          <span class="skeleton skeleton-hint" aria-hidden="true"></span>
          <span class="sr-only" role="status">${escapeHtml(t('common.loading'))}</span>
        </div>
      `
      : `
        <div class="value-row">
          ${value ? `<p class="value" part="value">${escapeHtml(value)}</p>` : ''}
          ${change ? `<span class="change" part="change" data-trend="${trend}">${escapeHtml(change)}</span>` : ''}
        </div>
        ${hint ? `<p class="hint" id="stat-card-hint" part="hint">${escapeHtml(hint)}</p>` : ''}
        <slot></slot>
      `;

    return html`
      <article part="card" class="card" data-size="${size}"${labelledBy}${describedBy}${busy}>
        <div class="header" part="header">
          ${label ? `<p class="label" id="stat-card-label" part="label">${escapeHtml(label)}</p>` : '<span></span>'}
          <div class="icon-slot"><slot name="icon"></slot></div>
        </div>
        ${body}
      </article>
    `;
  },
};

component<BqStatCardProps>('bq-stat-card', definition);
