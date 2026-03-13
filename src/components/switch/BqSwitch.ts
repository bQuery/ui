import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';
import { t } from '../../i18n/index.js';

/**
 * Toggle switch component.
 * @element bq-switch
 * @prop {string}  label
 * @prop {string}  name
 * @prop {boolean} checked
 * @prop {boolean} disabled
 * @prop {string}  size - sm | md | lg
 * @fires bq-change - { checked }
 */
export class BqSwitch extends HTMLElement {
  static get observedAttributes() { return ['label','name','checked','disabled','size']; }
  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-switch');
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  get checked(): boolean { return this.hasAttribute('checked'); }
  set checked(v: boolean) { v ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }

  private _render() {
    const label = this.getAttribute('label') ?? '';
    const name = this.getAttribute('name') ?? '';
    const checked = this.hasAttribute('checked');
    const disabled = this.hasAttribute('disabled');
    const size = this.getAttribute('size') ?? 'md';

    const sizeMap: Record<string, { w: string; h: string; thumb: string; offset: string }> = {
      sm: { w: '2rem',    h: '1.125rem', thumb: '0.875rem', offset: '0.9rem' },
      md: { w: '2.5rem',  h: '1.375rem', thumb: '1.125rem', offset: '1.125rem' },
      lg: { w: '3rem',    h: '1.625rem', thumb: '1.375rem', offset: '1.375rem' },
    };
    const s = sizeMap[size] ?? sizeMap['md']!;

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: inline-block; }
      .wrapper {
        display: inline-flex; align-items: center; gap: 0.5rem;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        opacity: ${disabled ? '0.5' : '1'};
        font-family: var(--bq-font-family-sans);
        user-select: none;
      }
      .switch-wrap { position: relative; display: inline-flex; }
      input[type="checkbox"] {
        position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
      }
      .track {
        width: ${s.w}; height: ${s.h};
        border-radius: var(--bq-radius-full,9999px);
        background: ${checked ? 'var(--bq-color-primary-600,#2563eb)' : 'var(--bq-color-secondary-300,#cbd5e1)'};
        transition: background var(--bq-duration-fast) var(--bq-easing-standard);
        display: flex; align-items: center;
        padding: 0.125rem;
        pointer-events: none;
      }
      .thumb {
        width: ${s.thumb}; height: ${s.thumb};
        border-radius: var(--bq-radius-full,9999px);
        background: #fff;
        box-shadow: var(--bq-shadow-sm);
        transform: translateX(${checked ? s.offset : '0'});
        transition: transform var(--bq-duration-fast) var(--bq-easing-spring,cubic-bezier(0.34,1.56,0.64,1));
      }
      input:focus-visible ~ .track { box-shadow: var(--bq-focus-ring); }
      .label-text { font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500); color: var(--bq-text-base,#0f172a); }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <label class="wrapper" part="wrapper">
        <span class="switch-wrap">
          <input
            type="checkbox"
            id="${this._id}"
            name="${name}"
            ${checked ? 'checked' : ''}
            ${disabled ? 'disabled' : ''}
            role="switch"
            aria-checked="${checked}"
            aria-label="${label || t('common.open')}"
          />
          <span class="track" part="track" aria-hidden="true">
            <span class="thumb" part="thumb"></span>
          </span>
        </span>
        ${label ? `<span class="label-text">${label}</span>` : ''}
      </label>
    `;

    const input = this._shadow.querySelector('input');
    if (input) {
      input.addEventListener('change', () => {
        input.checked ? this.setAttribute('checked', '') : this.removeAttribute('checked');
        dispatch(this, 'bq-change', { checked: input.checked });
      });
    }
  }
}

export function registerBqSwitch(prefix = 'bq'): string {
  const tag = `${prefix}-switch`;
  if (!customElements.get(tag)) customElements.define(tag, BqSwitch);
  return tag;
}
