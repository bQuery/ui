import { getBaseStyles } from '../../utils/styles.js';
import { uniqueId } from '../../utils/dom.js';

/**
 * Avatar component.
 * @element bq-avatar
 * @prop {string} src     - Image URL
 * @prop {string} alt     - Alt text / initials fallback
 * @prop {string} size    - xs | sm | md | lg | xl
 * @prop {string} shape   - circle | square
 * @prop {string} status  - online | away | busy | offline
 * @slot - Custom avatar content
 */
export class BqAvatar extends HTMLElement {
  static get observedAttributes() { return ['src', 'alt', 'size', 'shape', 'status']; }
  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-avatar');
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _getInitials(alt: string): string {
    const words = alt.trim().split(/\s+/);
    if (words.length === 0 || !words[0]) return '?';
    if (words.length === 1) return (words[0]?.[0] ?? '').toUpperCase();
    return ((words[0]?.[0] ?? '') + (words[words.length - 1]?.[0] ?? '')).toUpperCase();
  }

  private _render() {
    const src = this.getAttribute('src');
    const alt = this.getAttribute('alt') ?? '';
    const size = this.getAttribute('size') ?? 'md';
    const shape = this.getAttribute('shape') ?? 'circle';
    const status = this.getAttribute('status');

    const sizeMap: Record<string, string> = {
      xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem', xl: '4rem',
    };
    const dim = sizeMap[size] ?? sizeMap['md'];
    const radius = shape === 'square' ? 'var(--bq-radius-lg,0.5rem)' : 'var(--bq-radius-full,9999px)';

    const statusColors: Record<string, string> = {
      online: '#22c55e', away: '#f59e0b', busy: '#ef4444', offline: '#94a3b8',
    };

    const styles = `
      ${getBaseStyles()}
      :host { display: inline-block; position: relative; }
      .avatar {
        width: ${dim}; height: ${dim};
        border-radius: ${radius};
        overflow: hidden;
        display: flex; align-items: center; justify-content: center;
        background: var(--bq-color-primary-100,#dbeafe);
        color: var(--bq-color-primary-700,#1d4ed8);
        font-weight: var(--bq-font-weight-semibold,600);
        font-size: calc(${dim} * 0.38);
        font-family: var(--bq-font-family-sans);
        user-select: none;
        flex-shrink: 0;
      }
      .avatar img { width: 100%; height: 100%; object-fit: cover; }
      ${status ? `
      .status {
        position: absolute; bottom: 0; right: 0;
        width: calc(${dim} * 0.28); height: calc(${dim} * 0.28);
        border-radius: var(--bq-radius-full,9999px);
        background: ${statusColors[status] ?? '#94a3b8'};
        border: 2px solid var(--bq-bg-base,#fff);
      }` : ''}
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div part="avatar" class="avatar" role="img" aria-label="${alt}" id="${this._id}">
        ${src
          ? `<img src="${src}" alt="${alt}" />`
          : `<slot>${this._getInitials(alt)}</slot>`}
      </div>
      ${status ? `<span part="status" class="status" title="${status}" aria-label="${status}"></span>` : ''}
    `;
  }
}

export function registerBqAvatar(prefix = 'bq'): string {
  const tag = `${prefix}-avatar`;
  if (!customElements.get(tag)) customElements.define(tag, BqAvatar);
  return tag;
}
