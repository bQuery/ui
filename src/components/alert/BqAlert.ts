/**
 * Alert component - contextual status message.
 * @element bq-alert
 * @prop {string}  variant    - info | success | warning | danger
 * @prop {string}  title      - Alert heading
 * @prop {boolean} dismissible - Show close button
 * @slot - Alert body content
 * @fires bq-close
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';
import { t } from '../../i18n/index.js';

type BqAlertProps = { variant: string; title: string; dismissible: boolean };

const definition: ComponentDefinition<BqAlertProps> = {
  props: {
    variant:    { type: String, default: 'info' },
    title:      { type: String, default: '' },
    dismissible:{ type: Boolean, default: false },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    :host([hidden]) { display: none; }
    .alert {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: var(--bq-space-4,1rem); border-radius: var(--bq-radius-lg,0.5rem);
      border: 1.5px solid transparent; font-family: var(--bq-font-family-sans);
    }
    .alert[data-variant="info"]    { background: var(--bq-color-info-50,#eff6ff);    border-color: var(--bq-color-info-500,#3b82f6);    color: var(--bq-color-info-700,#1d4ed8); }
    .alert[data-variant="success"] { background: var(--bq-color-success-50,#f0fdf4); border-color: var(--bq-color-success-500,#22c55e); color: var(--bq-color-success-700,#15803d); }
    .alert[data-variant="warning"] { background: var(--bq-color-warning-50,#fffbeb); border-color: var(--bq-color-warning-500,#f59e0b); color: var(--bq-color-warning-700,#b45309); }
    .alert[data-variant="danger"]  { background: var(--bq-color-danger-50,#fef2f2);  border-color: var(--bq-color-danger-500,#ef4444);  color: var(--bq-color-danger-700,#b91c1c); }
    .icon { font-size: 1.1em; flex-shrink: 0; margin-top: 0.1em; }
    .content { flex: 1; min-width: 0; }
    .alert-title { font-weight: var(--bq-font-weight-semibold,600); font-size: var(--bq-font-size-sm,0.875rem); margin-bottom: 0.25rem; }
    .body { font-size: var(--bq-font-size-sm,0.875rem); }
    .close { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: inherit; padding: 0.25rem; border-radius: var(--bq-radius-md,0.375rem); opacity: 0.7; font-size: 0.875rem; }
    .close:hover { opacity: 1; background: rgba(0,0,0,0.08); }
    .close:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
  `,
  connected() {
    const self = this;
    const handler = (e: Event) => {
      if ((e.target as Element).closest('.close')) {
        self.setAttribute('hidden', '');
        self.dispatchEvent(new CustomEvent('bq-close', { bubbles: true, composed: true }));
      }
    };
    (self as unknown as Record<string, unknown>)['_handler'] = handler;
    self.shadowRoot?.addEventListener('click', handler);
  },
  disconnected() {
    const handler = (this as unknown as Record<string, unknown>)['_handler'] as EventListener | undefined;
    if (handler) this.shadowRoot?.removeEventListener('click', handler);
  },
  render({ props }) {
    const icons: Record<string, string> = { info: 'ℹ', success: '✓', warning: '⚠', danger: '✕' };
    const icon = icons[props.variant] ?? 'ℹ';
    const isAlert = props.variant === 'warning' || props.variant === 'danger';
    return html`
      <div part="alert" class="alert" data-variant="${escapeHtml(props.variant)}"
        role="${isAlert ? 'alert' : 'status'}" aria-live="${isAlert ? 'assertive' : 'polite'}">
        <span class="icon" aria-hidden="true">${icon}</span>
        <div class="content">
          ${props.title ? `<div class="alert-title">${escapeHtml(props.title)}</div>` : ''}
          <div class="body"><slot></slot></div>
        </div>
        ${props.dismissible ? `<button type="button" class="close" aria-label="${t('common.close')}">✕</button>` : ''}
      </div>
    `;
  },
};

export function registerBqAlert(prefix = 'bq'): string {
  const tag = `${prefix}-alert`;
  component<BqAlertProps>(tag, definition);
  return tag;
}
