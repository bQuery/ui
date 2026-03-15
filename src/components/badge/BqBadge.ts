/**
 * Badge component - small status/label indicator.
 * @element bq-badge
 * @prop {string}  variant - primary | secondary | success | danger | warning | info | outline
 * @prop {string}  size    - sm | md | lg
 * @prop {boolean} pill    - fully-rounded
 * @slot - Badge content
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';

type BqBadgeProps = { variant: string; size: string; pill: boolean };

const definition: ComponentDefinition<BqBadgeProps> = {
  props: {
    variant: { type: String, default: 'primary' },
    size:    { type: String, default: 'md' },
    pill:    { type: Boolean, default: false },
  },
  styles: `
    ${getBaseStyles()}
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
    .badge[data-variant="primary"]   { background: var(--bq-color-primary-100,#dbeafe); color: var(--bq-color-primary-700,#1d4ed8); }
    .badge[data-variant="secondary"] { background: var(--bq-color-secondary-100,#f1f5f9); color: var(--bq-color-secondary-700,#334155); }
    .badge[data-variant="success"]   { background: var(--bq-color-success-100,#dcfce7); color: var(--bq-color-success-700,#15803d); }
    .badge[data-variant="danger"]    { background: var(--bq-color-danger-100,#fee2e2); color: var(--bq-color-danger-700,#b91c1c); }
    .badge[data-variant="warning"]   { background: var(--bq-color-warning-100,#fef3c7); color: var(--bq-color-warning-700,#b45309); }
    .badge[data-variant="info"]      { background: var(--bq-color-info-100,#dbeafe); color: var(--bq-color-info-700,#1d4ed8); }
    .badge[data-variant="outline"]   { background: transparent; color: var(--bq-text-base,#0f172a); border: 1.5px solid var(--bq-border-emphasis,#cbd5e1); }
  `,
  render({ props }) {
    return html`<span part="badge" class="badge" data-variant="${escapeHtml(props.variant)}" data-size="${escapeHtml(props.size)}"><slot></slot></span>`;
  },
};

export function registerBqBadge(prefix = 'bq'): string {
  const tag = `${prefix}-badge`;
  component<BqBadgeProps>(tag, definition);
  return tag;
}
