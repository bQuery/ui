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
    .alert[data-variant="info"] {
      background: var(--bq-intent-info-bg,#dbeafe);
      border-color: var(--bq-intent-info-border,#bfdbfe);
      border-inline-start-color: var(--bq-color-info-500,#3b82f6);
      color: var(--bq-intent-info-fg,#1d4ed8);
    }
    .alert[data-variant="success"] {
      background: var(--bq-intent-success-bg,#dcfce7);
      border-color: var(--bq-intent-success-border,#bbf7d0);
      border-inline-start-color: var(--bq-color-success-500,#22c55e);
      color: var(--bq-intent-success-fg,#15803d);
    }
    .alert[data-variant="warning"] {
      background: var(--bq-intent-warning-bg,#fef3c7);
      border-color: var(--bq-intent-warning-border,#fde68a);
      border-inline-start-color: var(--bq-color-warning-500,#f59e0b);
      color: var(--bq-intent-warning-fg,#b45309);
    }
    .alert[data-variant="danger"] {
      background: var(--bq-intent-danger-bg,#fee2e2);
      border-color: var(--bq-intent-danger-border,#fecaca);
      border-inline-start-color: var(--bq-color-danger-500,#ef4444);
      color: var(--bq-intent-danger-fg,#b91c1c);
    }

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
