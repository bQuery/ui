/**
 * Banner component — full-width page-level announcement.
 * @element bq-banner
 * @prop {string}  variant     - info | success | warning | danger | neutral
 * @prop {boolean} dismissible - Show a dismiss button
 * @prop {boolean} sticky      - Stick to the top of the viewport
 * @prop {string}  label       - Accessible label for the banner region
 * @slot           - Banner message
 * @slot icon      - Leading icon
 * @slot actions   - Trailing actions
 * @fires bq-dismiss
 */
import { component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release } from '../../utils/component.js';
import { baseStyles, reset, srOnly } from '../../utils/styles.js';

type BqBannerProps = {
  variant: string;
  dismissible: boolean;
  sticky: boolean;
  label: string;
};

/** Banners that report a problem need to interrupt; the rest can wait. */
function liveSettings(variant: string): { role: string; live: string } {
  return variant === 'danger'
    ? { role: 'alert', live: 'assertive' }
    : { role: 'status', live: 'polite' };
}

const definition: ComponentDefinition<BqBannerProps> = {
  props: {
    variant: { type: String, default: 'info' },
    dismissible: { type: Boolean, default: false },
    sticky: { type: Boolean, default: false },
    label: { type: String, default: '' },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    ${srOnly}
    :host { display: block; }
    :host([sticky]) { position: sticky; top: 0; z-index: var(--bq-z-sticky, 100); }
    .banner {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem;
      font-family: var(--bq-font-family-sans);
      font-size: var(--bq-font-size-sm,0.875rem);
      line-height: 1.5;
      border-bottom: 1px solid transparent;
    }
    .content { flex: 1 1 auto; min-width: 0; }
    .actions { display: flex; align-items: center; gap: 0.5rem; flex: 0 0 auto; }
    .icon { display: inline-flex; flex: 0 0 auto; }
    .dismiss {
      display: inline-flex; align-items: center; justify-content: center;
      width: 1.75rem; height: 1.75rem; flex: 0 0 auto;
      border: none; border-radius: var(--bq-radius-md,0.375rem);
      background: transparent; color: inherit; cursor: pointer;
      font-size: 1rem; line-height: 1;
      transition: background-color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .dismiss:hover { background: rgba(0,0,0,0.08); }
    .dismiss:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .banner[data-variant="info"]    { background: var(--bq-color-info-100,#dbeafe);    color: var(--bq-color-info-700,#1d4ed8);    border-bottom-color: var(--bq-color-info-200,#bfdbfe); }
    .banner[data-variant="success"] { background: var(--bq-color-success-100,#dcfce7); color: var(--bq-color-success-700,#15803d); border-bottom-color: var(--bq-color-success-200,#bbf7d0); }
    .banner[data-variant="warning"] { background: var(--bq-color-warning-100,#fef3c7); color: var(--bq-color-warning-700,#b45309); border-bottom-color: var(--bq-color-warning-200,#fde68a); }
    .banner[data-variant="danger"]  { background: var(--bq-color-danger-100,#fee2e2);  color: var(--bq-color-danger-700,#b91c1c);  border-bottom-color: var(--bq-color-danger-200,#fecaca); }
    .banner[data-variant="neutral"] { background: var(--bq-bg-muted,#f1f5f9);          color: var(--bq-text-base,#0f172a);         border-bottom-color: var(--bq-border-base,#e2e8f0); }
    @media (prefers-reduced-motion: reduce) {
      .dismiss { transition: none; }
    }
  `,
  connected() {
    const self = host(this);
    const scope = bind(self);
    scope.on(self.shadowRoot, 'click', (e) => {
      if (!(e.target as Element).closest('.dismiss')) return;
      // Cancelling `bq-dismiss` lets the host keep the banner mounted, e.g. to
      // run an exit animation or persist the dismissal first.
      const proceed = self.dispatchEvent(
        new CustomEvent('bq-dismiss', {
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      );
      if (proceed) self.setAttribute('hidden', '');
    });
  },
  disconnected() {
    release(this);
  },
  render({ props }) {
    const { role, live } = liveSettings(props.variant);
    const label = props.label.trim();
    const dismissLabel = t('banner.dismiss');
    return html`
      <div
        part="banner"
        class="banner"
        data-variant="${escapeHtml(props.variant)}"
        role="${role}"
        aria-live="${live}"
        ${label ? `aria-label="${escapeHtml(label)}"` : ''}
      >
        <span class="icon" part="icon"><slot name="icon"></slot></span>
        <div class="content" part="content"><slot></slot></div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
        ${
          props.dismissible
            ? `<button type="button" part="dismiss" class="dismiss" aria-label="${escapeHtml(dismissLabel)}">&times;</button>`
            : ''
        }
      </div>
    `;
  },
};

component<BqBannerProps>('bq-banner', definition);
