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
import { getBaseStyles } from '../../utils/styles.js';

type BqAccordionProps = {
  label: string;
  open: boolean;
  disabled: boolean;
  variant: string;
};

const definition: ComponentDefinition<BqAccordionProps> = {
  props: {
    label: { type: String, default: '' },
    open: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    variant: { type: String, default: 'default' },
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
    .panel { overflow: hidden; max-height: 0; transition: max-height var(--bq-duration-slow,300ms) var(--bq-easing-standard); }
    :host([open]) .panel { max-height: 2000px; }
    .panel-inner { padding: 0 var(--bq-space-4,1rem) var(--bq-space-4,1rem); color: var(--bq-text-muted,#475569); font-size: var(--bq-font-size-sm,0.875rem); line-height: var(--bq-line-height-relaxed,1.625); }
    @media (prefers-reduced-motion: reduce) {
      .panel { transition: none; }
      .icon { transition: none; }
      .trigger { transition: none; }
    }
  `,
  connected() {
    const self = this;
    const handler = (e: Event) => {
      if ((e.target as Element).closest('.trigger')) {
        if (self.hasAttribute('disabled')) return;
        const newOpen = !self.hasAttribute('open');
        if (newOpen) self.setAttribute('open', '');
        else self.removeAttribute('open');
        self.dispatchEvent(
          new CustomEvent('bq-toggle', {
            detail: { open: newOpen },
            bubbles: true,
            composed: true,
          })
        );
      }
    };
    (self as unknown as Record<string, unknown>)['_handler'] = handler;
    self.shadowRoot?.addEventListener('click', handler);
    // Keyboard: Enter/Space on trigger
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
    (self as unknown as Record<string, unknown>)['_kh'] = kh;
    self.shadowRoot?.addEventListener('keydown', kh);
  },
  disconnected() {
    const self = this as unknown as Record<string, unknown>;
    const h = self['_handler'] as EventListener | undefined;
    const kh = self['_kh'] as EventListener | undefined;
    if (h) this.shadowRoot?.removeEventListener('click', h);
    if (kh) this.shadowRoot?.removeEventListener('keydown', kh);
  },
  render({ props }) {
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
          aria-expanded="${props.open ? 'true' : 'false'}"
          ${props.disabled ? 'disabled aria-disabled="true"' : ''}
        >
          <span part="label">${escapeHtml(props.label)}</span>
          <span class="icon" aria-hidden="true">&#9662;</span>
        </button>
        <div
          part="panel"
          class="panel"
          role="region"
          aria-hidden="${!props.open ? 'true' : 'false'}"
        >
          <div class="panel-inner"><slot></slot></div>
        </div>
      </div>
    `;
  },
};

component<BqAccordionProps>('bq-accordion', definition);
