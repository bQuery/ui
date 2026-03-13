import { getBaseStyles } from '../../utils/styles.js';

/**
 * Divider / separator component.
 * @element bq-divider
 * @prop {string} orientation - horizontal | vertical
 * @prop {string} variant     - solid | dashed | dotted
 * @prop {string} label       - Optional center label
 */
export class BqDivider extends HTMLElement {
  static get observedAttributes() { return ['orientation', 'variant', 'label']; }
  private _shadow: ShadowRoot;
  constructor() { super(); this._shadow = this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const orientation = this.getAttribute('orientation') ?? 'horizontal';
    const variant = this.getAttribute('variant') ?? 'solid';
    const label = this.getAttribute('label') ?? '';
    const isVertical = orientation === 'vertical';

    const styles = `
      ${getBaseStyles()}
      :host { display: ${isVertical ? 'inline-flex' : 'flex'}; align-items: center; }
      .divider {
        display: flex;
        align-items: center;
        ${isVertical ? 'flex-direction: column; height: 100%; width: 1px;' : 'flex-direction: row; width: 100%;'}
        gap: 0.75rem;
        color: var(--bq-text-muted,#475569);
        font-size: var(--bq-font-size-sm,0.875rem);
      }
      .line {
        flex: 1;
        border: none;
        ${isVertical
          ? `border-left: 1px ${variant} var(--bq-border-base,#e2e8f0); height: 100%;`
          : `border-top: 1px ${variant} var(--bq-border-base,#e2e8f0); width: 100%;`}
      }
      .label { white-space: nowrap; color: var(--bq-text-muted,#475569); }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div part="divider" class="divider" role="separator" aria-orientation="${orientation}">
        <span class="line"></span>
        ${label ? `<span class="label">${label}</span><span class="line"></span>` : ''}
      </div>
    `;
  }
}

export function registerBqDivider(prefix = 'bq'): string {
  const tag = `${prefix}-divider`;
  if (!customElements.get(tag)) customElements.define(tag, BqDivider);
  return tag;
}
