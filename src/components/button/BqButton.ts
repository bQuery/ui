/**
 * Button component - primary interactive control.
 * @element bq-button
 * @prop {string}  variant  - primary | secondary | outline | ghost | danger
 * @prop {string}  size     - sm | md | lg | xl
 * @prop {boolean} disabled
 * @prop {boolean} loading
 * @prop {string}  type     - button | submit | reset
 * @prop {string}  href
 * @prop {string}  target
 * @prop {string}  label    - Optional accessible label override
 * @slot          - Button content
 * @slot prefix-icon - Icon before content
 * @slot suffix-icon - Icon after content
 * @fires bq-click - { originalEvent: Event }
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { uniqueId } from '../../utils/dom.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqButtonProps = {
  variant: string;
  size: string;
  disabled: boolean;
  loading: boolean;
  type: string;
  href: string;
  target: string;
  label: string;
};
type BqButtonState = { statusId: string };

const definition: ComponentDefinition<BqButtonProps, BqButtonState> = {
  props: {
    variant: { type: String, default: 'primary' },
    size:    { type: String, default: 'md' },
    disabled:{ type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    type:    { type: String, default: 'button' },
    href:    { type: String, default: '' },
    target:  { type: String, default: '' },
    label:   { type: String, default: '' },
  },
  state: {
    statusId: '',
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: inline-block; }
    :host([hidden]) { display: none; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 0.5rem; border: 1.5px solid transparent;
      border-radius: var(--bq-radius-lg, 0.5rem);
      font-family: var(--bq-font-family-sans);
      font-weight: var(--bq-font-weight-semibold, 600);
      line-height: 1; cursor: pointer; text-decoration: none;
      transition: background-color var(--bq-duration-fast) var(--bq-easing-standard),
                  border-color var(--bq-duration-fast) var(--bq-easing-standard),
                  box-shadow var(--bq-duration-fast) var(--bq-easing-standard),
                  opacity var(--bq-duration-fast) var(--bq-easing-standard);
      white-space: nowrap; user-select: none; -webkit-user-select: none;
      position: relative; overflow: hidden;
    }
    /* Sizes */
    .btn[data-size="sm"] { font-size: 0.875rem; padding: 0.375rem 0.75rem; min-height: 2rem; }
    .btn[data-size="md"] { font-size: 1rem; padding: 0.5rem 1rem; min-height: 2.5rem; }
    .btn[data-size="lg"] { font-size: 1.125rem; padding: 0.625rem 1.25rem; min-height: 3rem; }
    .btn[data-size="xl"] { font-size: 1.25rem; padding: 0.75rem 1.5rem; min-height: 3.5rem; }
    /* Variants */
    .btn[data-variant="primary"] { background-color: var(--bq-color-primary-600,#2563eb); color: #fff; border-color: var(--bq-color-primary-600,#2563eb); }
    .btn[data-variant="primary"]:hover:not(:disabled) { background-color: var(--bq-color-primary-700,#1d4ed8); border-color: var(--bq-color-primary-700,#1d4ed8); }
    .btn[data-variant="secondary"] { background-color: var(--bq-color-secondary-100,#f1f5f9); color: var(--bq-color-secondary-700,#334155); border-color: var(--bq-color-secondary-200,#e2e8f0); }
    .btn[data-variant="secondary"]:hover:not(:disabled) { background-color: var(--bq-color-secondary-200,#e2e8f0); }
    .btn[data-variant="outline"] { background-color: transparent; color: var(--bq-color-primary-600,#2563eb); border-color: var(--bq-color-primary-600,#2563eb); }
    .btn[data-variant="outline"]:hover:not(:disabled) { background-color: var(--bq-color-primary-50,#eff6ff); }
    .btn[data-variant="ghost"] { background-color: transparent; color: var(--bq-color-secondary-700,#334155); border-color: transparent; }
    .btn[data-variant="ghost"]:hover:not(:disabled) { background-color: var(--bq-color-secondary-100,#f1f5f9); }
    .btn[data-variant="danger"] { background-color: var(--bq-color-danger-600,#dc2626); color: #fff; border-color: var(--bq-color-danger-600,#dc2626); }
    .btn[data-variant="danger"]:hover:not(:disabled) { background-color: var(--bq-color-danger-700,#b91c1c); }
    /* States */
    .btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .btn[data-variant="danger"]:focus-visible { box-shadow: var(--bq-focus-ring-danger); }
    .btn:disabled, .btn[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; }
    /* Loading spinner */
    .spinner { width: 1em; height: 1em; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.7s linear infinite; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      .btn, .spinner { transition: none; animation: none; }
    }
  `,
  connected() {
    type BqButtonElement = HTMLElement & { setState(k: 'statusId', v: string): void; getState<T>(k: string): T };
    const self = this as unknown as BqButtonElement;
    if (!self.getState<string>('statusId')) self.setState('statusId', uniqueId('bq-button-status'));
    const handler = (e: Event) => {
      if (self.hasAttribute('disabled') || self.hasAttribute('loading')) {
        e.preventDefault(); e.stopPropagation(); return;
      }
      self.dispatchEvent(new CustomEvent('bq-click', { detail: { originalEvent: e }, bubbles: true, composed: true }));
    };
    (self as unknown as Record<string, unknown>)['_clickHandler'] = handler;
    self.shadowRoot?.addEventListener('click', handler);
  },
  disconnected() {
    const self = this;
    const handler = (self as unknown as Record<string, unknown>)['_clickHandler'] as EventListener | undefined;
    if (handler) self.shadowRoot?.removeEventListener('click', handler);
  },
  render({ props, state }) {
    const tag = props.href ? 'a' : 'button';
    const isLink = tag === 'a';
    const disabled = props.disabled || props.loading;
    const accessibleLabel = props.label.trim();
    const loadingLabel = t('common.loading');
    const statusId = state.statusId || 'bq-button-status';
    return html`
      <${tag}
        part="button"
        class="btn"
        data-variant="${escapeHtml(props.variant)}"
        data-size="${escapeHtml(props.size)}"
        ${!isLink ? `type="${escapeHtml(props.type)}"` : ''}
        ${props.href ? `href="${escapeHtml(props.href)}"` : ''}
        ${props.target ? `target="${escapeHtml(props.target)}"` : ''}
        ${!isLink && disabled ? 'disabled' : ''}
        ${disabled ? 'aria-disabled="true"' : ''}
        ${isLink && disabled ? 'tabindex="-1"' : ''}
        ${props.loading ? 'aria-busy="true"' : ''}
        ${props.loading ? `aria-describedby="${escapeHtml(statusId)}"` : ''}
        ${accessibleLabel ? `aria-label="${escapeHtml(accessibleLabel)}"` : ''}
      >
        <slot name="prefix-icon"></slot>
        ${props.loading ? '<span class="spinner" aria-hidden="true"></span>' : ''}
        <slot></slot>
        <slot name="suffix-icon"></slot>
      </${tag}>
      ${props.loading ? `<span class="sr-only" id="${escapeHtml(statusId)}" role="status" aria-live="polite">${escapeHtml(loadingLabel)}</span>` : ''}
    `;
  },
};

component<BqButtonProps, BqButtonState>('bq-button', definition);
