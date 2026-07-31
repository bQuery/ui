/**
 * Badge component - small status/label indicator.
 * @element bq-badge
 * @prop {string}  variant - primary | secondary | success | danger | warning | info | outline
 * @prop {string}  size    - sm | md | lg
 * @prop {boolean} pill    - fully-rounded
 * @slot - Badge content
 */
import { component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { baseStyles, reset } from '../../utils/styles.js';

type BqBadgeProps = { variant: string; size: string; pill: boolean };

const definition: ComponentDefinition<BqBadgeProps> = {
  props: {
    variant: { type: String, default: 'primary' },
    size:    { type: String, default: 'md' },
    pill:    { type: Boolean, default: false },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: inline-flex; }
    .badge {
      display: inline-flex; align-items: center; gap: 0.25rem;
      font-weight: var(--bq-font-weight-semibold,600); line-height: 1; white-space: nowrap;
      border-radius: var(--bq-radius-md,0.375rem);
    }
    :host([pill]) .badge { border-radius: var(--bq-radius-full,9999px); }
    .badge[data-size="sm"] { font-size: 0.6875rem; padding: 0.125rem 0.5rem; }
    .badge[data-size="md"] { font-size: 0.75rem; padding: 0.2rem 0.6rem; }
    .badge[data-size="lg"] { font-size: 0.875rem; padding: 0.3rem 0.75rem; }
    .badge[data-variant="primary"]   { background: var(--bq-intent-primary-bg); color: var(--bq-intent-primary-fg); }
    .badge[data-variant="secondary"] { background: var(--bq-intent-neutral-bg); color: var(--bq-intent-neutral-fg); }
    .badge[data-variant="success"]   { background: var(--bq-intent-success-bg); color: var(--bq-intent-success-fg); }
    .badge[data-variant="danger"]    { background: var(--bq-intent-danger-bg); color: var(--bq-intent-danger-fg); }
    .badge[data-variant="warning"]   { background: var(--bq-intent-warning-bg); color: var(--bq-intent-warning-fg); }
    .badge[data-variant="info"]      { background: var(--bq-intent-info-bg); color: var(--bq-intent-info-fg); }
    .badge[data-variant="outline"]   { background: transparent; color: var(--bq-text-base,#0f172a); border: 1.5px solid var(--bq-border-emphasis,#cbd5e1); }
  `,
  render({ props }) {
    return html`<span part="badge" class="badge" data-variant="${escapeHtml(props.variant)}" data-size="${escapeHtml(props.size)}"><slot></slot></span>`;
  },
};

component<BqBadgeProps>('bq-badge', definition);
