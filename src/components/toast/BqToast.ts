/**
 * Toast / notification snackbar.
 * @element bq-toast
 * @prop {string}  variant    - success | error | warning | info
 * @prop {string}  message
 * @prop {number}  duration   - Auto-dismiss ms. 0 = persistent.
 * @prop {boolean} dismissible
 * @fires bq-close
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';
import { t } from '../../i18n/index.js';

type BqToastProps = { variant: string; message: string; duration: number; dismissible: boolean };

const definition: ComponentDefinition<BqToastProps> = {
  props: {
    variant:    { type: String, default: 'info' },
    message:    { type: String, default: '' },
    duration:   { type: Number, default: 4000 },
    dismissible:{ type: Boolean, default: true },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .toast {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: 0.875rem var(--bq-space-4,1rem); border-radius: var(--bq-radius-lg,0.5rem);
      border: 1.5px solid transparent; font-family: var(--bq-font-family-sans);
      box-shadow: var(--bq-shadow-lg); min-width: 18rem; max-width: 28rem;
      animation: slideIn var(--bq-duration-normal,200ms) var(--bq-easing-decelerate);
    }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-0.5rem); } to { opacity: 1; transform: translateY(0); } }
    .toast[data-variant="success"] { background: var(--bq-color-success-50,#f0fdf4); border-color: var(--bq-color-success-500,#22c55e); color: var(--bq-color-success-700,#15803d); }
    .toast[data-variant="error"]   { background: var(--bq-color-danger-50,#fef2f2);  border-color: var(--bq-color-danger-500,#ef4444);  color: var(--bq-color-danger-700,#b91c1c); }
    .toast[data-variant="warning"] { background: var(--bq-color-warning-50,#fffbeb); border-color: var(--bq-color-warning-500,#f59e0b); color: var(--bq-color-warning-700,#b45309); }
    .toast[data-variant="info"]    { background: var(--bq-color-info-50,#eff6ff);    border-color: var(--bq-color-info-500,#3b82f6);    color: var(--bq-color-info-700,#1d4ed8); }
    .icon { font-size: 1.1em; flex-shrink: 0; margin-top: 0.05em; }
    .content { flex: 1; min-width: 0; font-size: var(--bq-font-size-sm,0.875rem); line-height: var(--bq-line-height-normal,1.5); }
    .close { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: inherit; padding: 0.125rem; border-radius: var(--bq-radius-sm,0.25rem); opacity: 0.7; font-size: 0.875rem; }
    .close:hover { opacity: 1; background: rgba(0,0,0,0.08); }
    .close:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
  `,
  connected() {
    const self = this;
    const close = () => { self.dispatchEvent(new CustomEvent('bq-close', { bubbles: true, composed: true })); self.remove(); };
    const ch = (e: Event) => { if ((e.target as Element).closest('.close')) close(); };
    const dur = parseInt(self.getAttribute('duration') ?? '4000', 10);
    if (dur > 0) {
      const timer = setTimeout(close, dur);
      (self as unknown as Record<string, unknown>)['_timer'] = timer;
    }
    (self as unknown as Record<string, unknown>)['_ch'] = ch;
    self.shadowRoot?.addEventListener('click', ch);
  },
  disconnected() {
    const s = this as unknown as Record<string, unknown>;
    const timer = s['_timer'] as ReturnType<typeof setTimeout> | undefined; if (timer) clearTimeout(timer);
    const ch = s['_ch'] as EventListener | undefined; if (ch) this.shadowRoot?.removeEventListener('click', ch);
  },
  render({ props }) {
    const icons: Record<string, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const icon = icons[props.variant] ?? 'ℹ';
    const isAlert = props.variant === 'error' || props.variant === 'warning';
    return html`
      <div part="toast" class="toast" data-variant="${escapeHtml(props.variant)}"
        role="${isAlert ? 'alert' : 'status'}" aria-live="${isAlert ? 'assertive' : 'polite'}" aria-atomic="true">
        <span class="icon" aria-hidden="true">${icon}</span>
        <span class="content" part="content"><slot>${escapeHtml(props.message)}</slot></span>
        ${props.dismissible ? `<button type="button" class="close" aria-label="${t('toast.close')}">&#10005;</button>` : ''}
      </div>
    `;
  },
};

/** Imperative toast API */
export interface ToastOptions { message: string; variant?: 'success' | 'error' | 'warning' | 'info'; duration?: number; }
export function showToast(options: ToastOptions, container?: HTMLElement): HTMLElement {
  const host = container ?? document.body;
  const toast = document.createElement('bq-toast');
  toast.setAttribute('message', options.message);
  if (options.variant) toast.setAttribute('variant', options.variant);
  if (options.duration !== undefined) toast.setAttribute('duration', String(options.duration));
  host.appendChild(toast);
  return toast;
}

component<BqToastProps>('bq-toast', definition);
