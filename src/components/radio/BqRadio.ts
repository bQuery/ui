import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';

/**
 * Radio button component.
 * @element bq-radio
 * @prop {string}  label
 * @prop {string}  name
 * @prop {string}  value
 * @prop {boolean} checked
 * @prop {boolean} disabled
 * @prop {string}  hint
 * @fires bq-change - { value }
 */
export class BqRadio extends HTMLElement {
  static get observedAttributes() { return ['label','name','value','checked','disabled','hint']; }
  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-radio');
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  get checked(): boolean { return this.hasAttribute('checked'); }
  set checked(v: boolean) { v ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }

  private _render() {
    const label = this.getAttribute('label') ?? '';
    const name = this.getAttribute('name') ?? '';
    const value = this.getAttribute('value') ?? '';
    const checked = this.hasAttribute('checked');
    const disabled = this.hasAttribute('disabled');
    const hint = this.getAttribute('hint') ?? '';

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }
      .wrapper {
        display: inline-flex; align-items: flex-start; gap: 0.5rem;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        opacity: ${disabled ? '0.5' : '1'};
        font-family: var(--bq-font-family-sans);
        user-select: none;
      }
      .radio-wrap {
        position: relative; display: inline-flex; align-items: center; justify-content: center;
        width: 1.125rem; height: 1.125rem; flex-shrink: 0; margin-top: 0.1rem;
      }
      input[type="radio"] {
        position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
      }
      .circle {
        width: 1.125rem; height: 1.125rem;
        border: 2px solid ${checked ? 'var(--bq-color-primary-600,#2563eb)' : 'var(--bq-border-emphasis,#cbd5e1)'};
        border-radius: var(--bq-radius-full,9999px);
        background: var(--bq-bg-base,#fff);
        display: flex; align-items: center; justify-content: center;
        transition: all var(--bq-duration-fast) var(--bq-easing-standard);
        pointer-events: none;
      }
      .dot {
        width: 0.5rem; height: 0.5rem;
        border-radius: var(--bq-radius-full,9999px);
        background: var(--bq-color-primary-600,#2563eb);
        transform: scale(${checked ? '1' : '0'});
        transition: transform var(--bq-duration-fast) var(--bq-easing-spring,cubic-bezier(0.34,1.56,0.64,1));
      }
      input:focus-visible ~ .circle { box-shadow: var(--bq-focus-ring); }
      .label-wrap { display: flex; flex-direction: column; gap: 0.125rem; padding-top: 0.05rem; }
      .label-text { font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500); color: var(--bq-text-base,#0f172a); }
      .hint { font-size: 0.75rem; color: var(--bq-text-muted,#475569); }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <label class="wrapper" part="wrapper">
        <span class="radio-wrap">
          <input
            type="radio"
            id="${this._id}"
            name="${name}"
            value="${value}"
            ${checked ? 'checked' : ''}
            ${disabled ? 'disabled' : ''}
          />
          <span class="circle" part="circle" aria-hidden="true">
            <span class="dot"></span>
          </span>
        </span>
        ${label || hint ? `
          <span class="label-wrap">
            ${label ? `<span class="label-text">${label}</span>` : ''}
            ${hint ? `<span class="hint">${hint}</span>` : ''}
          </span>
        ` : ''}
      </label>
    `;

    const input = this._shadow.querySelector('input');
    if (input) {
      input.addEventListener('change', () => {
        this.setAttribute('checked', '');
        dispatch(this, 'bq-change', { value });
      });
    }
  }
}

export function registerBqRadio(prefix = 'bq'): string {
  const tag = `${prefix}-radio`;
  if (!customElements.get(tag)) customElements.define(tag, BqRadio);
  return tag;
}
