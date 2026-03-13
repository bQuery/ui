import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, trapFocus, uniqueId } from '../../utils/dom.js';
import { t } from '../../i18n/index.js';

/**
 * Drawer / side panel component.
 * @element bq-drawer
 * @prop {boolean} open
 * @prop {string}  title
 * @prop {string}  placement - left | right | top | bottom
 * @prop {string}  size      - sm | md | lg | full
 * @slot - Drawer content
 * @slot footer
 * @fires bq-close
 */
export class BqDrawer extends HTMLElement {
  static get observedAttributes() { return ['open','title','placement','size']; }
  private _shadow: ShadowRoot;
  private _id: string;
  private _cleanup?: () => void;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-drawer');
  }

  connectedCallback() {
    this._render();
    document.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback() {
    this._cleanup?.();
    document.removeEventListener('keydown', this._handleKeyDown);
  }

  attributeChangedCallback() {
    this._render();
    if (this.hasAttribute('open')) {
      requestAnimationFrame(() => {
        const drawer = this._shadow.querySelector('.drawer') as HTMLElement | null;
        if (drawer) { this._cleanup?.(); this._cleanup = trapFocus(drawer); }
      });
    } else { this._cleanup?.(); }
  }

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.hasAttribute('open')) this._close();
  };

  private _close() {
    this.removeAttribute('open');
    dispatch(this, 'bq-close');
  }

  private _render() {
    const open = this.hasAttribute('open');
    const title = this.getAttribute('title') ?? '';
    const placement = this.getAttribute('placement') ?? 'right';
    const size = this.getAttribute('size') ?? 'md';

    const isHorizontal = placement === 'left' || placement === 'right';
    const sizeMap: Record<string, string> = { sm: '18rem', md: '24rem', lg: '32rem', full: '100%' };
    const dim = sizeMap[size] ?? sizeMap['md'];

    const positionStyles: Record<string, string> = {
      right:  `right: 0; top: 0; bottom: 0; width: ${dim}; transform: translateX(${open ? '0' : '100%'});`,
      left:   `left: 0; top: 0; bottom: 0; width: ${dim}; transform: translateX(${open ? '0' : '-100%'});`,
      top:    `top: 0; left: 0; right: 0; height: ${dim}; transform: translateY(${open ? '0' : '-100%'});`,
      bottom: `bottom: 0; left: 0; right: 0; height: ${dim}; transform: translateY(${open ? '0' : '100%'});`,
    };

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .overlay {
        position: fixed; inset: 0; z-index: var(--bq-z-modal,400);
        background: rgba(0,0,0,0.5);
        opacity: ${open ? '1' : '0'};
        transition: opacity var(--bq-duration-normal) var(--bq-easing-standard);
        ${!open ? 'pointer-events: none;' : ''}
      }
      .drawer {
        position: fixed;
        ${positionStyles[placement] ?? positionStyles['right']}
        background: var(--bq-bg-base,#fff);
        box-shadow: var(--bq-shadow-xl);
        z-index: var(--bq-z-modal,400);
        display: flex; flex-direction: column;
        transition: transform var(--bq-duration-slow,300ms) var(--bq-easing-decelerate);
        font-family: var(--bq-font-family-sans);
        max-${isHorizontal ? 'width' : 'height'}: 100%;
      }
      .header {
        display: flex; align-items: center; justify-content: space-between;
        padding: var(--bq-space-5,1.25rem) var(--bq-space-6,1.5rem);
        border-bottom: 1px solid var(--bq-border-base,#e2e8f0);
        flex-shrink: 0;
      }
      .title { font-size: var(--bq-font-size-lg,1.125rem); font-weight: var(--bq-font-weight-semibold,600); color: var(--bq-text-base,#0f172a); }
      .close-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 2rem; height: 2rem; background: none; border: none; cursor: pointer;
        color: var(--bq-text-muted,#475569); border-radius: var(--bq-radius-md,0.375rem);
      }
      .close-btn:hover { background: var(--bq-bg-muted,#f1f5f9); }
      .close-btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
      .body { flex: 1; overflow-y: auto; padding: var(--bq-space-6,1.5rem); }
      .footer {
        padding: var(--bq-space-4,1rem) var(--bq-space-6,1.5rem);
        border-top: 1px solid var(--bq-border-base,#e2e8f0);
        background: var(--bq-bg-subtle,#f8fafc);
        flex-shrink: 0;
      }
      .footer:empty { display: none; }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div part="overlay" class="overlay"></div>
      <div
        part="drawer"
        class="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="${title || t('drawer.close')}"
        tabindex="-1"
      >
        <div class="header" part="header">
          <span class="title" part="title">${title}</span>
          <button class="close-btn" aria-label="${t('drawer.close')}" type="button" part="close">✕</button>
        </div>
        <div class="body" part="body"><slot></slot></div>
        <div class="footer" part="footer"><slot name="footer"></slot></div>
      </div>
    `;

    this._shadow.querySelector('.overlay')?.addEventListener('click', () => this._close());
    this._shadow.querySelector('.close-btn')?.addEventListener('click', () => this._close());
  }
}

export function registerBqDrawer(prefix = 'bq'): string {
  const tag = `${prefix}-drawer`;
  if (!customElements.get(tag)) customElements.define(tag, BqDrawer);
  return tag;
}
