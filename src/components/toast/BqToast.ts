import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';
import { announce } from '../../utils/aria.js';
import { t } from '../../i18n/index.js';

/**
 * Toast / notification component.
 * @element bq-toast
 * @prop {string}  variant   - success | error | warning | info
 * @prop {string}  message
 * @prop {number}  duration  - Auto-dismiss ms (0 = no auto dismiss)
 * @prop {string}  position  - top-right | top-left | top-center | bottom-right | bottom-left | bottom-center
 * @prop {boolean} dismissible
 * @fires bq-close
 */
export class BqToast extends HTMLElement {
  static get observedAttributes() { return ['variant','message','duration','dismissible']; }
  private _shadow: ShadowRoot;
  private _id: string;
  private _timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-toast');
  }

  connectedCallback() {
    this._render();
    this._scheduleDismiss();
  }

  disconnectedCallback() {
    if (this._timer) clearTimeout(this._timer);
  }

  attributeChangedCallback() {
    this._render();
    this._scheduleDismiss();
  }

  private _scheduleDismiss() {
    if (this._timer) clearTimeout(this._timer);
    const duration = parseInt(this.getAttribute('duration') ?? '4000', 10);
    if (duration > 0) {
      this._timer = setTimeout(() => this._close(), duration);
    }
  }

  private _close() {
    if (this._timer) clearTimeout(this._timer);
    const toast = this._shadow.querySelector('.toast') as HTMLElement | null;
    if (toast) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-0.5rem)';
      setTimeout(() => { dispatch(this, 'bq-close'); this.remove(); }, 200);
    } else {
      dispatch(this, 'bq-close');
      this.remove();
    }
  }

  private _render() {
    const variant = this.getAttribute('variant') ?? 'info';
    const message = this.getAttribute('message') ?? '';
    const dismissible = !this.hasAttribute('no-dismiss');

    const variantConfig: Record<string, { bg: string; border: string; color: string; icon: string; isAlert: boolean }> = {
      success: { bg: 'var(--bq-color-success-50,#f0fdf4)', border: 'var(--bq-color-success-500,#22c55e)', color: 'var(--bq-color-success-700,#15803d)', icon: '✓', isAlert: false },
      error:   { bg: 'var(--bq-color-danger-50,#fef2f2)',  border: 'var(--bq-color-danger-500,#ef4444)',  color: 'var(--bq-color-danger-700,#b91c1c)',  icon: '✕', isAlert: true  },
      warning: { bg: 'var(--bq-color-warning-50,#fffbeb)', border: 'var(--bq-color-warning-500,#f59e0b)', color: 'var(--bq-color-warning-700,#b45309)', icon: '⚠', isAlert: true  },
      info:    { bg: 'var(--bq-color-info-50,#eff6ff)',    border: 'var(--bq-color-info-500,#3b82f6)',    color: 'var(--bq-color-info-700,#1d4ed8)',    icon: 'ℹ', isAlert: false },
    };
    const cfg = variantConfig[variant] ?? variantConfig['info']!;

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .toast {
        display: flex; align-items: flex-start; gap: 0.75rem;
        padding: 0.875rem var(--bq-space-4,1rem);
        border-radius: var(--bq-radius-lg,0.5rem);
        border: 1.5px solid ${cfg.border};
        background: ${cfg.bg};
        color: ${cfg.color};
        font-family: var(--bq-font-family-sans);
        box-shadow: var(--bq-shadow-lg);
        min-width: 18rem; max-width: 28rem;
        transition: opacity var(--bq-duration-normal) var(--bq-easing-standard),
                    transform var(--bq-duration-normal) var(--bq-easing-standard);
        animation: slideIn var(--bq-duration-normal,200ms) var(--bq-easing-decelerate);
      }
      @keyframes slideIn { from { opacity: 0; transform: translateY(-0.5rem); } to { opacity: 1; transform: translateY(0); } }
      .icon { font-size: 1.1em; flex-shrink: 0; margin-top: 0.05em; }
      .content { flex: 1; min-width: 0; font-size: var(--bq-font-size-sm,0.875rem); line-height: var(--bq-line-height-normal,1.5); }
      .close {
        flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
        background: none; border: none; cursor: pointer; color: inherit;
        padding: 0.125rem; border-radius: var(--bq-radius-sm,0.25rem); opacity: 0.7; font-size: 0.875rem;
      }
      .close:hover { opacity: 1; background: rgba(0,0,0,0.08); }
      .close:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div
        part="toast"
        class="toast"
        role="${cfg.isAlert ? 'alert' : 'status'}"
        aria-live="${cfg.isAlert ? 'assertive' : 'polite'}"
        aria-atomic="true"
        id="${this._id}"
      >
        <span class="icon" aria-hidden="true">${cfg.icon}</span>
        <span class="content" part="content"><slot>${message}</slot></span>
        ${dismissible ? `<button type="button" class="close" aria-label="${t('toast.close')}">✕</button>` : ''}
      </div>
    `;

    if (message) announce(message, cfg.isAlert ? 'assertive' : 'polite');
    this._shadow.querySelector('.close')?.addEventListener('click', () => this._close());
  }
}

/**
 * Simple imperative toast API.
 */
export interface ToastOptions {
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: string;
}

export function showToast(options: ToastOptions, container?: HTMLElement): BqToast {
  const host = container ?? document.body;
  const toast = document.createElement('bq-toast') as BqToast;
  toast.setAttribute('message', options.message);
  if (options.variant) toast.setAttribute('variant', options.variant);
  if (options.duration !== undefined) toast.setAttribute('duration', String(options.duration));
  Object.assign(toast.style, {
    position: 'fixed',
    zIndex: 'var(--bq-z-toast, 600)',
    top: '1rem',
    right: '1rem',
  });
  host.appendChild(toast);
  return toast;
}

export function registerBqToast(prefix = 'bq'): string {
  const tag = `${prefix}-toast`;
  if (!customElements.get(tag)) customElements.define(tag, BqToast);
  return tag;
}
