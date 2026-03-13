import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';
import { t } from '../../i18n/index.js';

/**
 * Accordion component.
 * @element bq-accordion
 * @prop {string}  label     - Accordion item title
 * @prop {boolean} open      - Whether the item is expanded
 * @prop {boolean} disabled
 * @prop {string}  variant   - default | bordered | flush
 * @slot - Accordion content
 * @fires bq-toggle - { open }
 */
export class BqAccordion extends HTMLElement {
  static get observedAttributes() { return ['label','open','disabled','variant']; }
  private _shadow: ShadowRoot;
  private _id: string;
  private _panelId: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-accordion');
    this._panelId = `${this._id}-panel`;
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  get open(): boolean { return this.hasAttribute('open'); }
  set open(v: boolean) { v ? this.setAttribute('open', '') : this.removeAttribute('open'); }

  private _render() {
    const label = this.getAttribute('label') ?? '';
    const open = this.hasAttribute('open');
    const disabled = this.hasAttribute('disabled');
    const variant = this.getAttribute('variant') ?? 'default';

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .accordion {
        font-family: var(--bq-font-family-sans);
        ${variant === 'bordered' ? 'border: 1.5px solid var(--bq-border-base,#e2e8f0); border-radius: var(--bq-radius-lg);' : ''}
        ${variant === 'flush' ? 'border-bottom: 1px solid var(--bq-border-base,#e2e8f0);' : ''}
      }

      .trigger {
        display: flex; align-items: center; justify-content: space-between;
        width: 100%; padding: var(--bq-space-4,1rem);
        background: none; border: none; cursor: ${disabled ? 'not-allowed' : 'pointer'};
        color: var(--bq-text-base,#0f172a);
        font-size: var(--bq-font-size-md,1rem);
        font-weight: var(--bq-font-weight-semibold,600);
        font-family: inherit;
        text-align: left;
        opacity: ${disabled ? '0.5' : '1'};
        transition: background var(--bq-duration-fast) var(--bq-easing-standard);
        border-radius: ${variant === 'bordered' ? 'calc(var(--bq-radius-lg) - 1.5px)' : '0'};
      }
      .trigger:hover:not(:disabled) { background: var(--bq-bg-subtle,#f8fafc); }
      .trigger:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }

      .icon {
        flex-shrink: 0; transition: transform var(--bq-duration-fast) var(--bq-easing-standard);
        font-size: 1rem; color: var(--bq-text-muted,#475569);
        transform: rotate(${open ? '180deg' : '0deg'});
      }

      .panel {
        overflow: hidden;
        max-height: ${open ? '2000px' : '0'};
        transition: max-height var(--bq-duration-slow,300ms) var(--bq-easing-standard);
      }
      .panel-inner {
        padding: 0 var(--bq-space-4,1rem) var(--bq-space-4,1rem);
        color: var(--bq-text-muted,#475569);
        font-size: var(--bq-font-size-sm,0.875rem);
        line-height: var(--bq-line-height-relaxed,1.625);
      }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div part="accordion" class="accordion">
        <button
          part="trigger"
          class="trigger"
          aria-expanded="${open}"
          aria-controls="${this._panelId}"
          id="${this._id}"
          ${disabled ? 'disabled aria-disabled="true"' : ''}
          type="button"
        >
          <span part="label">${label}</span>
          <span class="icon" aria-hidden="true">▾</span>
        </button>
        <div
          part="panel"
          class="panel"
          id="${this._panelId}"
          role="region"
          aria-labelledby="${this._id}"
          ${!open ? 'hidden' : ''}
        >
          <div class="panel-inner"><slot></slot></div>
        </div>
      </div>
    `;

    this._shadow.querySelector('.trigger')?.addEventListener('click', () => {
      if (disabled) return;
      const newOpen = !this.hasAttribute('open');
      newOpen ? this.setAttribute('open', '') : this.removeAttribute('open');
      dispatch(this, 'bq-toggle', { open: newOpen });
    });
  }
}

export function registerBqAccordion(prefix = 'bq'): string {
  const tag = `${prefix}-accordion`;
  if (!customElements.get(tag)) customElements.define(tag, BqAccordion);
  return tag;
}
