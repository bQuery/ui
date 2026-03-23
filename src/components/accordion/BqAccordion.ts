/**
 * Accordion / disclosure component.
 * @element bq-accordion
 * @prop {string}  label   - Trigger label
 * @prop {boolean} open    - Expanded state
 * @prop {boolean} disabled
 * @prop {string}  variant - default | bordered | flush
 * @slot - Accordion panel content
 * @fires bq-toggle - { open: boolean }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { uniqueId } from '../../utils/dom.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqAccordionProps = {
  label: string;
  open: boolean;
  disabled: boolean;
  variant: string;
};
type BqAccordionState = { uid: string };

const definition: ComponentDefinition<BqAccordionProps, BqAccordionState> = {
  props: {
    label: { type: String, default: '' },
    open: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    variant: { type: String, default: 'default' },
  },
  state: {
    uid: '',
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    :host([variant="bordered"]) .accordion { border: 1.5px solid var(--bq-border-base,#e2e8f0); border-radius: var(--bq-radius-lg); }
    :host([variant="flush"]) .accordion { border-bottom: 1px solid var(--bq-border-base,#e2e8f0); }
    .accordion { font-family: var(--bq-font-family-sans); }
    .trigger {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; padding: var(--bq-space-4,1rem); background: none; border: none;
      cursor: pointer; color: var(--bq-text-base,#0f172a);
      font-size: var(--bq-font-size-md,1rem); font-weight: var(--bq-font-weight-semibold,600);
      font-family: inherit; text-align: left;
      transition: background var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .trigger:hover:not([disabled]) { background: var(--bq-bg-subtle,#f8fafc); }
    .trigger[disabled] { opacity: 0.5; cursor: not-allowed; }
    .trigger:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .icon { flex-shrink: 0; font-size: 1rem; color: var(--bq-text-muted,#475569); transition: transform var(--bq-duration-fast) var(--bq-easing-standard); }
    :host([open]) .icon { transform: rotate(180deg); }
    .panel { overflow: hidden; height: 0; transition: height var(--bq-duration-slow,300ms) var(--bq-easing-standard); }
    .panel-inner { padding: 0 var(--bq-space-4,1rem) var(--bq-space-4,1rem); color: var(--bq-text-muted,#475569); font-size: var(--bq-font-size-sm,0.875rem); line-height: var(--bq-line-height-relaxed,1.625); }
    @media (prefers-reduced-motion: reduce) {
      .panel { transition: none; }
      .icon { transition: none; }
      .trigger { transition: none; }
    }
  `,
  connected() {
    type BQEl = HTMLElement & {
      setState(k: 'uid', v: string): void;
      getState<T>(k: string): T;
    };
    const self = this as unknown as BQEl;
    if (!self.getState<string>('uid'))
      self.setState('uid', uniqueId('bq-acc'));

    const syncPanelHeight = () => {
      const panel = self.shadowRoot?.querySelector('.panel') as HTMLElement | null;
      if (!panel) return;
      if (self.hasAttribute('open')) {
        const inner = panel.querySelector('.panel-inner') as HTMLElement | null;
        if (inner) {
          panel.style.height = `${inner.scrollHeight}px`;
        }
      } else {
        panel.style.height = '0';
      }
    };

    const handler = (e: Event) => {
      if ((e.target as Element).closest('.trigger')) {
        if (self.hasAttribute('disabled')) return;
        const newOpen = !self.hasAttribute('open');
        if (newOpen) self.setAttribute('open', '');
        else self.removeAttribute('open');

        syncPanelHeight();

        self.dispatchEvent(
          new CustomEvent('bq-toggle', {
            detail: { open: newOpen },
            bubbles: true,
            composed: true,
          })
        );
      }
    };

    const kh = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (
        (ke.key === 'Enter' || ke.key === ' ') &&
        (e.target as Element).closest('.trigger')
      ) {
        ke.preventDefault();
        handler(e);
      }
    };

    const s = self as unknown as Record<string, unknown>;
    s['_handler'] = handler;
    s['_kh'] = kh;
    s['_syncHeight'] = syncPanelHeight;
    self.shadowRoot?.addEventListener('click', handler);
    self.shadowRoot?.addEventListener('keydown', kh);

    // Sync panel height on initial render
    requestAnimationFrame(syncPanelHeight);
  },
  disconnected() {
    const self = this as unknown as Record<string, unknown>;
    const h = self['_handler'] as EventListener | undefined;
    const kh = self['_kh'] as EventListener | undefined;
    if (h) this.shadowRoot?.removeEventListener('click', h);
    if (kh) this.shadowRoot?.removeEventListener('keydown', kh);
  },
  updated() {
    // Only recalculate height when the open attribute changes
    const s = this as unknown as Record<string, unknown>;
    const wasOpen = s['_wasOpen'] as boolean | undefined;
    const isOpen = this.hasAttribute('open');
    if (wasOpen !== isOpen) {
      s['_wasOpen'] = isOpen;
      const syncHeight = s['_syncHeight'] as (() => void) | undefined;
      if (syncHeight) syncHeight();
    }
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-acc';
    const triggerId = `${uid}-trigger`;
    const panelId = `${uid}-panel`;
    return html`
      <div
        part="accordion"
        class="accordion"
        data-variant="${escapeHtml(props.variant)}"
      >
        <button
          part="trigger"
          class="trigger"
          type="button"
          id="${triggerId}"
          aria-expanded="${props.open ? 'true' : 'false'}"
          aria-controls="${panelId}"
          ${props.disabled ? 'disabled aria-disabled="true"' : ''}
        >
          <span part="label">${escapeHtml(props.label)}</span>
          <span class="icon" aria-hidden="true">&#9662;</span>
        </button>
        <div
          part="panel"
          class="panel"
          id="${panelId}"
          role="region"
          aria-labelledby="${triggerId}"
          aria-hidden="${!props.open ? 'true' : 'false'}"
        >
          <div class="panel-inner"><slot></slot></div>
        </div>
      </div>
    `;
  },
};

component<BqAccordionProps, BqAccordionState>('bq-accordion', definition);
