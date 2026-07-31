/**
 * Popover component — rich anchored overlay opened from a trigger.
 *
 * Unlike Tooltip (hover, text only) a popover holds interactive content and
 * opens on click, so it manages focus and closes on Escape or outside click.
 *
 * @element bq-popover
 * @prop {boolean} open
 * @prop {string}  placement   - top | bottom | left | right (with -start/-end suffixes)
 * @prop {string}  heading     - Optional popover title
 * @prop {boolean} dismissible - Show a close button
 * @prop {boolean} arrow       - Render a pointer arrow
 * @slot trigger - Element that toggles the popover
 * @slot         - Popover content
 * @slot footer  - Footer actions
 * @fires bq-open
 * @fires bq-close
 */
import { component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import type { Disposer } from '../../utils/component.js';
import { bind, host, release, store } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqPopoverProps = {
  open: boolean;
  placement: string;
  heading: string;
  dismissible: boolean;
  arrow: boolean;
};
type BqPopoverState = { uid: string };

const popoverStore = (owner: object) =>
  store<{ sync?: () => void }>(owner, () => ({}));

const definition: ComponentDefinition<BqPopoverProps, BqPopoverState> = {
  props: {
    open: { type: Boolean, default: false },
    placement: { type: String, default: 'bottom' },
    heading: { type: String, default: '' },
    dismissible: { type: Boolean, default: true },
    arrow: { type: Boolean, default: true },
  },
  state: {
    uid: '',
  },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: inline-block; position: relative; }
    .panel {
      position: absolute; z-index: var(--bq-z-popover, 1100);
      min-width: 12rem; max-width: min(20rem, 90vw);
      background: var(--bq-bg-base,#fff);
      color: var(--bq-text-base,#0f172a);
      border: 1px solid var(--bq-border-base,#e2e8f0);
      border-radius: var(--bq-radius-lg,0.5rem);
      box-shadow: var(--bq-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
      font-family: var(--bq-font-family-sans);
      font-size: var(--bq-font-size-sm,0.875rem);
      opacity: 0; visibility: hidden;
      transition: opacity var(--bq-duration-fast) var(--bq-easing-standard),
                  visibility var(--bq-duration-fast) var(--bq-easing-standard);
    }
    :host([open]) .panel { opacity: 1; visibility: visible; }

    .panel[data-placement^="bottom"] { top: calc(100% + 8px); }
    .panel[data-placement^="top"]    { bottom: calc(100% + 8px); }
    .panel[data-placement^="left"]   { right: calc(100% + 8px); top: 0; }
    .panel[data-placement^="right"]  { left: calc(100% + 8px); top: 0; }
    .panel[data-placement="bottom"], .panel[data-placement="top"] { left: 50%; transform: translateX(-50%); }
    .panel[data-placement$="-start"] { left: 0; transform: none; }
    .panel[data-placement$="-end"]   { right: 0; left: auto; transform: none; }

    .header {
      display: flex; align-items: flex-start; gap: 0.5rem;
      padding: 0.75rem 0.875rem 0;
    }
    .heading {
      flex: 1 1 auto; margin: 0;
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-semibold,600);
    }
    .close {
      flex: 0 0 auto;
      display: inline-flex; align-items: center; justify-content: center;
      width: 1.5rem; height: 1.5rem;
      border: none; border-radius: var(--bq-radius-md,0.375rem);
      background: transparent; color: var(--bq-text-muted,#475569);
      cursor: pointer; font-size: 1rem; line-height: 1;
    }
    .close:hover { background: var(--bq-bg-muted,#f1f5f9); color: var(--bq-text-base,#0f172a); }
    .close:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .content { padding: 0.75rem 0.875rem; color: var(--bq-text-muted,#475569); }
    .header + .content { padding-top: 0.5rem; }
    .footer { padding: 0 0.875rem 0.75rem; display: flex; justify-content: flex-end; gap: 0.5rem; }

    .arrow {
      position: absolute; width: 0.5rem; height: 0.5rem;
      background: var(--bq-bg-base,#fff);
      border: 1px solid var(--bq-border-base,#e2e8f0);
      transform: rotate(45deg);
    }
    .panel[data-placement^="bottom"] .arrow { top: -5px; left: 50%; margin-left: -0.25rem; border-right: none; border-bottom: none; }
    .panel[data-placement^="top"]    .arrow { bottom: -5px; left: 50%; margin-left: -0.25rem; border-left: none; border-top: none; }
    .panel[data-placement^="left"]   .arrow { right: -5px; top: 0.75rem; border-left: none; border-bottom: none; }
    .panel[data-placement^="right"]  .arrow { left: -5px; top: 0.75rem; border-right: none; border-top: none; }
    .panel[data-placement$="-start"] .arrow { left: 1rem; margin-left: 0; }
    .panel[data-placement$="-end"]   .arrow { left: auto; right: 1rem; margin-left: 0; }

    @media (prefers-reduced-motion: reduce) {
      .panel { transition: none; }
    }
  `,
  connected() {
    const self = host<BqPopoverState>(this);
    const scope = bind(self);
    const local = popoverStore(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-popover'));

    const getTrigger = (): HTMLElement | null =>
      self.querySelector('[slot="trigger"]');

    const open = () => {
      if (self.hasAttribute('open')) return;
      self.setAttribute('open', '');
      self.dispatchEvent(
        new CustomEvent('bq-open', { bubbles: true, composed: true })
      );
      scope.frame(() => {
        if (!self.hasAttribute('open')) return;
        const panel = self.shadowRoot?.querySelector('.panel');
        const focusable = panel?.querySelector<HTMLElement>(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      });
    };

    const close = ({ restoreFocus = false } = {}) => {
      if (!self.hasAttribute('open')) return;
      self.removeAttribute('open');
      self.dispatchEvent(
        new CustomEvent('bq-close', { bubbles: true, composed: true })
      );
      if (restoreFocus) getTrigger()?.focus();
    };

    // The outside-click listener only exists while open; the scope owns its
    // removal so a disconnect while open cannot strand it on `document`.
    let stopOutside: Disposer | null = null;
    const syncOutside = () => {
      if (self.hasAttribute('open')) {
        stopOutside ??= scope.on(document, 'click', (e) => {
          if (!self.hasAttribute('open')) return;
          if (!self.contains(e.target as Node)) close();
        });
        return;
      }
      stopOutside?.();
      stopOutside = null;
    };
    local.sync = syncOutside;

    scope.on(self, 'click', (e) => {
      const trigger = getTrigger();
      const target = e.target as Node;
      if (!trigger || !(trigger === target || trigger.contains(target))) return;
      e.preventDefault();
      if (self.hasAttribute('open')) close({ restoreFocus: true });
      else open();
    });

    scope.on(self.shadowRoot, 'click', (e) => {
      if ((e.target as Element).closest('.close')) close({ restoreFocus: true });
    });

    scope.on(self, 'keydown', (e) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Escape' && self.hasAttribute('open')) {
        ke.preventDefault();
        close({ restoreFocus: true });
      }
    });

    scope.frame(syncOutside);
  },
  disconnected() {
    release(this);
  },
  updated() {
    const self = host<BqPopoverState>(this);
    popoverStore(self).sync?.();
    const trigger = self.querySelector('[slot="trigger"]');
    if (!trigger) return;
    trigger.setAttribute(
      'aria-expanded',
      self.hasAttribute('open') ? 'true' : 'false'
    );
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute(
      'aria-controls',
      `${self.getState<string>('uid') || 'bq-popover'}-panel`
    );
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-popover';
    const panelId = `${uid}-panel`;
    const headingId = `${uid}-heading`;
    const heading = props.heading.trim();
    return html`
      <slot name="trigger"></slot>
      <div
        id="${escapeHtml(panelId)}"
        part="panel"
        class="panel"
        role="dialog"
        data-placement="${escapeHtml(props.placement)}"
        aria-hidden="${props.open ? 'false' : 'true'}"
        ${heading ? `aria-labelledby="${escapeHtml(headingId)}"` : ''}
      >
        ${props.arrow ? '<span class="arrow" part="arrow" aria-hidden="true"></span>' : ''}
        ${
          heading || props.dismissible
            ? `<div class="header" part="header">
                 ${heading ? `<h2 class="heading" part="heading" id="${escapeHtml(headingId)}">${escapeHtml(heading)}</h2>` : '<span class="heading"></span>'}
                 ${props.dismissible ? `<button type="button" class="close" part="close" aria-label="${escapeHtml(t('popover.close'))}">&times;</button>` : ''}
               </div>`
            : ''
        }
        <div class="content" part="content"><slot></slot></div>
        <div class="footer" part="footer"><slot name="footer"></slot></div>
      </div>
    `;
  },
};

component<BqPopoverProps, BqPopoverState>('bq-popover', definition);
