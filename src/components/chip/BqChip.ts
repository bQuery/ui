import { getBaseStyles } from '../../utils/styles.js';
import { dispatch } from '../../utils/dom.js';

/**
 * Chip / Tag component.
 * @element bq-chip
 * @prop {string} variant   - default | primary | success | danger | warning
 * @prop {string} size      - sm | md | lg
 * @prop {boolean} removable
 * @prop {boolean} selected
 * @prop {boolean} disabled
 * @slot - Chip content
 * @fires bq-remove - fired when the remove button is clicked
 * @fires bq-select - fired when the chip is clicked (toggle)
 */
export class BqChip extends HTMLElement {
  static get observedAttributes() { return ['variant', 'size', 'removable', 'selected', 'disabled']; }
  private _shadow: ShadowRoot;
  constructor() { super(); this._shadow = this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const variant = this.getAttribute('variant') ?? 'default';
    const size = this.getAttribute('size') ?? 'md';
    const removable = this.hasAttribute('removable');
    const selected = this.hasAttribute('selected');
    const disabled = this.hasAttribute('disabled');

    const variantMap: Record<string, { bg: string; color: string; border: string }> = {
      default:  { bg: selected ? 'var(--bq-color-secondary-200)' : 'var(--bq-color-secondary-100)', color: 'var(--bq-color-secondary-700)', border: 'var(--bq-color-secondary-200)' },
      primary:  { bg: selected ? 'var(--bq-color-primary-200)'   : 'var(--bq-color-primary-100)',   color: 'var(--bq-color-primary-700)',   border: 'var(--bq-color-primary-300)' },
      success:  { bg: selected ? 'var(--bq-color-success-200)'   : 'var(--bq-color-success-100)',   color: 'var(--bq-color-success-700)',   border: 'var(--bq-color-success-300)' },
      danger:   { bg: selected ? 'var(--bq-color-danger-200)'    : 'var(--bq-color-danger-100)',    color: 'var(--bq-color-danger-700)',    border: 'var(--bq-color-danger-300)' },
      warning:  { bg: selected ? 'var(--bq-color-warning-200)'   : 'var(--bq-color-warning-100)',   color: 'var(--bq-color-warning-700)',   border: 'var(--bq-color-warning-300)' },
    };
    const v = variantMap[variant] ?? variantMap['default']!;

    const paddingMap: Record<string, string> = { sm: '0.2rem 0.5rem', md: '0.3rem 0.75rem', lg: '0.4rem 1rem' };
    const fontSizeMap: Record<string, string> = { sm: '0.75rem', md: '0.875rem', lg: '1rem' };

    const styles = `
      ${getBaseStyles()}
      :host { display: inline-flex; }
      .chip {
        display: inline-flex; align-items: center; gap: 0.375rem;
        padding: ${paddingMap[size] ?? paddingMap['md']};
        font-size: ${fontSizeMap[size] ?? fontSizeMap['md']};
        font-weight: var(--bq-font-weight-medium,500);
        border-radius: var(--bq-radius-full,9999px);
        border: 1.5px solid ${v.border};
        background: ${v.bg}; color: ${v.color};
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        opacity: ${disabled ? '0.5' : '1'};
        user-select: none;
        transition: background var(--bq-duration-fast) var(--bq-easing-standard);
      }
      .chip:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
      .remove-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 1em; height: 1em;
        background: none; border: none; cursor: pointer;
        color: inherit; padding: 0; border-radius: 50%;
        opacity: 0.7;
      }
      .remove-btn:hover { opacity: 1; background: rgba(0,0,0,0.1); }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <span
        part="chip"
        class="chip"
        role="option"
        aria-selected="${selected}"
        tabindex="${disabled ? '-1' : '0'}"
      >
        <slot></slot>
        ${removable ? `<button part="remove" class="remove-btn" aria-label="Remove" type="button">✕</button>` : ''}
      </span>
    `;

    this._shadow.querySelector('.chip')?.addEventListener('click', (e) => {
      if (disabled) return;
      if ((e.target as Element).closest('.remove-btn')) return;
      dispatch(this, 'bq-select', { selected: !selected });
    });
    this._shadow.querySelector('.remove-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!disabled) dispatch(this, 'bq-remove');
    });
    this._shadow.querySelector('.chip')?.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Enter' || ke.key === ' ') { ke.preventDefault(); dispatch(this, 'bq-select', { selected: !selected }); }
    });
  }
}

export function registerBqChip(prefix = 'bq'): string {
  const tag = `${prefix}-chip`;
  if (!customElements.get(tag)) customElements.define(tag, BqChip);
  return tag;
}
