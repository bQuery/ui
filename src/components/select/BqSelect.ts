import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';
import { t } from '../../i18n/index.js';

/**
 * Select / dropdown component.
 * @element bq-select
 * @prop {string}  label
 * @prop {string}  value
 * @prop {string}  placeholder
 * @prop {string}  name
 * @prop {string}  size       - sm | md | lg
 * @prop {boolean} disabled
 * @prop {boolean} required
 * @prop {string}  error
 * @prop {string}  hint
 * Options are passed as child <option> or <optgroup> elements projected into the shadow via <slot>.
 * @fires bq-change - { value }
 */
export class BqSelect extends HTMLElement {
  static get observedAttributes() {
    return ['label','value','placeholder','name','size','disabled','required','error','hint'];
  }
  private _shadow: ShadowRoot;
  private _id: string;
  private _errorId: string;
  private _hintId: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-select');
    this._errorId = `${this._id}-error`;
    this._hintId = `${this._id}-hint`;
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  get value(): string {
    return this._shadow.querySelector('select')?.value ?? this.getAttribute('value') ?? '';
  }

  private _render() {
    const label = this.getAttribute('label') ?? '';
    const value = this.getAttribute('value') ?? '';
    const placeholder = this.getAttribute('placeholder') ?? t('select.placeholder');
    const name = this.getAttribute('name') ?? '';
    const size = this.getAttribute('size') ?? 'md';
    const disabled = this.hasAttribute('disabled');
    const required = this.hasAttribute('required');
    const error = this.getAttribute('error') ?? '';
    const hint = this.getAttribute('hint') ?? '';

    const sizeStyles: Record<string, { padding: string; fontSize: string; height: string }> = {
      sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem', height: '2rem' },
      md: { padding: '0.5rem 0.875rem',  fontSize: '1rem',     height: '2.5rem' },
      lg: { padding: '0.625rem 1rem',    fontSize: '1.125rem', height: '3rem' },
    };
    const s = sizeStyles[size] ?? sizeStyles['md']!;
    const describedBy = [error ? this._errorId : '', hint ? this._hintId : ''].filter(Boolean).join(' ');

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .field { display: flex; flex-direction: column; gap: 0.375rem; }
      .label { font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500); color: var(--bq-text-base,#0f172a); font-family: var(--bq-font-family-sans); display: flex; align-items: center; gap: 0.25rem; }
      .required-mark { color: var(--bq-color-danger-600,#dc2626); }

      .select-wrap {
        position: relative;
        border: 1.5px solid ${error ? 'var(--bq-color-danger-500,#ef4444)' : 'var(--bq-border-emphasis,#cbd5e1)'};
        border-radius: var(--bq-radius-lg,0.5rem);
        background: var(--bq-bg-base,#fff);
        transition: border-color var(--bq-duration-fast), box-shadow var(--bq-duration-fast);
      }
      .select-wrap:focus-within {
        border-color: ${error ? 'var(--bq-color-danger-500)' : 'var(--bq-border-focus,#2563eb)'};
        box-shadow: ${error ? 'var(--bq-focus-ring-danger)' : 'var(--bq-focus-ring)'};
      }
      .arrow {
        position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
        pointer-events: none; color: var(--bq-text-muted,#475569); font-size: 0.75em;
      }
      select {
        width: 100%; appearance: none; border: none; outline: none;
        background: transparent;
        color: var(--bq-text-base,#0f172a);
        font-family: var(--bq-font-family-sans);
        font-size: ${s.fontSize};
        padding: ${s.padding};
        padding-right: 2.5rem;
        min-height: ${s.height};
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
      }
      select:disabled { opacity: 0.5; }
      .hint { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); font-family: var(--bq-font-family-sans); }
      .error-msg { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-color-danger-600,#dc2626); font-family: var(--bq-font-family-sans); }
    `;

    // Collect option elements from light DOM
    const options = Array.from(this.querySelectorAll('option'))
      .map((o) => `<option value="${o.value}" ${o.value === value ? 'selected' : ''} ${o.disabled ? 'disabled' : ''}>${o.textContent}</option>`)
      .join('');

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div class="field" part="field">
        ${label ? `<label class="label" for="${this._id}" part="label">${label}${required ? '<span class="required-mark" aria-hidden="true">*</span>' : ''}</label>` : ''}
        <div class="select-wrap" part="select-wrap">
          <select
            part="select"
            id="${this._id}"
            name="${name}"
            ${disabled ? 'disabled' : ''}
            ${required ? 'required' : ''}
            aria-invalid="${!!error}"
            ${describedBy ? `aria-describedby="${describedBy}"` : ''}
          >
            ${!value ? `<option value="" disabled selected hidden>${placeholder}</option>` : ''}
            ${options}
          </select>
          <span class="arrow" aria-hidden="true">▾</span>
        </div>
        ${error ? `<span class="error-msg" id="${this._errorId}" role="alert" part="error">${error}</span>` : ''}
        ${hint && !error ? `<span class="hint" id="${this._hintId}" part="hint">${hint}</span>` : ''}
      </div>
    `;

    this._shadow.querySelector('select')?.addEventListener('change', (e) => {
      const sel = e.target as HTMLSelectElement;
      this.setAttribute('value', sel.value);
      dispatch(this, 'bq-change', { value: sel.value });
    });
  }
}

export function registerBqSelect(prefix = 'bq'): string {
  const tag = `${prefix}-select`;
  if (!customElements.get(tag)) customElements.define(tag, BqSelect);
  return tag;
}
