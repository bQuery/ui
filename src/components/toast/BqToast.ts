/**
 * Toast / notification snackbar.
 * @element bq-toast
 * @prop {string}  variant    - success | error | warning | info
 * @prop {string}  message
 * @prop {number}  duration   - Auto-dismiss ms. 0 = persistent.
 * @prop {boolean} dismissible
 * @fires bq-close
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release } from '../../utils/component.js';
import { iconCss, type IconName } from '../../utils/icons.js';
import { baseStyles, focusRing, reset } from '../../utils/styles.js';

type BqToastProps = {
  variant: string;
  message: string;
  duration: number;
  dismissible: boolean;
};

/** Status glyph per variant. Unknown variants fall back to `info`. */
const VARIANT_ICON: Record<string, IconName> = {
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
  info: 'info',
};

const definition: ComponentDefinition<BqToastProps> = {
  props: {
    variant: { type: String, default: 'info' },
    message: { type: String, default: '' },
    duration: { type: Number, default: 4000 },
    dismissible: { type: Boolean, default: true },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    ${focusRing}
    ${iconCss('x', 'check-circle', 'x-circle', 'alert-triangle', 'info')}
    :host { display: block; }
    .toast {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: 0.875rem var(--bq-space-4,1rem); border-radius: var(--bq-radius-lg,0.5rem);
      border: 1.5px solid transparent; font-family: var(--bq-font-family-sans);
      box-shadow: var(--bq-shadow-lg); min-width: 18rem; max-width: 28rem;
      animation: slideIn var(--bq-duration-normal,200ms) var(--bq-easing-decelerate);
    }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-0.5rem); } to { opacity: 1; transform: translateY(0); } }
    /* A toast floats over arbitrary content, so it sits on the overlay
       surface and carries the status colour as a leading edge — a fully
       tinted panel would fight whatever it happens to land on. */
    .toast { background: var(--bq-surface-overlay,#fff); color: var(--bq-text-base,#0f172a); border-inline-start-width: 3px; }
    .toast[data-variant="success"] { border-inline-start-color: var(--bq-color-success-500,#22c55e); }
    .toast[data-variant="error"]   { border-inline-start-color: var(--bq-color-danger-500,#ef4444); }
    .toast[data-variant="warning"] { border-inline-start-color: var(--bq-color-warning-500,#f59e0b); }
    .toast[data-variant="info"]    { border-inline-start-color: var(--bq-color-info-500,#3b82f6); }
    .toast { border-color: var(--bq-border-base,#e2e8f0); }
    .status-icon { --bq-icon-size: 1.25rem; margin-block-start: 0.0625rem; }
    .toast[data-variant="success"] .status-icon { color: var(--bq-color-success-600,#16a34a); }
    .toast[data-variant="error"]   .status-icon { color: var(--bq-color-danger-600,#dc2626); }
    .toast[data-variant="warning"] .status-icon { color: var(--bq-color-warning-600,#d97706); }
    .toast[data-variant="info"]    .status-icon { color: var(--bq-color-info-600,#2563eb); }
    .content { flex: 1; min-inline-size: 0; font-size: var(--bq-font-size-sm,0.875rem); line-height: var(--bq-line-height-normal,1.5); }
    .close {
      flex: none; display: inline-flex; align-items: center; justify-content: center;
      inline-size: 1.5rem; block-size: 1.5rem;
      background: none; border: none; cursor: pointer;
      color: var(--bq-text-muted,#475569);
      border-radius: var(--bq-radius-md,0.375rem); opacity: 0.7;
      --bq-icon-size: 1rem;
      transition: opacity var(--bq-duration-fast) var(--bq-easing-standard),
                  background-color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .close:hover { opacity: 1; background: var(--bq-bg-hover,rgba(15,23,42,0.08)); }
    @media (prefers-reduced-motion: reduce) {
      .toast { animation: none; }
    }
  `,
  connected() {
    const self = host(this);
    const close = () => {
      self.dispatchEvent(
        new CustomEvent('bq-close', { bubbles: true, composed: true })
      );
      self.remove();
    };
    const ch = (e: Event) => {
      if ((e.target as Element).closest('.close')) close();
    };
    const scope = bind(self);
    const dur = parseInt(self.getAttribute('duration') ?? '4000', 10);
    // The auto-dismiss timer is scope-owned, so a toast removed by hand
    // cannot fire `close()` on an already-detached element afterwards.
    if (dur > 0) scope.timeout(close, dur);
    scope.on(self.shadowRoot, 'click', ch);
  },
  disconnected() {
    release(this);
  },
  render({ props }) {
    const icon = VARIANT_ICON[props.variant] ?? 'info';
    const isAlert = props.variant === 'error' || props.variant === 'warning';
    return html`
      <div
        part="toast"
        class="toast"
        data-variant="${escapeHtml(props.variant)}"
        role="${isAlert ? 'alert' : 'status'}"
        aria-live="${isAlert ? 'assertive' : 'polite'}"
        aria-atomic="true"
      >
        <span class="icon status-icon" part="icon" data-icon="${icon}" aria-hidden="true"></span>
        <span class="content" part="content"
          ><slot>${escapeHtml(props.message)}</slot></span
        >
        ${props.dismissible
          ? `<button type="button" class="close" aria-label="${t('toast.close')}"><span class="icon" data-icon="x" aria-hidden="true"></span></button>`
          : ''}
      </div>
    `;
  },
};

/** Imperative toast API */
export type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center';

export interface ToastOptions {
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  /** Where the toast container is anchored (default: 'top-right'). */
  position?: ToastPosition;
}

const TOAST_CONTAINER_ID = 'bq-toast-container';
const POSITIONS: Record<ToastPosition, string> = {
  'top-left': 'top: 1rem; left: 1rem;',
  'top-right': 'top: 1rem; right: 1rem;',
  'top-center': 'top: 1rem; left: 50%; transform: translateX(-50%);',
  'bottom-left': 'bottom: 1rem; left: 1rem;',
  'bottom-right': 'bottom: 1rem; right: 1rem;',
  'bottom-center': 'bottom: 1rem; left: 50%; transform: translateX(-50%);',
};

function getOrCreateContainer(
  position: ToastPosition = 'top-right'
): HTMLElement {
  const id = `${TOAST_CONTAINER_ID}-${position}`;
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement('div');
    container.id = id;
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notifications');
    container.dataset['bqToastPosition'] = position;
    container.style.cssText = `
      position: fixed; ${POSITIONS[position]} z-index: var(--bq-z-toast, 600);
      display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none;
      max-height: 100vh; overflow: hidden;
    `.replace(/\s+/g, ' ');
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(
  options: ToastOptions,
  container?: HTMLElement
): HTMLElement {
  const host = container ?? getOrCreateContainer(options.position);
  const toast = document.createElement('bq-toast');
  toast.style.pointerEvents = 'auto';
  toast.setAttribute('message', options.message);
  if (options.variant) toast.setAttribute('variant', options.variant);
  if (options.duration !== undefined)
    toast.setAttribute('duration', String(options.duration));
  host.appendChild(toast);
  return toast;
}

component<BqToastProps>('bq-toast', definition);
