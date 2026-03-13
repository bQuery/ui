import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';

/**
 * Button component.
 * @element bq-button
 *
 * @prop {string} variant - primary | secondary | outline | ghost | danger
 * @prop {string} size    - sm | md | lg | xl
 * @prop {boolean} disabled
 * @prop {boolean} loading
 * @prop {string} type    - button | submit | reset
 *
 * @slot - Button content (default)
 * @slot prefix-icon - Icon before label
 * @slot suffix-icon - Icon after label
 *
 * @fires bq-click - CustomEvent<{ originalEvent: MouseEvent }>
 */
export class BqButton extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'loading', 'type', 'href', 'target'];
  }

  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-btn');
  }

  connectedCallback() {
    // Attach event delegation once on the shadow root; survives innerHTML re-renders.
    this._shadow.addEventListener('click', this._handleClick);
    this._render();
  }

  disconnectedCallback() {
    this._shadow.removeEventListener('click', this._handleClick);
  }

  attributeChangedCallback() {
    this._render();
  }

  private _handleClick = (e: Event) => {
    if (this.hasAttribute('disabled') || this.hasAttribute('loading')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    dispatch(this, 'bq-click', { originalEvent: e });
  };

  private _render() {
    const variant = this.getAttribute('variant') ?? 'primary';
    const size = this.getAttribute('size') ?? 'md';
    const disabled = this.hasAttribute('disabled');
    const loading = this.hasAttribute('loading');
    const type = (this.getAttribute('type') ?? 'button') as
      | 'button'
      | 'submit'
      | 'reset';
    const href = this.getAttribute('href');

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }

      :host { display: inline-block; }
      :host([hidden]) { display: none; }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        border: 1.5px solid transparent;
        border-radius: var(--bq-radius-lg, 0.5rem);
        font-family: var(--bq-font-family-sans);
        font-weight: var(--bq-font-weight-semibold, 600);
        line-height: 1;
        cursor: pointer;
        text-decoration: none;
        transition:
          background-color var(--bq-duration-fast, 150ms) var(--bq-easing-standard),
          border-color var(--bq-duration-fast, 150ms) var(--bq-easing-standard),
          box-shadow var(--bq-duration-fast, 150ms) var(--bq-easing-standard),
          opacity var(--bq-duration-fast, 150ms) var(--bq-easing-standard);
        white-space: nowrap;
        user-select: none;
        -webkit-user-select: none;
        position: relative;
        overflow: hidden;
      }

      /* Sizes */
      .btn--sm { font-size: var(--bq-font-size-sm, 0.875rem); padding: 0.375rem 0.75rem; min-height: 2rem; }
      .btn--md { font-size: var(--bq-font-size-md, 1rem);    padding: 0.5rem 1rem;    min-height: 2.5rem; }
      .btn--lg { font-size: var(--bq-font-size-lg, 1.125rem); padding: 0.625rem 1.25rem; min-height: 3rem; }
      .btn--xl { font-size: var(--bq-font-size-xl, 1.25rem); padding: 0.75rem 1.5rem; min-height: 3.5rem; }

      /* Variants */
      .btn--primary {
        background-color: var(--bq-color-primary-600, #2563eb);
        color: #ffffff;
        border-color: var(--bq-color-primary-600, #2563eb);
      }
      .btn--primary:hover:not(:disabled) { background-color: var(--bq-color-primary-700, #1d4ed8); border-color: var(--bq-color-primary-700, #1d4ed8); }
      .btn--primary:active:not(:disabled) { background-color: var(--bq-color-primary-800, #1e40af); }

      .btn--secondary {
        background-color: var(--bq-color-secondary-100, #f1f5f9);
        color: var(--bq-color-secondary-700, #334155);
        border-color: var(--bq-color-secondary-200, #e2e8f0);
      }
      .btn--secondary:hover:not(:disabled) { background-color: var(--bq-color-secondary-200, #e2e8f0); }

      .btn--outline {
        background-color: transparent;
        color: var(--bq-color-primary-600, #2563eb);
        border-color: var(--bq-color-primary-600, #2563eb);
      }
      .btn--outline:hover:not(:disabled) { background-color: var(--bq-color-primary-50, #eff6ff); }

      .btn--ghost {
        background-color: transparent;
        color: var(--bq-color-secondary-700, #334155);
        border-color: transparent;
      }
      .btn--ghost:hover:not(:disabled) { background-color: var(--bq-color-secondary-100, #f1f5f9); }

      .btn--danger {
        background-color: var(--bq-color-danger-600, #dc2626);
        color: #ffffff;
        border-color: var(--bq-color-danger-600, #dc2626);
      }
      .btn--danger:hover:not(:disabled) { background-color: var(--bq-color-danger-700, #b91c1c); }

      /* States */
      .btn:focus-visible {
        outline: 2px solid transparent;
        box-shadow: var(--bq-focus-ring, 0 0 0 3px rgba(37, 99, 235, 0.35));
      }
      .btn--danger:focus-visible { box-shadow: var(--bq-focus-ring-danger, 0 0 0 3px rgba(239, 68, 68, 0.35)); }
      .btn:disabled, .btn[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; }

      /* Loading */
      .spinner {
        width: 1em; height: 1em;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;

    const tag = href ? 'a' : 'button';
    const sizeClass = `btn--${size}`;
    const variantClass = `btn--${variant}`;
    const disabledAttrs = disabled || loading
      ? `aria-disabled="true"${disabled ? ' disabled' : ''}`
      : '';

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <${tag}
        part="button"
        id="${this._id}"
        class="btn ${sizeClass} ${variantClass}"
        type="${tag === 'button' ? type : ''}"
        ${href ? `href="${href}"` : ''}
        ${this.getAttribute('target') ? `target="${this.getAttribute('target')}"` : ''}
        ${disabledAttrs}
        ${loading ? 'aria-busy="true"' : ''}
        role="${tag === 'a' ? 'button' : ''}"
      >
        <slot name="prefix-icon"></slot>
        ${loading ? '<span class="spinner" aria-hidden="true"></span>' : ''}
        <slot></slot>
        <slot name="suffix-icon"></slot>
      </${tag}>
    `;

    this._shadow
      .querySelector('button,a')
      ?.addEventListener('click', this._handleClick);
  }
}

export function registerBqButton(prefix = 'bq'): string {
  const tag = `${prefix}-button`;
  if (!customElements.get(tag)) {
    customElements.define(tag, BqButton);
  }
  return tag;
}
