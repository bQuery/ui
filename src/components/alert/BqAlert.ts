import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';
import { t } from '../../i18n/index.js';

/**
 * Alert component.
 * @element bq-alert
 * @prop {string} variant    - info | success | warning | danger
 * @prop {string} title      - Alert title
 * @prop {boolean} dismissible
 * @prop {boolean} open      - Controlled visibility
 * @slot - Alert body
 * @fires bq-close
 */
export class BqAlert extends HTMLElement {
  static get observedAttributes() { return ['variant', 'title', 'dismissible', 'open']; }
  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-alert');
  }

  connectedCallback() {
    if (!this.hasAttribute('open')) this.setAttribute('open', '');
    this._render();
  }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const variant = this.getAttribute('variant') ?? 'info';
    const title = this.getAttribute('title') ?? '';
    const dismissible = this.hasAttribute('dismissible');
    const open = this.hasAttribute('open');

    const variantConfig: Record<string, { bg: string; border: string; color: string; icon: string; role: string }> = {
      info:    { bg: 'var(--bq-color-info-50,#eff6ff)',    border: 'var(--bq-color-info-500,#3b82f6)',    color: 'var(--bq-color-info-700,#1d4ed8)',    icon: 'ℹ', role: 'status' },
      success: { bg: 'var(--bq-color-success-50,#f0fdf4)', border: 'var(--bq-color-success-500,#22c55e)', color: 'var(--bq-color-success-700,#15803d)', icon: '✓', role: 'status' },
      warning: { bg: 'var(--bq-color-warning-50,#fffbeb)', border: 'var(--bq-color-warning-500,#f59e0b)', color: 'var(--bq-color-warning-700,#b45309)', icon: '⚠', role: 'alert' },
      danger:  { bg: 'var(--bq-color-danger-50,#fef2f2)',  border: 'var(--bq-color-danger-500,#ef4444)',  color: 'var(--bq-color-danger-700,#b91c1c)',  icon: '✕', role: 'alert' },
    };
    const cfg = variantConfig[variant] ?? variantConfig['info']!;

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }
      :host(:not([open])) { display: none; }

      .alert {
        display: flex; align-items: flex-start; gap: 0.75rem;
        padding: var(--bq-space-4,1rem);
        border-radius: var(--bq-radius-lg,0.5rem);
        border: 1.5px solid ${cfg.border};
        background: ${cfg.bg};
        color: ${cfg.color};
        font-family: var(--bq-font-family-sans);
      }
      .icon { font-size: 1.1em; flex-shrink: 0; margin-top: 0.1em; }
      .content { flex: 1; min-width: 0; }
      .title { font-weight: var(--bq-font-weight-semibold,600); font-size: var(--bq-font-size-sm,0.875rem); margin-bottom: 0.25rem; }
      .body { font-size: var(--bq-font-size-sm,0.875rem); }
      .close {
        flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
        background: none; border: none; cursor: pointer; color: inherit;
        padding: 0.25rem; border-radius: var(--bq-radius-md,0.375rem); opacity: 0.7;
        font-size: 0.875rem;
      }
      .close:hover { opacity: 1; background: rgba(0,0,0,0.08); }
      .close:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div
        part="alert"
        class="alert"
        role="${cfg.role}"
        aria-live="${variant === 'danger' || variant === 'warning' ? 'assertive' : 'polite'}"
        aria-labelledby="${title ? this._id + '-title' : ''}"
      >
        <span class="icon" aria-hidden="true">${cfg.icon}</span>
        <div class="content">
          ${title ? `<div class="title" id="${this._id}-title">${title}</div>` : ''}
          <div class="body"><slot></slot></div>
        </div>
        ${dismissible ? `
          <button type="button" class="close" aria-label="${t('common.close')}">✕</button>
        ` : ''}
      </div>
    `;

    if (dismissible) {
      this._shadow.querySelector('.close')?.addEventListener('click', () => {
        this.removeAttribute('open');
        dispatch(this, 'bq-close');
      });
    }
  }
}

export function registerBqAlert(prefix = 'bq'): string {
  const tag = `${prefix}-alert`;
  if (!customElements.get(tag)) customElements.define(tag, BqAlert);
  return tag;
}
