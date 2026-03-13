import { getBaseStyles } from '../../utils/styles.js';

/**
 * Breadcrumbs navigation component.
 * @element bq-breadcrumbs
 * @prop {string} separator - Separator character (default: /)
 * @slot - <bq-breadcrumb-item> or <a> elements
 */
export class BqBreadcrumbs extends HTMLElement {
  static get observedAttributes() { return ['separator']; }
  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const separator = this.getAttribute('separator') ?? '/';

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .breadcrumbs {
        display: flex; align-items: center; flex-wrap: wrap;
        gap: 0; list-style: none; margin: 0; padding: 0;
        font-family: var(--bq-font-family-sans);
        font-size: var(--bq-font-size-sm,0.875rem);
      }

      ::slotted(a), ::slotted([data-breadcrumb]) {
        color: var(--bq-text-muted,#475569);
        text-decoration: none;
        transition: color var(--bq-duration-fast);
      }
      ::slotted(a:hover), ::slotted([data-breadcrumb]:hover) {
        color: var(--bq-color-primary-600,#2563eb);
        text-decoration: underline;
      }
      ::slotted([aria-current="page"]) {
        color: var(--bq-text-base,#0f172a);
        font-weight: var(--bq-font-weight-medium,500);
        pointer-events: none;
      }

      .sep {
        display: inline-flex; align-items: center;
        margin: 0 0.375rem;
        color: var(--bq-text-subtle,#94a3b8);
        user-select: none;
        aria-hidden: true;
      }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <nav aria-label="Breadcrumb" part="nav">
        <ol class="breadcrumbs" part="list">
          <slot></slot>
        </ol>
      </nav>
    `;

    // Inject separators between slotted items
    const slot = this._shadow.querySelector('slot');
    slot?.addEventListener('slotchange', () => {
      const items = slot.assignedElements({ flatten: true });
      items.forEach((item, i) => {
        if (i < items.length - 1) {
          if (!item.nextElementSibling?.classList.contains('bq-sep')) {
            const sep = document.createElement('span');
            sep.className = 'bq-sep';
            sep.setAttribute('aria-hidden', 'true');
            sep.style.cssText = 'display:inline-flex;align-items:center;margin:0 0.375rem;color:#94a3b8;user-select:none;';
            sep.textContent = separator;
            item.after(sep);
          }
        }
        if (i === items.length - 1) {
          item.setAttribute('aria-current', 'page');
        }
      });
    });
  }
}

export function registerBqBreadcrumbs(prefix = 'bq'): string {
  const tag = `${prefix}-breadcrumbs`;
  if (!customElements.get(tag)) customElements.define(tag, BqBreadcrumbs);
  return tag;
}
