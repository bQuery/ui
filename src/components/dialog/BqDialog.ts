import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, trapFocus, uniqueId } from '../../utils/dom.js';
import { t } from '../../i18n/index.js';

/**
 * Dialog / modal component.
 * @element bq-dialog
 * @prop {boolean} open
 * @prop {string}  title
 * @prop {string}  size    - sm | md | lg | xl | full
 * @prop {boolean} dismissible - show close button
 * @slot - Dialog content
 * @slot footer - Dialog footer
 * @fires bq-close
 * @fires bq-confirm
 */
export class BqDialog extends HTMLElement {
  static get observedAttributes() { return ['open','title','size','dismissible']; }
  private _shadow: ShadowRoot;
  private _id: string;
  private _titleId: string;
  private _cleanup?: () => void;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-dialog');
    this._titleId = `${this._id}-title`;
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
        const dialog = this._shadow.querySelector('.dialog') as HTMLElement | null;
        if (dialog) {
          this._cleanup?.();
          this._cleanup = trapFocus(dialog);
          (dialog.querySelector<HTMLElement>('button,input,[tabindex="0"]') ?? dialog).focus();
        }
      });
    } else {
      this._cleanup?.();
    }
  }

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.hasAttribute('open')) {
      this._close();
    }
  };

  private _close() {
    this.removeAttribute('open');
    dispatch(this, 'bq-close');
  }

  private _render() {
    const open = this.hasAttribute('open');
    const title = this.getAttribute('title') ?? '';
    const size = this.getAttribute('size') ?? 'md';
    const dismissible = this.hasAttribute('dismissible') || !this.hasAttribute('no-dismiss');

    const sizeMap: Record<string, string> = {
      sm: '28rem', md: '36rem', lg: '48rem', xl: '64rem', full: '100vw',
    };
    const maxW = sizeMap[size] ?? sizeMap['md'];

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .overlay {
        position: fixed; inset: 0; z-index: var(--bq-z-modal,400);
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        padding: var(--bq-space-4,1rem);
        animation: fadeIn var(--bq-duration-normal,200ms) var(--bq-easing-decelerate);
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

      .dialog {
        background: var(--bq-bg-base,#fff);
        border-radius: var(--bq-radius-xl,0.75rem);
        box-shadow: var(--bq-shadow-xl);
        width: 100%;
        max-width: ${maxW === '100vw' ? '100vw' : maxW};
        max-height: calc(100vh - 4rem);
        display: flex; flex-direction: column;
        animation: scaleIn var(--bq-duration-normal,200ms) var(--bq-easing-spring);
        font-family: var(--bq-font-family-sans);
        overflow: hidden;
      }
      @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

      .header {
        display: flex; align-items: center; justify-content: space-between;
        padding: var(--bq-space-5,1.25rem) var(--bq-space-6,1.5rem);
        border-bottom: 1px solid var(--bq-border-base,#e2e8f0);
        flex-shrink: 0;
      }
      .header-title {
        font-size: var(--bq-font-size-lg,1.125rem);
        font-weight: var(--bq-font-weight-semibold,600);
        color: var(--bq-text-base,#0f172a);
        margin: 0;
        flex: 1;
      }
      .close-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 2rem; height: 2rem;
        background: none; border: none; cursor: pointer;
        color: var(--bq-text-muted,#475569);
        border-radius: var(--bq-radius-md,0.375rem);
        font-size: 1rem; flex-shrink: 0;
        transition: background var(--bq-duration-fast);
      }
      .close-btn:hover { background: var(--bq-bg-muted,#f1f5f9); }
      .close-btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }

      .body {
        padding: var(--bq-space-6,1.5rem);
        overflow-y: auto; flex: 1;
        color: var(--bq-text-muted,#475569);
        font-size: var(--bq-font-size-md,1rem);
        line-height: var(--bq-line-height-relaxed,1.625);
      }

      .footer {
        padding: var(--bq-space-4,1rem) var(--bq-space-6,1.5rem);
        border-top: 1px solid var(--bq-border-base,#e2e8f0);
        display: flex; align-items: center; justify-content: flex-end;
        gap: var(--bq-space-3,0.75rem);
        flex-shrink: 0;
        background: var(--bq-bg-subtle,#f8fafc);
      }
      .footer:empty { display: none; }
    `;

    if (!open) {
      this._shadow.innerHTML = `<style>${styles}</style>`;
      return;
    }

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div part="overlay" class="overlay" role="presentation">
        <div
          part="dialog"
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="${this._titleId}"
          tabindex="-1"
        >
          <div class="header" part="header">
            <h2 class="header-title" id="${this._titleId}" part="title">${title}</h2>
            ${dismissible ? `<button class="close-btn" aria-label="${t('dialog.close')}" type="button" part="close">✕</button>` : ''}
          </div>
          <div class="body" part="body"><slot></slot></div>
          <div class="footer" part="footer"><slot name="footer"></slot></div>
        </div>
      </div>
    `;

    // Overlay click to close
    this._shadow.querySelector('.overlay')?.addEventListener('click', (e) => {
      if (e.target === this._shadow.querySelector('.overlay')) this._close();
    });
    this._shadow.querySelector('.close-btn')?.addEventListener('click', () => this._close());
  }
}

export function registerBqDialog(prefix = 'bq'): string {
  const tag = `${prefix}-dialog`;
  if (!customElements.get(tag)) customElements.define(tag, BqDialog);
  return tag;
}
