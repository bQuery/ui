import { getBaseStyles } from '../../utils/styles.js';

/**
 * Spinner / loading indicator.
 * @element bq-spinner
 * @prop {string} size    - sm | md | lg | xl
 * @prop {string} variant - primary | secondary | white
 * @prop {string} label   - Accessible label
 */
export class BqSpinner extends HTMLElement {
  static get observedAttributes() { return ['size', 'variant', 'label']; }
  private _shadow: ShadowRoot;
  constructor() { super(); this._shadow = this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const size = this.getAttribute('size') ?? 'md';
    const variant = this.getAttribute('variant') ?? 'primary';
    const label = this.getAttribute('label') ?? 'Loading…';

    const sizeMap: Record<string, string> = { sm: '1rem', md: '1.5rem', lg: '2rem', xl: '3rem' };
    const dim = sizeMap[size] ?? sizeMap['md'];
    const borderSize = size === 'sm' ? '2px' : size === 'xl' ? '4px' : '3px';
    const colorMap: Record<string, string> = {
      primary: 'var(--bq-color-primary-600,#2563eb)',
      secondary: 'var(--bq-color-secondary-400,#94a3b8)',
      white: '#ffffff',
    };
    const color = colorMap[variant] ?? colorMap['primary'];

    const styles = `
      ${getBaseStyles()}
      :host { display: inline-flex; align-items: center; justify-content: center; }
      .spinner {
        width: ${dim}; height: ${dim};
        border: ${borderSize} solid currentColor;
        border-top-color: transparent;
        border-radius: var(--bq-radius-full,9999px);
        animation: spin 0.75s linear infinite;
        color: ${color};
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <span
        part="spinner"
        class="spinner"
        role="status"
        aria-label="${label}"
      ></span>
    `;
  }
}

export function registerBqSpinner(prefix = 'bq'): string {
  const tag = `${prefix}-spinner`;
  if (!customElements.get(tag)) customElements.define(tag, BqSpinner);
  return tag;
}
