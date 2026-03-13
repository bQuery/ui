import { getBaseStyles } from '../../utils/styles.js';

/**
 * Skeleton loading placeholder.
 * @element bq-skeleton
 * @prop {string} variant - text | circle | rect
 * @prop {string} width
 * @prop {string} height
 * @prop {number} lines   - Number of text lines (for text variant)
 */
export class BqSkeleton extends HTMLElement {
  static get observedAttributes() { return ['variant', 'width', 'height', 'lines']; }
  private _shadow: ShadowRoot;
  constructor() { super(); this._shadow = this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const variant = this.getAttribute('variant') ?? 'rect';
    const width = this.getAttribute('width');
    const height = this.getAttribute('height');
    const lines = parseInt(this.getAttribute('lines') ?? '1', 10);

    const baseStyles = `
      ${getBaseStyles()}
      :host { display: block; }
      .skeleton {
        background: linear-gradient(90deg,
          var(--bq-color-secondary-200,#e2e8f0) 25%,
          var(--bq-color-secondary-100,#f1f5f9) 50%,
          var(--bq-color-secondary-200,#e2e8f0) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s ease-in-out infinite;
        border-radius: var(--bq-radius-md,0.375rem);
      }
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .skeleton--circle { border-radius: var(--bq-radius-full,9999px); }
      .skeleton--line { height: 1em; margin-bottom: 0.5em; }
      .skeleton--line:last-child { margin-bottom: 0; width: 75%; }
    `;

    let content = '';
    if (variant === 'text') {
      const lineHtml = Array.from({ length: lines }, () => `<div class="skeleton skeleton--line"></div>`).join('');
      content = `<div role="status" aria-busy="true" aria-label="Loading…" style="${width ? `width:${width}` : ''}">${lineHtml}</div>`;
    } else {
      const w = width ?? (variant === 'circle' ? '3rem' : '100%');
      const h = height ?? (variant === 'circle' ? '3rem' : '1.25rem');
      content = `<div class="skeleton ${variant === 'circle' ? 'skeleton--circle' : ''}" role="status" aria-busy="true" aria-label="Loading…" style="width:${w};height:${h}"></div>`;
    }

    this._shadow.innerHTML = `<style>${baseStyles}</style>${content}`;
  }
}

export function registerBqSkeleton(prefix = 'bq'): string {
  const tag = `${prefix}-skeleton`;
  if (!customElements.get(tag)) customElements.define(tag, BqSkeleton);
  return tag;
}
