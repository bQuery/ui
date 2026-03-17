/**
 * Spinner / loading indicator.
 * @element bq-spinner
 * @prop {string} size    - xs | sm | md | lg | xl
 * @prop {string} variant - primary | secondary | danger | success | white
 * @prop {string} label   - Accessible label (sr-only)
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqSpinnerProps = { size: string; variant: string; label: string };

const definition: ComponentDefinition<BqSpinnerProps> = {
  props: {
    size:    { type: String, default: 'md' },
    variant: { type: String, default: 'primary' },
    label:   { type: String, default: '' },
  },
  styles: `
    ${getBaseStyles()}
    :host { display: inline-flex; align-items: center; justify-content: center; }
    .spinner {
      border-radius: 50%; animation: spin 0.7s linear infinite;
      border-top-color: transparent;
    }
    .spinner[data-size="xs"] { width: 1rem;   height: 1rem;   border-width: 2px; }
    .spinner[data-size="sm"] { width: 1.25rem; height: 1.25rem; border-width: 2px; }
    .spinner[data-size="md"] { width: 1.75rem; height: 1.75rem; border-width: 2.5px; }
    .spinner[data-size="lg"] { width: 2.5rem; height: 2.5rem; border-width: 3px; }
    .spinner[data-size="xl"] { width: 3.5rem; height: 3.5rem; border-width: 4px; }
    .spinner[data-variant="primary"]   { border: 2.5px solid var(--bq-color-primary-200,#bfdbfe); border-top-color: var(--bq-color-primary-600,#2563eb); }
    .spinner[data-variant="secondary"] { border: 2.5px solid var(--bq-color-secondary-200,#e2e8f0); border-top-color: var(--bq-color-secondary-600,#475569); }
    .spinner[data-variant="danger"]    { border: 2.5px solid var(--bq-color-danger-100,#fee2e2); border-top-color: var(--bq-color-danger-600,#dc2626); }
    .spinner[data-variant="success"]   { border: 2.5px solid var(--bq-color-success-100,#dcfce7); border-top-color: var(--bq-color-success-600,#16a34a); }
    .spinner[data-variant="white"]     { border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      .spinner { animation: none; }
    }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  `,
  render({ props }) {
    const trimmedLabel = props.label.trim();
    const label = trimmedLabel !== '' ? trimmedLabel : t('common.loading');
    return html`<div class="spinner-root" role="status" aria-live="polite" aria-label="${escapeHtml(label)}">
      <div part="spinner" class="spinner" data-size="${escapeHtml(props.size)}" data-variant="${escapeHtml(props.variant)}" aria-hidden="true"></div>
      <span class="sr-only">${escapeHtml(label)}</span>
    </div>`;
  },
};

component<BqSpinnerProps>('bq-spinner', definition);
