import { getBaseStyles } from '../../utils/styles.js';
import { uniqueId } from '../../utils/dom.js';

/**
 * Progress bar component.
 * @element bq-progress
 * @prop {number} value    - 0–100
 * @prop {number} max      - Default 100
 * @prop {string} size     - sm | md | lg
 * @prop {string} variant  - primary | success | danger | warning
 * @prop {boolean} indeterminate
 * @prop {string} label    - Accessible label
 */
export class BqProgress extends HTMLElement {
  static get observedAttributes() { return ['value', 'max', 'size', 'variant', 'indeterminate', 'label']; }
  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-progress');
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const value = parseFloat(this.getAttribute('value') ?? '0');
    const max = parseFloat(this.getAttribute('max') ?? '100');
    const size = this.getAttribute('size') ?? 'md';
    const variant = this.getAttribute('variant') ?? 'primary';
    const indeterminate = this.hasAttribute('indeterminate');
    const label = this.getAttribute('label') ?? 'Progress';

    const pct = indeterminate ? 100 : Math.min(100, Math.max(0, (value / max) * 100));

    const sizeMap: Record<string, string> = { sm: '0.375rem', md: '0.625rem', lg: '1rem' };
    const h = sizeMap[size] ?? sizeMap['md'];

    const colorMap: Record<string, string> = {
      primary: 'var(--bq-color-primary-600,#2563eb)',
      success: 'var(--bq-color-success-600,#16a34a)',
      danger:  'var(--bq-color-danger-600,#dc2626)',
      warning: 'var(--bq-color-warning-600,#d97706)',
    };
    const color = colorMap[variant] ?? colorMap['primary'];

    const styles = `
      ${getBaseStyles()}
      :host { display: block; }
      .track {
        width: 100%; height: ${h};
        background: var(--bq-color-secondary-100,#f1f5f9);
        border-radius: var(--bq-radius-full,9999px);
        overflow: hidden;
      }
      .bar {
        height: 100%;
        background: ${color};
        border-radius: var(--bq-radius-full,9999px);
        width: ${pct}%;
        transition: ${indeterminate ? 'none' : 'width var(--bq-duration-slow,300ms) var(--bq-easing-standard)'};
        ${indeterminate ? 'animation: indeterminate 1.5s ease-in-out infinite;' : ''}
        transform-origin: left center;
      }
      @keyframes indeterminate {
        0%   { transform: translateX(-100%) scaleX(0.5); }
        50%  { transform: translateX(0%) scaleX(0.5); }
        100% { transform: translateX(200%) scaleX(0.5); }
      }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div
        part="track"
        class="track"
        role="progressbar"
        aria-label="${label}"
        aria-valuenow="${indeterminate ? '' : value}"
        aria-valuemin="0"
        aria-valuemax="${max}"
        id="${this._id}"
      >
        <div part="bar" class="bar"></div>
      </div>
    `;
  }
}

export function registerBqProgress(prefix = 'bq'): string {
  const tag = `${prefix}-progress`;
  if (!customElements.get(tag)) customElements.define(tag, BqProgress);
  return tag;
}
