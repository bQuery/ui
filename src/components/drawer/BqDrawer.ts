/**
 * Drawer / side panel overlay.
 * @element bq-drawer
 * @prop {boolean} open
 * @prop {string}  title
 * @prop {string}  placement - right | left | top | bottom
 * @prop {string}  size      - sm | md | lg | full
 * @slot        - Drawer body
 * @slot footer - Footer actions
 * @fires bq-close
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import type { OverlayFocusState } from '../../utils/dom.js';
import {
  cleanupOverlayFocus,
  uniqueId,
  updateOverlayFocus,
} from '../../utils/dom.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqDrawerProps = {
  open: boolean;
  title: string;
  placement: string;
  size: string;
};
type BqDrawerState = { titleId: string };

const definition: ComponentDefinition<BqDrawerProps, BqDrawerState> = {
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
    placement: { type: String, default: 'right' },
    size: { type: String, default: 'md' },
  },
  state: {
    titleId: '',
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    :host(:not([open])) .backdrop { display: none; }
    .backdrop {
      position: fixed; inset: 0; z-index: var(--bq-z-overlay,300);
      background: rgba(0,0,0,0.5);
      animation: fadeIn var(--bq-duration-normal) var(--bq-easing-decelerate);
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .drawer {
      position: fixed; z-index: calc(var(--bq-z-overlay,300) + 1);
      background: var(--bq-bg-base,#fff); box-shadow: var(--bq-shadow-xl);
      display: flex; flex-direction: column;
      font-family: var(--bq-font-family-sans);
    }
    .drawer[data-placement="right"]  { right: 0; top: 0; bottom: 0; animation: slideInRight var(--bq-duration-normal) var(--bq-easing-decelerate); }
    .drawer[data-placement="left"]   { left: 0; top: 0; bottom: 0; animation: slideInLeft var(--bq-duration-normal) var(--bq-easing-decelerate); }
    .drawer[data-placement="top"]    { top: 0; left: 0; right: 0; animation: slideInTop var(--bq-duration-normal) var(--bq-easing-decelerate); }
    .drawer[data-placement="bottom"] { bottom: 0; left: 0; right: 0; animation: slideInBottom var(--bq-duration-normal) var(--bq-easing-decelerate); }
    .drawer[data-placement="right"][data-size="sm"],  .drawer[data-placement="left"][data-size="sm"]  { width: 20rem; }
    .drawer[data-placement="right"][data-size="md"],  .drawer[data-placement="left"][data-size="md"]  { width: 28rem; }
    .drawer[data-placement="right"][data-size="lg"],  .drawer[data-placement="left"][data-size="lg"]  { width: 40rem; }
    .drawer[data-placement="right"][data-size="full"],.drawer[data-placement="left"][data-size="full"] { width: 100vw; }
    .drawer[data-placement="top"][data-size="sm"],    .drawer[data-placement="bottom"][data-size="sm"]    { height: 16rem; }
    .drawer[data-placement="top"][data-size="md"],    .drawer[data-placement="bottom"][data-size="md"]    { height: 22rem; }
    .drawer[data-placement="top"][data-size="lg"],    .drawer[data-placement="bottom"][data-size="lg"]    { height: 36rem; }
    @keyframes slideInRight  { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes slideInLeft   { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    @keyframes slideInTop    { from { transform: translateY(-100%); } to { transform: translateY(0); } }
    @keyframes slideInBottom { from { transform: translateY(100%); } to { transform: translateY(0); } }
    :host([data-closing]) .backdrop { animation: drwFadeOut var(--bq-duration-normal) var(--bq-easing-accelerate) forwards; }
    :host([data-closing]) .drawer[data-placement="right"]  { animation: slideOutRight var(--bq-duration-normal) var(--bq-easing-accelerate) forwards; }
    :host([data-closing]) .drawer[data-placement="left"]   { animation: slideOutLeft var(--bq-duration-normal) var(--bq-easing-accelerate) forwards; }
    :host([data-closing]) .drawer[data-placement="top"]    { animation: slideOutTop var(--bq-duration-normal) var(--bq-easing-accelerate) forwards; }
    :host([data-closing]) .drawer[data-placement="bottom"] { animation: slideOutBottom var(--bq-duration-normal) var(--bq-easing-accelerate) forwards; }
    @keyframes drwFadeOut { to { opacity: 0; } }
    @keyframes slideOutRight  { to { transform: translateX(100%); } }
    @keyframes slideOutLeft   { to { transform: translateX(-100%); } }
    @keyframes slideOutTop    { to { transform: translateY(-100%); } }
    @keyframes slideOutBottom { to { transform: translateY(100%); } }
    .header { display: flex; align-items: center; justify-content: space-between; padding: var(--bq-space-5,1.25rem) var(--bq-space-6,1.5rem); border-bottom: 1px solid var(--bq-border-base,#e2e8f0); flex-shrink: 0; }
    .title { font-size: var(--bq-font-size-lg,1.125rem); font-weight: var(--bq-font-weight-semibold,600); color: var(--bq-text-base,#0f172a); margin: 0; flex: 1; }
    .close-btn { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; background: none; border: none; cursor: pointer; color: var(--bq-text-muted,#475569); border-radius: var(--bq-radius-md,0.375rem); font-size: 1rem; transition: background var(--bq-duration-fast); }
    .close-btn:hover { background: var(--bq-bg-muted,#f1f5f9); }
    .close-btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .body { padding: var(--bq-space-6,1.5rem); overflow-y: auto; flex: 1; }
    .footer { padding: var(--bq-space-4,1rem) var(--bq-space-6,1.5rem); border-top: 1px solid var(--bq-border-base,#e2e8f0); display: flex; gap: var(--bq-space-3,0.75rem); justify-content: flex-end; flex-shrink: 0; background: var(--bq-bg-subtle,#f8fafc); }
    @media (prefers-reduced-motion: reduce) {
      .backdrop, .drawer { animation: none !important; }
      .close-btn { transition: none; }
    }
  `,
  connected() {
    type BQEl = HTMLElement & {
      setState(k: 'titleId', v: string): void;
      getState<T>(k: string): T;
    };
    const self = this as unknown as BQEl;
    if (!self.getState<string>('titleId'))
      self.setState('titleId', uniqueId('bq-drawer-title'));
    const close = () => {
      if (self.hasAttribute('data-closing')) return;
      const reducedMotion = self.ownerDocument.defaultView?.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      )?.matches;
      const finalize = () => {
        self.removeAttribute('data-closing');
        self.removeAttribute('open');
        self.dispatchEvent(
          new CustomEvent('bq-close', { bubbles: true, composed: true })
        );
      };
      if (reducedMotion) {
        finalize();
      } else {
        self.setAttribute('data-closing', '');
        setTimeout(finalize, 200);
      }
    };
    const kh = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape' && self.hasAttribute('open'))
        close();
    };
    const bh = (e: Event) => {
      if ((e.target as Element).classList.contains('backdrop')) close();
    };
    const ch = (e: Event) => {
      if ((e.target as Element).closest('.close-btn')) close();
    };
    const s = self as unknown as Record<string, unknown>;
    s['_kh'] = kh;
    s['_bh'] = bh;
    s['_ch'] = ch;
    document.addEventListener('keydown', kh);
    self.shadowRoot?.addEventListener('click', bh);
    self.shadowRoot?.addEventListener('click', ch);
  },
  disconnected() {
    const s = this as unknown as Record<string, unknown>;
    cleanupOverlayFocus(s as unknown as OverlayFocusState);
    const kh = s['_kh'] as EventListener | undefined;
    if (kh) document.removeEventListener('keydown', kh);
    const bh = s['_bh'] as EventListener | undefined;
    if (bh) this.shadowRoot?.removeEventListener('click', bh);
    const ch = s['_ch'] as EventListener | undefined;
    if (ch) this.shadowRoot?.removeEventListener('click', ch);
  },
  updated() {
    updateOverlayFocus(this, this as unknown as OverlayFocusState, '.drawer');
  },
  render({ props, state }) {
    const titleId = state.titleId || 'bq-drawer-title';
    return html`
      <div class="backdrop" part="backdrop" role="presentation">
        <div
          class="drawer"
          part="drawer"
          data-placement="${escapeHtml(props.placement)}"
          data-size="${escapeHtml(props.size)}"
          role="dialog"
          aria-modal="true"
          aria-labelledby="${escapeHtml(titleId)}"
          tabindex="-1"
        >
          <div class="header" part="header">
            <h2 class="title" id="${escapeHtml(titleId)}" part="title">
              ${escapeHtml(props.title)}
            </h2>
            <button
              class="close-btn"
              type="button"
              aria-label="${t('drawer.close')}"
              part="close"
            >
              &#10005;
            </button>
          </div>
          <div class="body" part="body"><slot></slot></div>
          <div class="footer" part="footer"><slot name="footer"></slot></div>
        </div>
      </div>
    `;
  },
};

component<BqDrawerProps, BqDrawerState>('bq-drawer', definition);
