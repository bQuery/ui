/**
 * Dialog / modal overlay.
 * @element bq-dialog
 * @prop {boolean} open
 * @prop {string}  title
 * @prop {string}  size        - sm | md | lg | xl | full
 * @prop {boolean} dismissible - Show close button
 * @slot        - Dialog body
 * @slot footer - Dialog footer actions
 * @fires bq-close
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';
import { trapFocus, uniqueId } from '../../utils/dom.js';
import { t } from '../../i18n/index.js';

type BqDialogProps = { open: boolean; title: string; size: string; dismissible: boolean };
type BqDialogState = { titleId: string };

const definition: ComponentDefinition<BqDialogProps, BqDialogState> = {
  props: {
    open:       { type: Boolean, default: false },
    title:      { type: String, default: '' },
    size:       { type: String, default: 'md' },
    dismissible:{ type: Boolean, default: true },
  },
  state: {
    titleId: '',
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    :host(:not([open])) .overlay { display: none; }
    .overlay {
      position: fixed; inset: 0; z-index: var(--bq-z-modal,400);
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      padding: var(--bq-space-4,1rem);
      animation: fadeIn var(--bq-duration-normal,200ms) var(--bq-easing-decelerate);
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .dialog {
      background: var(--bq-bg-base,#fff); border-radius: var(--bq-radius-xl,0.75rem);
      box-shadow: var(--bq-shadow-xl); width: 100%;
      max-height: calc(100vh - 4rem); display: flex; flex-direction: column;
      animation: scaleIn var(--bq-duration-normal,200ms) var(--bq-easing-spring);
      font-family: var(--bq-font-family-sans); overflow: hidden;
    }
    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .dialog[data-size="sm"] { max-width: 28rem; }
    .dialog[data-size="md"] { max-width: 36rem; }
    .dialog[data-size="lg"] { max-width: 48rem; }
    .dialog[data-size="xl"] { max-width: 64rem; }
    .dialog[data-size="full"] { max-width: 100vw; max-height: 100vh; border-radius: 0; }
    .header { display: flex; align-items: center; justify-content: space-between; padding: var(--bq-space-5,1.25rem) var(--bq-space-6,1.5rem); border-bottom: 1px solid var(--bq-border-base,#e2e8f0); flex-shrink: 0; }
    .header-title { font-size: var(--bq-font-size-lg,1.125rem); font-weight: var(--bq-font-weight-semibold,600); color: var(--bq-text-base,#0f172a); margin: 0; flex: 1; }
    .close-btn { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; background: none; border: none; cursor: pointer; color: var(--bq-text-muted,#475569); border-radius: var(--bq-radius-md,0.375rem); font-size: 1rem; flex-shrink: 0; transition: background var(--bq-duration-fast); }
    .close-btn:hover { background: var(--bq-bg-muted,#f1f5f9); }
    .close-btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .body { padding: var(--bq-space-6,1.5rem); overflow-y: auto; flex: 1; color: var(--bq-text-muted,#475569); font-size: var(--bq-font-size-md,1rem); line-height: var(--bq-line-height-relaxed,1.625); }
    .footer { padding: var(--bq-space-4,1rem) var(--bq-space-6,1.5rem); border-top: 1px solid var(--bq-border-base,#e2e8f0); display: flex; align-items: center; justify-content: flex-end; gap: var(--bq-space-3,0.75rem); flex-shrink: 0; background: var(--bq-bg-subtle,#f8fafc); }
    @media (prefers-reduced-motion: reduce) {
      .overlay, .dialog { animation: none; }
      .close-btn { transition: none; }
    }
  `,
  connected() {
    type BQEl = HTMLElement & { setState(k: 'titleId', v: string): void; getState<T>(k: string): T };
    const self = this as unknown as BQEl;
    if (!self.getState<string>('titleId')) self.setState('titleId', uniqueId('bq-dlg-title'));
    // Escape key handler
    const kh = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape' && self.hasAttribute('open')) close();
    };
    // Click-outside handler
    const oh = (e: Event) => {
      if ((e.target as Element).classList.contains('overlay')) close();
    };
    const close = () => {
      self.removeAttribute('open');
      self.dispatchEvent(new CustomEvent('bq-close', { bubbles: true, composed: true }));
    };
    const ch = (e: Event) => { if ((e.target as Element).closest('.close-btn')) close(); };
    (self as unknown as Record<string, unknown>)['_kh'] = kh;
    (self as unknown as Record<string, unknown>)['_oh'] = oh;
    (self as unknown as Record<string, unknown>)['_ch'] = ch;
    document.addEventListener('keydown', kh);
    self.shadowRoot?.addEventListener('click', oh);
    self.shadowRoot?.addEventListener('click', ch);
  },
  disconnected() {
    const s = this as unknown as Record<string, unknown>;
    const focusRaf = s['_focusRaf'] as number | undefined;
    if (focusRaf !== undefined) cancelAnimationFrame(focusRaf);
    const releaseFocus = s['_releaseFocus'] as (() => void) | undefined;
    if (releaseFocus) releaseFocus();
    const prev = s['_previousFocus'] as HTMLElement | undefined;
    if (prev && typeof prev.focus === 'function') prev.focus();
    delete s['_previousFocus'];
    delete s['_focusRaf'];
    delete s['_releaseFocus'];
    const kh = s['_kh'] as EventListener | undefined;
    if (kh) document.removeEventListener('keydown', kh);
    const oh = s['_oh'] as EventListener | undefined;
    if (oh) this.shadowRoot?.removeEventListener('click', oh);
    const ch = s['_ch'] as EventListener | undefined;
    if (ch) this.shadowRoot?.removeEventListener('click', ch);
  },
  updated() {
    const s = this as unknown as Record<string, unknown>;
    const releaseFocus = s['_releaseFocus'] as (() => void) | undefined;
    if (this.hasAttribute('open')) {
      // Store the previously focused element for restoration on close
      if (!s['_previousFocus']) {
        s['_previousFocus'] = document.activeElement as HTMLElement | null;
      }
      const dialog = this.shadowRoot?.querySelector('.dialog') as HTMLElement | null;
      if (dialog) {
        releaseFocus?.();
        s['_releaseFocus'] = trapFocus(dialog);
        const focusRaf = s['_focusRaf'] as number | undefined;
        if (focusRaf !== undefined) cancelAnimationFrame(focusRaf);
        s['_focusRaf'] = requestAnimationFrame(() => {
          delete s['_focusRaf'];
          if (!this.hasAttribute('open') || !this.isConnected) return;
          const focusable = dialog.querySelector<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          (focusable ?? dialog).focus();
        });
      }
    } else {
      const focusRaf = s['_focusRaf'] as number | undefined;
      if (focusRaf !== undefined) cancelAnimationFrame(focusRaf);
      delete s['_focusRaf'];
      releaseFocus?.();
      delete s['_releaseFocus'];
      // Restore focus to the element that was focused before opening
      const prev = s['_previousFocus'] as HTMLElement | undefined;
      if (prev && typeof prev.focus === 'function') {
        prev.focus();
      }
      delete s['_previousFocus'];
    }
  },
  render({ props, state }) {
    const titleId = state.titleId || 'bq-dlg-title';
    return html`
      <div part="overlay" class="overlay" role="presentation">
        <div part="dialog" class="dialog" data-size="${escapeHtml(props.size)}"
          role="dialog" aria-modal="true" aria-labelledby="${escapeHtml(titleId)}" tabindex="-1">
          <div class="header" part="header">
            <h2 class="header-title" id="${escapeHtml(titleId)}" part="title">${escapeHtml(props.title)}</h2>
            ${props.dismissible ? `<button class="close-btn" type="button" aria-label="${t('dialog.close')}" part="close">&#10005;</button>` : ''}
          </div>
          <div class="body" part="body"><slot></slot></div>
          <div class="footer" part="footer"><slot name="footer"></slot></div>
        </div>
      </div>
    `;
  },
};

component<BqDialogProps, BqDialogState>('bq-dialog', definition);
