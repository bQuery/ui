import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';

/**
 * Icon-only button component.
 * @element bq-icon-button
 *
 * @prop {string} variant - primary | secondary | outline | ghost | danger
 * @prop {string} size    - sm | md | lg
 * @prop {boolean} disabled
 * @prop {string} label   - Accessible label (required for icon-only buttons)
 * @prop {string} type    - button | submit | reset
 *
 * @slot - Icon content
 * @fires bq-click
 */
export class BqIconButton extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'label', 'type', 'loading'];
  }

  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-icon-btn');
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _handleClick = (e: Event) => {
    if (this.hasAttribute('disabled') || this.hasAttribute('loading')) {
      e.preventDefault(); e.stopPropagation(); return;
    }
    dispatch(this, 'bq-click', { originalEvent: e });
  };

  private _render() {
    const variant = this.getAttribute('variant') ?? 'ghost';
    const size = this.getAttribute('size') ?? 'md';
    const disabled = this.hasAttribute('disabled');
    const loading = this.hasAttribute('loading');
    const label = this.getAttribute('label') ?? '';
    const type = this.getAttribute('type') ?? 'button';

    const sizeMap: Record<string, string> = {
      sm: '2rem', md: '2.5rem', lg: '3rem',
    };
    const btnSize = sizeMap[size] ?? '2.5rem';

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: inline-block; }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1.5px solid transparent;
        border-radius: var(--bq-radius-lg, 0.5rem);
        width: ${btnSize};
        height: ${btnSize};
        cursor: pointer;
        transition: background-color var(--bq-duration-fast) var(--bq-easing-standard),
                    box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
        background: none;
        padding: 0;
      }

      .btn--primary { background-color: var(--bq-color-primary-600,#2563eb); color:#fff; border-color: var(--bq-color-primary-600,#2563eb); }
      .btn--primary:hover:not(:disabled) { background-color: var(--bq-color-primary-700,#1d4ed8); }
      .btn--secondary { background-color: var(--bq-color-secondary-100,#f1f5f9); color: var(--bq-color-secondary-700,#334155); border-color: var(--bq-color-secondary-200,#e2e8f0); }
      .btn--secondary:hover:not(:disabled) { background-color: var(--bq-color-secondary-200,#e2e8f0); }
      .btn--outline { background-color: transparent; color: var(--bq-color-primary-600,#2563eb); border-color: var(--bq-color-primary-600,#2563eb); }
      .btn--outline:hover:not(:disabled) { background-color: var(--bq-color-primary-50,#eff6ff); }
      .btn--ghost { background-color: transparent; color: var(--bq-color-secondary-700,#334155); }
      .btn--ghost:hover:not(:disabled) { background-color: var(--bq-color-secondary-100,#f1f5f9); }
      .btn--danger { background-color: var(--bq-color-danger-600,#dc2626); color:#fff; }
      .btn--danger:hover:not(:disabled) { background-color: var(--bq-color-danger-700,#b91c1c); }

      .btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
      .btn:disabled { opacity: 0.5; cursor: not-allowed; }

      .spinner { width:1.2em;height:1.2em;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.7s linear infinite; }
      @keyframes spin { to { transform:rotate(360deg); } }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <button
        part="button"
        id="${this._id}"
        class="btn btn--${variant}"
        type="${type}"
        ${disabled ? 'disabled aria-disabled="true"' : ''}
        ${loading ? 'aria-busy="true"' : ''}
        aria-label="${label}"
        title="${label}"
      >
        ${loading ? '<span class="spinner" aria-hidden="true"></span>' : '<slot></slot>'}
      </button>
    `;

    this._shadow.querySelector('button')?.addEventListener('click', this._handleClick);
  }
}

export function registerBqIconButton(prefix = 'bq'): string {
  const tag = `${prefix}-icon-button`;
  if (!customElements.get(tag)) customElements.define(tag, BqIconButton);
  return tag;
}
