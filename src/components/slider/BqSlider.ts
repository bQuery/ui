import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';

/**
 * Slider / range input component.
 * @element bq-slider
 * @prop {number}  value   - Current value
 * @prop {number}  min     - Minimum value (default 0)
 * @prop {number}  max     - Maximum value (default 100)
 * @prop {number}  step    - Step increment (default 1)
 * @prop {string}  label   - Accessible label
 * @prop {boolean} disabled
 * @prop {boolean} showValue - show current value tooltip
 * @fires bq-change - { value }
 * @fires bq-input  - { value }
 */
export class BqSlider extends HTMLElement {
  static get observedAttributes() { return ['value','min','max','step','label','disabled','show-value']; }
  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-slider');
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const value = parseFloat(this.getAttribute('value') ?? '50');
    const min = parseFloat(this.getAttribute('min') ?? '0');
    const max = parseFloat(this.getAttribute('max') ?? '100');
    const step = parseFloat(this.getAttribute('step') ?? '1');
    const label = this.getAttribute('label') ?? 'Slider';
    const disabled = this.hasAttribute('disabled');
    const showValue = this.hasAttribute('show-value');
    const pct = ((value - min) / (max - min)) * 100;

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .slider-wrap {
        display: flex; align-items: center; gap: 0.75rem;
        opacity: ${disabled ? '0.5' : '1'};
        font-family: var(--bq-font-family-sans);
      }
      .track-wrap { flex: 1; position: relative; height: 1.5rem; display: flex; align-items: center; }
      .track {
        position: absolute; left: 0; right: 0; height: 0.375rem;
        border-radius: var(--bq-radius-full,9999px);
        background: var(--bq-color-secondary-200,#e2e8f0);
        overflow: hidden;
      }
      .fill {
        height: 100%;
        background: var(--bq-color-primary-600,#2563eb);
        width: ${pct}%;
        transition: width var(--bq-duration-fast) var(--bq-easing-standard);
      }
      input[type="range"] {
        position: absolute; left: 0; right: 0;
        width: 100%; height: 100%; opacity: 0;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        margin: 0;
      }
      .thumb-track {
        position: absolute; left: 0; right: 0; pointer-events: none;
        display: flex; align-items: center;
        padding: 0 0.375rem;
      }
      .thumb {
        width: 1.125rem; height: 1.125rem;
        border-radius: var(--bq-radius-full,9999px);
        background: #fff;
        border: 2px solid var(--bq-color-primary-600,#2563eb);
        box-shadow: var(--bq-shadow-sm);
        margin-left: calc(${pct}% - 0.5625rem);
        transition: margin-left var(--bq-duration-fast) var(--bq-easing-standard);
      }
      input:focus-visible ~ .thumb-track .thumb { box-shadow: var(--bq-focus-ring); }
      .value-label { font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-semibold,600); color: var(--bq-text-base,#0f172a); min-width: 2rem; text-align: right; }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div class="slider-wrap" part="wrapper">
        <div class="track-wrap">
          <div class="track" part="track"><div class="fill" part="fill"></div></div>
          <input
            type="range"
            id="${this._id}"
            min="${min}"
            max="${max}"
            step="${step}"
            value="${value}"
            ${disabled ? 'disabled' : ''}
            aria-label="${label}"
            aria-valuemin="${min}"
            aria-valuemax="${max}"
            aria-valuenow="${value}"
            aria-valuetext="${label}: ${value}"
          />
          <div class="thumb-track" aria-hidden="true"><div class="thumb" part="thumb"></div></div>
        </div>
        ${showValue ? `<span class="value-label" part="value">${value}</span>` : ''}
      </div>
    `;

    const input = this._shadow.querySelector('input') as HTMLInputElement | null;
    const fill = this._shadow.querySelector('.fill') as HTMLElement | null;
    const thumb = this._shadow.querySelector('.thumb') as HTMLElement | null;
    const valueLabel = this._shadow.querySelector('.value-label');

    const update = () => {
      if (!input) return;
      const v = parseFloat(input.value);
      const p = ((v - min) / (max - min)) * 100;
      if (fill) fill.style.width = `${p}%`;
      if (thumb) thumb.style.marginLeft = `calc(${p}% - 0.5625rem)`;
      if (valueLabel) valueLabel.textContent = String(v);
      input.setAttribute('aria-valuenow', String(v));
    };

    input?.addEventListener('input', () => {
      update();
      dispatch(this, 'bq-input', { value: parseFloat(input?.value ?? '0') });
    });
    input?.addEventListener('change', () => {
      dispatch(this, 'bq-change', { value: parseFloat(input?.value ?? '0') });
    });
  }
}

export function registerBqSlider(prefix = 'bq'): string {
  const tag = `${prefix}-slider`;
  if (!customElements.get(tag)) customElements.define(tag, BqSlider);
  return tag;
}
