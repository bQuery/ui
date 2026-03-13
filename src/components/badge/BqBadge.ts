import { getBaseStyles } from '../../utils/styles.js';

/**
 * Badge component.
 * @element bq-badge
 * @prop {string} variant - primary | secondary | success | danger | warning | info | outline
 * @prop {string} size    - sm | md | lg
 * @prop {boolean} pill   - fully-rounded badge
 * @slot - Badge content
 */
export class BqBadge extends HTMLElement {
  static get observedAttributes() { return ['variant', 'size', 'pill']; }
  private _shadow: ShadowRoot;
  constructor() { super(); this._shadow = this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const variant = this.getAttribute('variant') ?? 'primary';
    const size = this.getAttribute('size') ?? 'md';
    const pill = this.hasAttribute('pill');

    const variantStyles: Record<string, string> = {
      primary:   'background: var(--bq-color-primary-100,#dbeafe); color: var(--bq-color-primary-700,#1d4ed8);',
      secondary: 'background: var(--bq-color-secondary-100,#f1f5f9); color: var(--bq-color-secondary-700,#334155);',
      success:   'background: var(--bq-color-success-100,#dcfce7); color: var(--bq-color-success-700,#15803d);',
      danger:    'background: var(--bq-color-danger-100,#fee2e2); color: var(--bq-color-danger-700,#b91c1c);',
      warning:   'background: var(--bq-color-warning-100,#fef3c7); color: var(--bq-color-warning-700,#b45309);',
      info:      'background: var(--bq-color-info-100,#dbeafe); color: var(--bq-color-info-700,#1d4ed8);',
      outline:   'background: transparent; color: var(--bq-text-base,#0f172a); border: 1.5px solid var(--bq-border-emphasis,#cbd5e1);',
    };
    const sizeStyles: Record<string, string> = {
      sm: 'font-size: 0.6875rem; padding: 0.125rem 0.5rem;',
      md: 'font-size: 0.75rem; padding: 0.2rem 0.6rem;',
      lg: 'font-size: 0.875rem; padding: 0.3rem 0.75rem;',
    };

    const styles = `
      ${getBaseStyles()}
      :host { display: inline-flex; }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-weight: var(--bq-font-weight-semibold, 600);
        line-height: 1;
        border-radius: ${pill ? 'var(--bq-radius-full,9999px)' : 'var(--bq-radius-md,0.375rem)'};
        white-space: nowrap;
        ${variantStyles[variant] ?? variantStyles['primary']}
        ${sizeStyles[size] ?? sizeStyles['md']}
      }
    `;

    this._shadow.innerHTML = `<style>${styles}</style><span part="badge" class="badge"><slot></slot></span>`;
  }
}

export function registerBqBadge(prefix = 'bq'): string {
  const tag = `${prefix}-badge`;
  if (!customElements.get(tag)) customElements.define(tag, BqBadge);
  return tag;
}
