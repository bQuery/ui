/**
 * Alert component - contextual status message.
 * @element bq-alert
 * @prop {string}  variant    - info | success | warning | danger
 * @prop {string}  title      - Alert heading
 * @prop {boolean} dismissible - Show close button
 * @slot - Alert body content
 * @fires bq-close
 */
import { component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { bind, host, release } from '../../utils/component.js';
import { iconCss, isIconName, type IconName } from '../../utils/icons.js';
import { baseStyles, focusRing, reset } from '../../utils/styles.js';
import { t } from '../../i18n/index.js';

type BqAlertProps = { variant: string; title: string; dismissible: boolean };

/** Status glyph per variant. Falls back to `info` for an unknown variant. */
const VARIANT_ICON: Record<string, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
};

const definition: ComponentDefinition<BqAlertProps> = {
  props: {
    variant: { type: String, default: 'info' },
    title: { type: String, default: '' },
    dismissible: { type: Boolean, default: false },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    ${focusRing}
    ${iconCss('info', 'check-circle', 'alert-triangle', 'alert-circle', 'x')}
    :host { display: block; }
    .alert {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: var(--bq-space-4,1rem);
      border-radius: var(--bq-radius-lg,0.5rem);
      border: 1px solid transparent;
      font-family: var(--bq-font-family-sans);
      /* A tinted panel plus a single saturated edge on the leading side reads
         as a status band without the heavy full outline it used to have. */
      border-inline-start-width: 3px;
    }
    .alert[data-variant="info"]    { background: var(--bq-color-info-50,#eff6ff);    border-color: var(--bq-color-info-200,#bfdbfe);    border-inline-start-color: var(--bq-color-info-500,#3b82f6);    color: var(--bq-color-info-800,#1e40af); }
    .alert[data-variant="success"] { background: var(--bq-color-success-50,#f0fdf4); border-color: var(--bq-color-success-200,#bbf7d0); border-inline-start-color: var(--bq-color-success-500,#22c55e); color: var(--bq-color-success-800,#166534); }
    .alert[data-variant="warning"] { background: var(--bq-color-warning-50,#fffbeb); border-color: var(--bq-color-warning-200,#fde68a); border-inline-start-color: var(--bq-color-warning-500,#f59e0b); color: var(--bq-color-warning-800,#92400e); }
    .alert[data-variant="danger"]  { background: var(--bq-color-danger-50,#fef2f2);  border-color: var(--bq-color-danger-200,#fecaca);  border-inline-start-color: var(--bq-color-danger-500,#ef4444);  color: var(--bq-color-danger-800,#991b1b); }

    /* Dark mode cannot use the 50-step tints — they are near-white. A
       translucent wash of the accent over the page keeps the same hue
       relationship at the right lightness. */
    :host([data-theme="dark"]) .alert[data-variant="info"],
    :host([data-theme="dark"]) .alert[data-variant="success"],
    :host([data-theme="dark"]) .alert[data-variant="warning"],
    :host([data-theme="dark"]) .alert[data-variant="danger"] { background: var(--bq-bg-subtle,#1e293b); }
    :host([data-theme="dark"]) .alert[data-variant="info"]    { border-color: var(--bq-color-info-800,#1e40af);    color: var(--bq-color-info-200,#bfdbfe); }
    :host([data-theme="dark"]) .alert[data-variant="success"] { border-color: var(--bq-color-success-800,#166534); color: var(--bq-color-success-200,#bbf7d0); }
    :host([data-theme="dark"]) .alert[data-variant="warning"] { border-color: var(--bq-color-warning-800,#92400e); color: var(--bq-color-warning-200,#fde68a); }
    :host([data-theme="dark"]) .alert[data-variant="danger"]  { border-color: var(--bq-color-danger-800,#991b1b);  color: var(--bq-color-danger-200,#fecaca); }

    .status-icon { --bq-icon-size: 1.25rem; margin-block-start: 0.0625rem; }
    .content { flex: 1; min-inline-size: 0; }
    .alert-title {
      font-weight: var(--bq-font-weight-semibold,600);
      font-size: var(--bq-font-size-sm,0.875rem);
      margin-block-end: 0.25rem;
    }
    .body { font-size: var(--bq-font-size-sm,0.875rem); line-height: var(--bq-line-height-normal,1.5); }
    .close {
      flex: none; display: inline-flex; align-items: center; justify-content: center;
      inline-size: 1.5rem; block-size: 1.5rem;
      background: none; border: none; cursor: pointer; color: inherit;
      border-radius: var(--bq-radius-md,0.375rem); opacity: 0.65;
      --bq-icon-size: 1rem;
      transition: opacity var(--bq-duration-fast) var(--bq-easing-standard),
                  background-color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .close:hover { opacity: 1; background: var(--bq-bg-hover,rgba(15,23,42,0.06)); }
  `,
  connected() {
    const self = host(this);
    bind(self).on(self.shadowRoot, 'click', (e) => {
      if ((e.target as Element).closest('.close')) {
        self.setAttribute('hidden', '');
        self.dispatchEvent(
          new CustomEvent('bq-close', { bubbles: true, composed: true })
        );
      }
    });
  },
  disconnected() {
    release(this);
  },
  render({ props }) {
    const name = VARIANT_ICON[props.variant];
    const icon = name && isIconName(name) ? name : 'info';
    const isAlert = props.variant === 'warning' || props.variant === 'danger';
    return html`
      <div part="alert" class="alert" data-variant="${escapeHtml(props.variant)}"
        role="${isAlert ? 'alert' : 'status'}" aria-live="${isAlert ? 'assertive' : 'polite'}">
        <span class="icon status-icon" part="icon" data-icon="${icon}" aria-hidden="true"></span>
        <div class="content">
          ${props.title ? `<div class="alert-title" part="title">${escapeHtml(props.title)}</div>` : ''}
          <div class="body" part="body"><slot></slot></div>
        </div>
        ${props.dismissible ? `<button type="button" class="close" part="close" aria-label="${escapeHtml(t('common.close'))}"><span class="icon" data-icon="x" aria-hidden="true"></span></button>` : ''}
      </div>
    `;
  },
};

component<BqAlertProps>('bq-alert', definition);
