/**
 * Icon button component - square button for icon-only actions.
 * @element bq-icon-button
 * @prop {string}  variant  - primary | secondary | outline | ghost | danger
 * @prop {string}  size     - sm | md | lg
 * @prop {boolean} disabled
 * @prop {boolean} loading
 * @prop {string}  label    - Accessible label (required)
 * @prop {string}  href
 * @slot - Icon content
 * @fires bq-click
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';

type BqIconButtonProps = {
  variant: string; size: string; disabled: boolean; loading: boolean;
  label: string; href: string;
};

const definition: ComponentDefinition<BqIconButtonProps> = {
  props: {
    variant: { type: String, default: 'ghost' },
    size:    { type: String, default: 'md' },
    disabled:{ type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    label:   { type: String, default: '' },
    href:    { type: String, default: '' },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: inline-block; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      border: 1.5px solid transparent; border-radius: var(--bq-radius-lg,0.5rem);
      font-family: var(--bq-font-family-sans); cursor: pointer;
      text-decoration: none; transition: background-color var(--bq-duration-fast) var(--bq-easing-standard),
        border-color var(--bq-duration-fast) var(--bq-easing-standard), opacity var(--bq-duration-fast);
      flex-shrink: 0;
    }
    .btn[data-size="sm"] { width: 2rem; height: 2rem; font-size: 1rem; }
    .btn[data-size="md"] { width: 2.5rem; height: 2.5rem; font-size: 1.125rem; }
    .btn[data-size="lg"] { width: 3rem; height: 3rem; font-size: 1.25rem; }
    .btn[data-variant="primary"] { background-color: var(--bq-color-primary-600,#2563eb); color: #fff; border-color: var(--bq-color-primary-600,#2563eb); }
    .btn[data-variant="primary"]:hover:not(:disabled) { background-color: var(--bq-color-primary-700,#1d4ed8); }
    .btn[data-variant="secondary"] { background-color: var(--bq-color-secondary-100,#f1f5f9); color: var(--bq-color-secondary-700,#334155); border-color: var(--bq-color-secondary-200,#e2e8f0); }
    .btn[data-variant="outline"] { background-color: transparent; color: var(--bq-color-primary-600,#2563eb); border-color: var(--bq-color-primary-600,#2563eb); }
    .btn[data-variant="ghost"] { background-color: transparent; color: var(--bq-color-secondary-700,#334155); }
    .btn[data-variant="ghost"]:hover:not(:disabled) { background-color: var(--bq-color-secondary-100,#f1f5f9); }
    .btn[data-variant="danger"] { background-color: var(--bq-color-danger-600,#dc2626); color: #fff; border-color: var(--bq-color-danger-600,#dc2626); }
    .btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .btn:disabled, .btn[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; }
    .spinner { width: 1em; height: 1em; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `,
  connected() {
    const self = this;
    const handler = (e: Event) => {
      if (self.hasAttribute('disabled') || self.hasAttribute('loading')) { e.preventDefault(); e.stopPropagation(); return; }
      self.dispatchEvent(new CustomEvent('bq-click', { detail: { originalEvent: e }, bubbles: true, composed: true }));
    };
    (self as unknown as Record<string, unknown>)['_clickHandler'] = handler;
    self.shadowRoot?.addEventListener('click', handler);
  },
  disconnected() {
    const handler = (this as unknown as Record<string, unknown>)['_clickHandler'] as EventListener | undefined;
    if (handler) this.shadowRoot?.removeEventListener('click', handler);
  },
  render({ props }) {
    const tag = props.href ? 'a' : 'button';
    const disabled = props.disabled || props.loading;
    return html`<${tag} part="button" class="btn" data-variant="${escapeHtml(props.variant)}" data-size="${escapeHtml(props.size)}"
      aria-label="${escapeHtml(props.label)}" type="${tag==='button'?'button':''}"
      ${props.href?`href="${escapeHtml(props.href)}"`:''} ${disabled?(props.disabled?'disabled aria-disabled="true"':'aria-disabled="true"'):''}
      ${props.loading?'aria-busy="true"':''} ${tag==='a'?'role="button"':''}
    >${props.loading?'<span class="spinner" aria-hidden="true"></span>':''}
    <slot></slot></${tag}>`;
  },
};

component<BqIconButtonProps>('bq-icon-button', definition);
