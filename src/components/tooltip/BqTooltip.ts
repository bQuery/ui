import { getBaseStyles } from '../../utils/styles.js';
import { uniqueId } from '../../utils/dom.js';

/**
 * Tooltip component.
 * @element bq-tooltip
 * @prop {string} content  - Tooltip text
 * @prop {string} placement - top | bottom | left | right
 * @prop {number} delay    - Show delay in ms
 * @slot - Trigger element
 */
export class BqTooltip extends HTMLElement {
  static get observedAttributes() { return ['content', 'placement', 'delay']; }
  private _shadow: ShadowRoot;
  private _id: string;
  private _timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-tooltip');
  }

  connectedCallback() { this._render(); }
  disconnectedCallback() { if (this._timer) clearTimeout(this._timer); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const content = this.getAttribute('content') ?? '';
    const placement = this.getAttribute('placement') ?? 'top';
    const delay = parseInt(this.getAttribute('delay') ?? '300', 10);

    const placementStyles: Record<string, string> = {
      top:    'bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);',
      bottom: 'top: calc(100% + 8px); left: 50%; transform: translateX(-50%);',
      left:   'right: calc(100% + 8px); top: 50%; transform: translateY(-50%);',
      right:  'left: calc(100% + 8px); top: 50%; transform: translateY(-50%);',
    };

    const styles = `
      ${getBaseStyles()}
      :host { display: inline-block; position: relative; }
      .trigger { display: contents; }
      .tooltip {
        position: absolute;
        ${placementStyles[placement] ?? placementStyles['top']}
        background: var(--bq-color-secondary-900,#0f172a);
        color: #fff;
        padding: 0.375rem 0.75rem;
        border-radius: var(--bq-radius-md,0.375rem);
        font-size: var(--bq-font-size-sm,0.875rem);
        white-space: nowrap;
        pointer-events: none;
        z-index: var(--bq-z-tooltip,700);
        opacity: 0;
        transition: opacity var(--bq-duration-fast) var(--bq-easing-standard);
        max-width: 20rem;
        white-space: normal;
        text-align: center;
      }
      .tooltip.visible { opacity: 1; }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <span class="trigger" aria-describedby="${this._id}"><slot></slot></span>
      <div role="tooltip" id="${this._id}" class="tooltip" part="tooltip">${content}</div>
    `;

    const trigger = this._shadow.querySelector('.trigger');
    const tooltip = this._shadow.querySelector('.tooltip');

    const show = () => {
      if (this._timer) clearTimeout(this._timer);
      this._timer = setTimeout(() => tooltip?.classList.add('visible'), delay);
    };
    const hide = () => {
      if (this._timer) clearTimeout(this._timer);
      tooltip?.classList.remove('visible');
    };

    trigger?.addEventListener('mouseenter', show);
    trigger?.addEventListener('mouseleave', hide);
    trigger?.addEventListener('focusin', show);
    trigger?.addEventListener('focusout', hide);
  }
}

export function registerBqTooltip(prefix = 'bq'): string {
  const tag = `${prefix}-tooltip`;
  if (!customElements.get(tag)) customElements.define(tag, BqTooltip);
  return tag;
}
