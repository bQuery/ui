import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';

/**
 * Textarea component.
 * @element bq-textarea
 * @prop {string}  label
 * @prop {string}  value
 * @prop {string}  placeholder
 * @prop {string}  name
 * @prop {number}  rows
 * @prop {boolean} disabled
 * @prop {boolean} readonly
 * @prop {boolean} required
 * @prop {boolean} resize      - allow resize (default: vertical)
 * @prop {string}  error
 * @prop {string}  hint
 * @prop {string}  maxlength
 * @fires bq-input, bq-change, bq-focus, bq-blur
 */
export class BqTextarea extends HTMLElement {
  static get observedAttributes() {
    return ['label','value','placeholder','name','rows','disabled','readonly','required','resize','error','hint','maxlength'];
  }
  private _shadow: ShadowRoot;
  private _id: string;
  private _errorId: string;
  private _hintId: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-textarea');
    this._errorId = `${this._id}-error`;
    this._hintId = `${this._id}-hint`;
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const label = this.getAttribute('label') ?? '';
    const value = this.getAttribute('value') ?? '';
    const placeholder = this.getAttribute('placeholder') ?? '';
    const name = this.getAttribute('name') ?? '';
    const rows = this.getAttribute('rows') ?? '4';
    const disabled = this.hasAttribute('disabled');
    const readonly = this.hasAttribute('readonly');
    const required = this.hasAttribute('required');
    const resize = !this.hasAttribute('noresize');
    const error = this.getAttribute('error') ?? '';
    const hint = this.getAttribute('hint') ?? '';
    const maxlength = this.getAttribute('maxlength') ?? '';

    const describedBy = [error ? this._errorId : '', hint ? this._hintId : ''].filter(Boolean).join(' ');

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .field { display: flex; flex-direction: column; gap: 0.375rem; }
      .label { font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500); color: var(--bq-text-base,#0f172a); font-family: var(--bq-font-family-sans); display: flex; align-items: center; gap: 0.25rem; }
      .required-mark { color: var(--bq-color-danger-600,#dc2626); }
      .wrap {
        border: 1.5px solid ${error ? 'var(--bq-color-danger-500,#ef4444)' : 'var(--bq-border-emphasis,#cbd5e1)'};
        border-radius: var(--bq-radius-lg,0.5rem);
        background: var(--bq-bg-base,#fff);
        transition: border-color var(--bq-duration-fast) var(--bq-easing-standard), box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
        overflow: hidden;
      }
      .wrap:focus-within {
        border-color: ${error ? 'var(--bq-color-danger-500)' : 'var(--bq-border-focus,#2563eb)'};
        box-shadow: ${error ? 'var(--bq-focus-ring-danger)' : 'var(--bq-focus-ring)'};
      }
      textarea {
        width: 100%; border: none; outline: none; background: transparent;
        color: var(--bq-text-base,#0f172a);
        font-family: var(--bq-font-family-sans);
        font-size: var(--bq-font-size-md,1rem);
        padding: 0.625rem 0.875rem;
        resize: ${resize ? 'vertical' : 'none'};
        min-height: 6rem;
      }
      textarea::placeholder { color: var(--bq-text-subtle,#94a3b8); }
      .hint { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); font-family: var(--bq-font-family-sans); }
      .error-msg { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-color-danger-600,#dc2626); font-family: var(--bq-font-family-sans); }
      .counter { font-size: 0.75rem; color: var(--bq-text-subtle,#94a3b8); text-align: right; padding: 0.25rem 0.75rem 0.5rem; font-family: var(--bq-font-family-sans); }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div class="field" part="field">
        ${label ? `<label class="label" for="${this._id}" part="label">${label}${required ? '<span class="required-mark" aria-hidden="true">*</span>' : ''}</label>` : ''}
        <div class="wrap" part="wrap">
          <textarea
            part="textarea"
            id="${this._id}"
            name="${name}"
            rows="${rows}"
            placeholder="${placeholder}"
            ${maxlength ? `maxlength="${maxlength}"` : ''}
            ${disabled ? 'disabled' : ''}
            ${readonly ? 'readonly' : ''}
            ${required ? 'required' : ''}
            aria-invalid="${!!error}"
            ${describedBy ? `aria-describedby="${describedBy}"` : ''}
          >${value}</textarea>
          ${maxlength ? `<div class="counter" part="counter" aria-hidden="true">${value.length} / ${maxlength}</div>` : ''}
        </div>
        ${error ? `<span class="error-msg" id="${this._errorId}" role="alert" part="error">${error}</span>` : ''}
        ${hint && !error ? `<span class="hint" id="${this._hintId}" part="hint">${hint}</span>` : ''}
      </div>
    `;

    const ta = this._shadow.querySelector('textarea');
    const counter = this._shadow.querySelector('.counter');
    if (ta) {
      ta.addEventListener('input', () => {
        dispatch(this, 'bq-input', { value: ta.value });
        if (counter && maxlength) counter.textContent = `${ta.value.length} / ${maxlength}`;
      });
      ta.addEventListener('change', () => dispatch(this, 'bq-change', { value: ta.value }));
      ta.addEventListener('focus', () => dispatch(this, 'bq-focus'));
      ta.addEventListener('blur', () => dispatch(this, 'bq-blur'));
    }
  }
}

export function registerBqTextarea(prefix = 'bq'): string {
  const tag = `${prefix}-textarea`;
  if (!customElements.get(tag)) customElements.define(tag, BqTextarea);
  return tag;
}
