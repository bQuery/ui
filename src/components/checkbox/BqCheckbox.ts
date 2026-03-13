import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';

/**
 * Checkbox component.
 * @element bq-checkbox
 * @prop {string}  label
 * @prop {string}  name
 * @prop {string}  value
 * @prop {boolean} checked
 * @prop {boolean} indeterminate
 * @prop {boolean} disabled
 * @prop {boolean} required
 * @prop {string}  hint
 * @fires bq-change - { checked, value }
 */
export class BqCheckbox extends HTMLElement {
  static get observedAttributes() { return ['label','name','value','checked','indeterminate','disabled','required','hint']; }
  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-checkbox');
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
    const indeterminate = this.hasAttribute('indeterminate');
    const disabled = this.hasAttribute('disabled');
    const required = this.hasAttribute('required');
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
      .check-wrap {
        position: relative; display: inline-flex; align-items: center; justify-content: center;
        width: 1.125rem; height: 1.125rem; flex-shrink: 0; margin-top: 0.1rem;
      }
      input[type="checkbox"] {
        position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: ${disabled ? 'not-allowed' : 'pointer'};
      }
      .box {
        width: 1.125rem; height: 1.125rem;
        border: 2px solid ${checked || indeterminate ? 'var(--bq-color-primary-600,#2563eb)' : 'var(--bq-border-emphasis,#cbd5e1)'};
        border-radius: var(--bq-radius-sm,0.25rem);
        background: ${checked || indeterminate ? 'var(--bq-color-primary-600,#2563eb)' : 'var(--bq-bg-base,#fff)'};
        display: flex; align-items: center; justify-content: center;
        transition: all var(--bq-duration-fast) var(--bq-easing-standard);
        pointer-events: none;
        color: #fff; font-size: 0.7rem; font-weight: bold;
      }
      input:focus-visible ~ .box { box-shadow: var(--bq-focus-ring); }

      .label-wrap { display: flex; flex-direction: column; gap: 0.125rem; padding-top: 0.05rem; }
      .label-text { font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500); color: var(--bq-text-base,#0f172a); }
      .hint { font-size: 0.75rem; color: var(--bq-text-muted,#475569); }
    `;

    const checkmark = checked ? '✓' : (indeterminate ? '−' : '');

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <label class="wrapper" part="wrapper">
        <span class="check-wrap">
          <input
            type="checkbox"
            id="${this._id}"
            name="${name}"
            value="${value}"
            ${checked ? 'checked' : ''}
            ${disabled ? 'disabled' : ''}
            ${required ? 'required' : ''}
            aria-checked="${indeterminate ? 'mixed' : checked}"
          />
          <span class="box" part="box" aria-hidden="true">${checkmark}</span>
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
      if (indeterminate) input.indeterminate = true;
      input.addEventListener('change', () => {
        if (indeterminate) { this.removeAttribute('indeterminate'); }
        input.checked ? this.setAttribute('checked', '') : this.removeAttribute('checked');
        dispatch(this, 'bq-change', { checked: input.checked, value });
      });
    }
  }
}

export function registerBqCheckbox(prefix = 'bq'): string {
  const tag = `${prefix}-checkbox`;
  if (!customElements.get(tag)) customElements.define(tag, BqCheckbox);
  return tag;
}
