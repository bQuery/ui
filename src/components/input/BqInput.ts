import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';

/**
 * Input component.
 * @element bq-input
 * @prop {string}  label
 * @prop {string}  type       - text | email | password | number | tel | url | search
 * @prop {string}  value
 * @prop {string}  placeholder
 * @prop {string}  name
 * @prop {string}  size       - sm | md | lg
 * @prop {boolean} disabled
 * @prop {boolean} readonly
 * @prop {boolean} required
 * @prop {string}  error      - Error message
 * @prop {string}  hint       - Hint message
 * @prop {string}  maxlength
 * @slot prefix - Leading icon/element
 * @slot suffix - Trailing icon/element
 * @fires bq-input  - { value }
 * @fires bq-change - { value }
 * @fires bq-focus
 * @fires bq-blur
 */
export class BqInput extends HTMLElement {
  static get observedAttributes() {
    return ['label','type','value','placeholder','name','size','disabled','readonly','required','error','hint','maxlength'];
  }
  private _shadow: ShadowRoot;
  private _id: string;
  private _errorId: string;
  private _hintId: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-input');
    this._errorId = `${this._id}-error`;
    this._hintId = `${this._id}-hint`;
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  get value(): string {
    return this._shadow.querySelector('input')?.value ?? this.getAttribute('value') ?? '';
  }
  set value(v: string) {
    const el = this._shadow.querySelector('input');
    if (el) el.value = v;
    this.setAttribute('value', v);
  }

  private _render() {
    const label = this.getAttribute('label') ?? '';
    const type = this.getAttribute('type') ?? 'text';
    const value = this.getAttribute('value') ?? '';
    const placeholder = this.getAttribute('placeholder') ?? '';
    const name = this.getAttribute('name') ?? '';
    const size = this.getAttribute('size') ?? 'md';
    const disabled = this.hasAttribute('disabled');
    const readonly = this.hasAttribute('readonly');
    const required = this.hasAttribute('required');
    const error = this.getAttribute('error') ?? '';
    const hint = this.getAttribute('hint') ?? '';
    const maxlength = this.getAttribute('maxlength') ?? '';

    const sizeStyles: Record<string, { padding: string; fontSize: string; height: string }> = {
      sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem', height: '2rem' },
      md: { padding: '0.5rem 0.875rem',  fontSize: '1rem',     height: '2.5rem' },
      lg: { padding: '0.625rem 1rem',    fontSize: '1.125rem', height: '3rem' },
    };
    const s = sizeStyles[size] ?? sizeStyles['md']!;

    const describedBy = [error ? this._errorId : '', hint ? this._hintId : '']
      .filter(Boolean).join(' ');

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .field { display: flex; flex-direction: column; gap: 0.375rem; }
      .label {
        display: flex; align-items: center; gap: 0.25rem;
        font-size: var(--bq-font-size-sm,0.875rem);
        font-weight: var(--bq-font-weight-medium,500);
        color: var(--bq-text-base,#0f172a);
        font-family: var(--bq-font-family-sans);
      }
      .required-mark { color: var(--bq-color-danger-600,#dc2626); }

      .input-wrap {
        display: flex; align-items: center;
        border: 1.5px solid ${error ? 'var(--bq-color-danger-500,#ef4444)' : 'var(--bq-border-emphasis,#cbd5e1)'};
        border-radius: var(--bq-radius-lg,0.5rem);
        background: var(--bq-bg-base,#fff);
        transition: border-color var(--bq-duration-fast) var(--bq-easing-standard),
                    box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
        overflow: hidden;
      }
      .input-wrap:focus-within {
        border-color: ${error ? 'var(--bq-color-danger-500,#ef4444)' : 'var(--bq-border-focus,#2563eb)'};
        box-shadow: ${error ? 'var(--bq-focus-ring-danger)' : 'var(--bq-focus-ring)'};
      }
      .input-wrap--disabled { opacity: 0.5; cursor: not-allowed; background: var(--bq-bg-muted,#f1f5f9); }

      .slot-wrap { display: flex; align-items: center; padding: 0 0.5rem; color: var(--bq-text-muted,#475569); }
      .slot-wrap:empty { display: none; }

      input {
        flex: 1; border: none; outline: none; background: transparent;
        color: var(--bq-text-base,#0f172a);
        font-family: var(--bq-font-family-sans);
        font-size: ${s.fontSize};
        padding: ${s.padding};
        min-height: ${s.height};
        width: 100%;
      }
      input::placeholder { color: var(--bq-text-subtle,#94a3b8); }
      input:disabled { cursor: not-allowed; }

      .hint { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); font-family: var(--bq-font-family-sans); }
      .error-msg { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-color-danger-600,#dc2626); font-family: var(--bq-font-family-sans); }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div class="field" part="field">
        ${label ? `
          <label class="label" for="${this._id}" part="label">
            ${label}
            ${required ? '<span class="required-mark" aria-hidden="true">*</span>' : ''}
          </label>
        ` : ''}
        <div class="input-wrap ${disabled ? 'input-wrap--disabled' : ''}" part="input-wrap">
          <span class="slot-wrap" part="prefix"><slot name="prefix"></slot></span>
          <input
            part="input"
            id="${this._id}"
            type="${type}"
            name="${name}"
            placeholder="${placeholder}"
            value="${value}"
            ${maxlength ? `maxlength="${maxlength}"` : ''}
            ${disabled ? 'disabled' : ''}
            ${readonly ? 'readonly' : ''}
            ${required ? 'required' : ''}
            aria-invalid="${!!error}"
            ${describedBy ? `aria-describedby="${describedBy}"` : ''}
            ${required ? 'aria-required="true"' : ''}
          />
          <span class="slot-wrap" part="suffix"><slot name="suffix"></slot></span>
        </div>
        ${error ? `<span class="error-msg" id="${this._errorId}" role="alert" part="error">${error}</span>` : ''}
        ${hint && !error ? `<span class="hint" id="${this._hintId}" part="hint">${hint}</span>` : ''}
      </div>
    `;

    const input = this._shadow.querySelector('input');
    if (input) {
      input.addEventListener('input', () => dispatch(this, 'bq-input', { value: input.value }));
      input.addEventListener('change', () => dispatch(this, 'bq-change', { value: input.value }));
      input.addEventListener('focus', () => dispatch(this, 'bq-focus'));
      input.addEventListener('blur', () => dispatch(this, 'bq-blur'));
    }
  }
}

export function registerBqInput(prefix = 'bq'): string {
  const tag = `${prefix}-input`;
  if (!customElements.get(tag)) customElements.define(tag, BqInput);
  return tag;
}
